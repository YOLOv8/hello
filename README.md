# Student Management System

基于 `Next.js 16` 的学生管理后台，支持管理员登录、学生列表、增删改查。

## 环境要求

项目只支持远程 `Turso` 数据库。无论是本地开发还是线上部署，都必须提供以下环境变量：

```bash
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
JWT_SECRET=replace-with-a-long-random-secret
```

## 本地开发

1. 安装依赖：

```bash
npm install
```

2. 复制环境变量：

```bash
cp .env.example .env
```

3. 填入可用的 Turso 数据库地址和 token。

4. 初始化远程数据库：

```bash
npm run seed
```

5. 启动开发环境：

```bash
npm run dev
```

默认管理员账号：

- 用户名：`admin`
- 密码：`admin123`

登录地址：`http://localhost:3000`

## 部署

推荐使用 `Vercel + Turso`。

原因：

- `Next.js 16` 在 `Vercel` 上兼容性最好。
- 当前项目包含登录接口和数据库写操作，不能做纯静态部署。
- 项目已经移除本地 SQLite 支持，统一使用远程 Turso。

### 1. 创建 Turso 数据库

安装 Turso CLI：

```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

登录：

```bash
turso auth login
```

创建数据库：

```bash
turso db create hello
```

获取数据库地址：

```bash
turso db show hello --url
```

创建 token：

```bash
turso db tokens create hello
```

### 2. 初始化数据库

在本地配置好 `.env` 后执行：

```bash
npm run seed
```

该命令会：

- 创建 `users` 和 `students` 表
- 写入默认管理员账号（若不存在）

### 3. 部署到 Vercel

将仓库推到 GitHub 后，在 Vercel 导入项目，并配置以下环境变量：

```bash
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
JWT_SECRET=replace-with-a-long-random-secret
```

构建配置保持默认：

- Install Command: `npm install`
- Build Command: `npm run build`

## 验证

本地建议执行：

```bash
npm run lint
npm run build -- --webpack
```

说明：

- `next build` 默认走 `Turbopack` 时，在当前沙箱环境里可能因为进程权限报错。
- `next build -- --webpack` 可用于验证代码和类型检查是否通过。

## 当前约束

- 不再支持本地 `SQLite` 文件数据库
- 缺少 `TURSO_DATABASE_URL` 或 `TURSO_AUTH_TOKEN` 时，应用和 `seed` 都会直接失败
- `npm run seed` 只会操作远程 Turso 数据库
