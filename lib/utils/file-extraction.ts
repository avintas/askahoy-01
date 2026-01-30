import mammoth from "mammoth";

export async function extractTextFromFile(
  file: File
): Promise<{ text: string; mimeType: string }> {
  const mimeType = file.type;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (mimeType === "application/pdf") {
    // Dynamic import for pdf-parse to handle CommonJS module
    const pdfParseModule = await import("pdf-parse");
    // pdf-parse exports the function directly
    const pdfParse = pdfParseModule as unknown as (
      buffer: Buffer
    ) => Promise<{ text: string }>;
    const data = await pdfParse(buffer);
    return { text: data.text, mimeType };
  } else if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return { text: result.value, mimeType };
  } else if (mimeType === "text/plain") {
    const text = await file.text();
    return { text, mimeType };
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}
