import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const allowedContentTypes = [
  "image/*",
  "video/*",
  "audio/*",
  "application/pdf",
  "application/json",
  "application/xml",
  "application/zip",
  "application/x-7z-compressed",
  "application/x-rar-compressed",
  "text/*",
  "application/octet-stream"
];

export async function POST(request) {
  try {
    const body = await request.json();

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes,
        addRandomSuffix: true,
        tokenPayload: JSON.stringify({ createdAt: Date.now() })
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log("Blob upload completed:", blob.url);
      }
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Upload impossible." },
      { status: 400 }
    );
  }
}
