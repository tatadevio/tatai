import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "PDF too large (max 20MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Dynamic import to avoid SSR issues with pdf-parse
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod: any = await import("pdf-parse");
    const pdfParse = mod.default ?? mod;
    const data = await pdfParse(buffer);

    const text = data.text?.trim() ?? "";
    if (!text) return NextResponse.json({ error: "Could not extract text from this PDF (may be scanned/image-based)" }, { status: 422 });

    // Limit to ~50k chars to avoid token overflow
    const truncated = text.length > 50000 ? text.slice(0, 50000) + "\n\n[PDF truncated — too long]" : text;

    return NextResponse.json({
      text: truncated,
      pages: data.numpages,
      fileName: file.name,
    });
  } catch (e: any) {
    console.error("PDF parse error:", e);
    return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
  }
}
