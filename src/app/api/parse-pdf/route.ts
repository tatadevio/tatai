import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

async function parseWithPdfParse(buffer: Buffer): Promise<{ text: string; pages: number } | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod: any = await import("pdf-parse");
    const pdfParse = mod.default ?? mod;
    const data = await pdfParse(buffer);
    const text = data.text?.trim() ?? "";
    if (!text) return null;
    return { text, pages: data.numpages ?? 0 };
  } catch {
    return null;
  }
}

async function parseWithPdfjs(buffer: Buffer): Promise<{ text: string; pages: number } | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer), useWorkerFetch: false, isEvalSupported: false });
    const doc = await loadingTask.promise;
    const numPages: number = doc.numPages;
    const pageTexts: string[] = [];
    for (let i = 1; i <= numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pageText = content.items.map((item: any) => item.str ?? "").join(" ").trim();
      if (pageText) pageTexts.push(pageText);
    }
    await doc.destroy();
    const text = pageTexts.join("\n\n").trim();
    if (!text) return null;
    return { text, pages: numPages };
  } catch {
    return null;
  }
}

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

    // Try pdf-parse first; fall back to pdfjs-dist for tricky PDFs
    let result = await parseWithPdfParse(buffer);
    if (!result) result = await parseWithPdfjs(buffer);

    if (!result || !result.text) {
      return NextResponse.json({
        error: "Could not extract text from this PDF. It may be scanned/image-based, encrypted, or corrupted. Try copying the text and pasting it directly.",
      }, { status: 422 });
    }

    const truncated = result.text.length > 50000
      ? result.text.slice(0, 50000) + "\n\n[PDF truncated — too long]"
      : result.text;

    return NextResponse.json({ text: truncated, pages: result.pages, fileName: file.name });
  } catch (e) {
    console.error("PDF parse error:", e);
    return NextResponse.json({ error: "Failed to process PDF" }, { status: 500 });
  }
}
