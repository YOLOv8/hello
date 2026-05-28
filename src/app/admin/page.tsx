"use client";

import { Card, Col, Row, Statistic, Typography } from "antd";
import { TeamOutlined, CheckCircleOutlined, UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

const { Title } = Typography;

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, active: 0 });

  useEffect(() => {
    fetch("/api/students?page=1&pageSize=1")
      .then((res) => res.json())
      .then((data) => {
        setStats({ total: data.total, active: data.total });
      });
  }, []);

  return (
    <>
      <Title level={3}>Dashboard</Title>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Students"
              value={stats.total}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Students"
              value={stats.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Administrators"
              value={1}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
