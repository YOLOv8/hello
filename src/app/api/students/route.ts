import {
  listStudents,
  createStudent,
} from "@/lib/services/student";
import { isAuthenticatedRequest } from "@/lib/auth";

export async function GET(request: Request) {
  if (!isAuthenticatedRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "10");
  const keyword = url.searchParams.get("keyword") ?? undefined;

  const result = await listStudents({ page, pageSize, keyword });
  return Response.json(result);
}

export async function POST(request: Request) {
  if (!isAuthenticatedRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { studentNo, name, gender, class: cls, phone, email } = body;

  if (!studentNo || !name || !gender || !cls) {
    return Response.json(
      { error: "studentNo, name, gender, class are required" },
      { status: 400 }
    );
  }

  try {
    const student = await createStudent({ studentNo, name, gender, class: cls, phone, email });
    return Response.json(student, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create student";
    return Response.json({ error: msg }, { status: 400 });
  }
}
