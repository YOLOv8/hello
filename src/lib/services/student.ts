import { getDb } from "@/lib/db";

interface StudentRow {
  id: number;
  student_no: string;
  name: string;
  gender: string;
  class: string;
  phone: string | null;
  email: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateStudentInput {
  studentNo: string;
  name: string;
  gender: string;
  class: string;
  phone?: string;
  email?: string;
}

export interface UpdateStudentInput extends Partial<CreateStudentInput> {
  status?: string;
}

export interface ListStudentParams {
  page: number;
  pageSize: number;
  keyword?: string;
}

export async function listStudents(params: ListStudentParams) {
  const db = await getDb();
  const { page, pageSize, keyword } = params;
  const skip = (page - 1) * pageSize;

  let where = "";
  let countWhere = "";
  const binds: string[] = [];
  const countBinds: string[] = [];

  if (keyword) {
    where =
      "WHERE name LIKE ? OR student_no LIKE ? OR class LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
    countWhere =
      "WHERE name LIKE ? OR student_no LIKE ? OR class LIKE ?";
    const kw = `%${keyword}%`;
    binds.push(kw, kw, kw, String(pageSize), String(skip));
    countBinds.push(kw, kw, kw);
  } else {
    where = "ORDER BY created_at DESC LIMIT ? OFFSET ?";
    binds.push(String(pageSize), String(skip));
  }

  const items = await db.many<StudentRow>(`SELECT * FROM students ${where}`, binds);
  const total = await db.one<{ count: number }>(
    `SELECT COUNT(*) as count FROM students ${countWhere}`,
    countBinds
  );

  return { items, total: total?.count ?? 0, page, pageSize };
}

export async function createStudent(input: CreateStudentInput) {
  const db = await getDb();
  const result = await db.run(
    `INSERT INTO students (student_no, name, gender, class, phone, email) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      input.studentNo,
      input.name,
      input.gender,
      input.class,
      input.phone ?? null,
      input.email ?? null,
    ]
  );

  if (!result.lastInsertRowid) {
    throw new Error("Failed to create student");
  }

  return getStudent(result.lastInsertRowid);
}

export async function updateStudent(id: number, input: UpdateStudentInput) {
  const db = await getDb();
  const fields: string[] = [];
  const binds: Array<string | null> = [];

  if (input.studentNo !== undefined) {
    fields.push("student_no = ?");
    binds.push(input.studentNo);
  }
  if (input.name !== undefined) {
    fields.push("name = ?");
    binds.push(input.name);
  }
  if (input.gender !== undefined) {
    fields.push("gender = ?");
    binds.push(input.gender);
  }
  if (input.class !== undefined) {
    fields.push("class = ?");
    binds.push(input.class);
  }
  if (input.phone !== undefined) {
    fields.push("phone = ?");
    binds.push(input.phone);
  }
  if (input.email !== undefined) {
    fields.push("email = ?");
    binds.push(input.email);
  }
  if (input.status !== undefined) {
    fields.push("status = ?");
    binds.push(input.status);
  }

  if (fields.length === 0) return getStudent(id);

  fields.push("updated_at = datetime('now')");
  binds.push(String(id));

  await db.run(`UPDATE students SET ${fields.join(", ")} WHERE id = ?`, binds);

  return getStudent(id);
}

export async function deleteStudent(id: number) {
  const db = await getDb();
  await db.run("DELETE FROM students WHERE id = ?", [String(id)]);
}

export async function getStudent(id: number) {
  const db = await getDb();
  return db.one<StudentRow>("SELECT * FROM students WHERE id = ?", [String(id)]);
}
