import { readFile } from "node:fs/promises";
import { getMediaFilePath } from "@/lib/media";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await params;
  const rel = parts.join("/");
  const full = getMediaFilePath(rel);
  if (!full) return new Response("Not found", { status: 404 });

  try {
    const buf = await readFile(full);
    const ext = rel.split(".").pop()?.toLowerCase() ?? "";
    const type = CONTENT_TYPES[ext] ?? "application/octet-stream";
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
