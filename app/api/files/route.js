import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await list({ limit: 1000 });

    return NextResponse.json({
      blobs: result.blobs.map((blob) => ({
        url: blob.url,
        downloadUrl: blob.downloadUrl,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
        contentType: blob.contentType
      })),
      cursor: result.cursor || null,
      hasMore: result.hasMore
    });
  } catch (error) {
    console.error("List error:", error);
    return NextResponse.json(
      { error: error?.message || "Impossible de récupérer les fichiers." },
      { status: 500 }
    );
  }
}
