import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST() {
  try {
    revalidateTag("admin-feedback");
    return NextResponse.json({ revalidated: true });
  } catch (error) {
    console.error("[Admin Feedback] Revalidate error:", error);
    return NextResponse.json({ error: "Failed to revalidate" }, { status: 500 });
  }
}
