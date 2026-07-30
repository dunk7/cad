import { NextRequest, NextResponse } from "next/server";
import {
  checkAdminPassword,
  clearAdminSession,
  isAdminAuthenticated,
  setAdminSession,
} from "@/lib/admin/auth";

export async function GET() {
  return NextResponse.json({ authenticated: await isAdminAuthenticated() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "logout") {
    await clearAdminSession();
    return NextResponse.json({ ok: true });
  }
  if (!checkAdminPassword(String(body.password || ""))) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  await setAdminSession();
  return NextResponse.json({ ok: true });
}
