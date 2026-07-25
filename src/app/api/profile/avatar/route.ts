import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const entry = formData.get("file");

  if (!(entry instanceof File)) {
    return NextResponse.json(
      { error: "No file provided" },
      { status: 400 }
    );
  }

  const file = entry;

  // -- MOCK MODE --
  // For now, just pretend we saved it and return a fake URL
  // (In dev, you could even save it to /public/uploads temporarily)
  const name = file.name || `avatar-${Date.now()}`;

  return NextResponse.json({
    url: `/uploads/${Date.now()}-${name}`,
  });

  // -- REAL MODE (once FastAPI + Cloudinary/S3 is ready) --
  /*
  const backendForm = new FormData();
  backendForm.append("file", file);

  const res = await fetch("http://localhost:8000/api/v1/profile/avatar", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: backendForm,
  });

  const data = await res.json();
  return NextResponse.json({ url: data.avatar_url });
  */
}

export async function DELETE(_req: NextRequest) {
  // In mock mode we simply acknowledge the delete.
  // In real mode, call the backend.
  return NextResponse.json({ ok: true });
}