import { getStudent, updateStudent, deleteStudent } from "@/lib/services/student";
import { isAuthenticatedRequest } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthenticatedRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const studentId = parseInt(id);

  if (isNaN(studentId)) {
    return Response.json({ error: "Invalid ID" }, { status: 400 });
  }

  const existing = await getStudent(studentId);
  if (!existing) {
    return Response.json({ error: "Student not found" }, { status: 404 });
  }

  const student = await updateStudent(studentId, body);
  return Response.json(student);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthenticatedRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const studentId = parseInt(id);

  if (isNaN(studentId)) {
    return Response.json({ error: "Invalid ID" }, { status: 400 });
  }

  const existing = await getStudent(studentId);
  if (!existing) {
    return Response.json({ error: "Student not found" }, { status: 404 });
  }

  await deleteStudent(studentId);
  return Response.json({ success: true });
}
