"use client";

import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
  Popconfirm,
} from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

const { Title } = Typography;

interface Student {
  id: number;
  student_no: string;
  name: string;
  gender: string;
  class: string;
  phone: string;
  email: string;
  status: string;
  created_at: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [queryKeyword, setQueryKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form] = Form.useForm();

  const fetchStudents = async (nextPage: number, nextKeyword: string) => {
    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        pageSize: "10",
      });
      if (nextKeyword) params.set("keyword", nextKeyword);

      const res = await fetch(`/api/students?${params}`);
      const data = await res.json();
      setStudents(data.items);
      setTotal(data.total);
    } catch {
      message.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      void fetchStudents(page, queryKeyword);
    }, 0);

    return () => clearTimeout(timer);
  }, [page, queryKeyword]);

  const handleSearch = () => {
    setPage(1);
    setQueryKeyword(keyword);
  };

  const openCreateModal = () => {
    setEditingStudent(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    form.setFieldsValue({
      studentNo: student.student_no,
      name: student.name,
      gender: student.gender,
      class: student.class,
      phone: student.phone,
      email: student.email,
      status: student.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const isEdit = !!editingStudent;

    try {
      const url = isEdit ? `/api/students/${editingStudent.id}` : "/api/students";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const err = await res.json();
        message.error(err.error ?? "Operation failed");
        return;
      }

      message.success(isEdit ? "Student updated" : "Student created");
      setModalOpen(false);
      setLoading(true);
      void fetchStudents(page, queryKeyword);
    } catch {
      message.error("Operation failed");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (!res.ok) {
        message.error("Delete failed");
        return;
      }
      message.success("Student deleted");
      setLoading(true);
      void fetchStudents(page, queryKeyword);
    } catch {
      message.error("Delete failed");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "Student No", dataIndex: "student_no", key: "student_no" },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      render: (v: string) => (v === "M" ? "Male" : v === "F" ? "Female" : v),
    },
    { title: "Class", dataIndex: "class", key: "class" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v: string) =>
        v === "active" ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Inactive</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Student) => (
        <Space>
          <Button type="link" size="small" onClick={() => openEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this student?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Title level={3}>Student Management</Title>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Space>
            <Input
              placeholder="Search by name / student no / class"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
            />
            <Button type="primary" onClick={handleSearch}>
              Search
            </Button>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Add Student
          </Button>
        </div>

        <Table
          dataSource={students}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: 10,
            total,
            onChange: setPage,
            showTotal: (t) => `Total ${t} students`,
          }}
        />
      </Card>

      <Modal
        title={editingStudent ? "Edit Student" : "Add Student"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="studentNo"
            label="Student No"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "M", label: "Male" },
                { value: "F", label: "Female" },
              ]}
            />
          </Form.Item>
          <Form.Item name="class" label="Class" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          {editingStudent && (
            <Form.Item name="status" label="Status">
              <Select
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
}
