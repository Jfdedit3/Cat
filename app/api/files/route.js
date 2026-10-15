import { del, list } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_ADMIN_TOKEN_LENGTH = 32;

async function listAllBlobs() {
  const blobs = [];
  let cursor;

  do {
    const result = await list({ limit: 1000, ...(cursor ? { cursor } : {}) });
    blobs.push(...result.blobs);
    cursor = result.hasMore ? result.cursor : undefined;
  } while (cursor);

  return blobs;
}

export async function GET() {
  try {
    const allBlobs = await listAllBlobs();
    const blobs = allBlobs.map((blob) => ({
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
      name: blob.pathname.split("/").pop(),
      size: blob.size,
      uploadedAt: blob.uploadedAt,
      contentType: blob.contentType || "application/octet-stream",
      type: blob.contentType || "application/octet-stream"
    }));

    return NextResponse.json({
      names: blobs.map((blob) => blob.name),
      blobs,
      count: blobs.length
    });
  } catch (error) {
    console.error("List error:", error);
    return NextResponse.json(
      { error: error?.message || "Impossible de récupérer les fichiers." },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const adminToken = process.env.CAT_ADMIN_TOKEN;

  if (!adminToken || adminToken.length < MIN_ADMIN_TOKEN_LENGTH) {
    return NextResponse.json(
      {
        error: "Suppression désactivée : CAT_ADMIN_TOKEN doit être configuré sur Vercel avec au moins 32 caractères aléatoires, puis le site doit être redéployé."
      },
      { status: 503 }
    );
  }

  const authorization = request.headers.get("authorization") || "";
  if (authorization !== `Bearer ${adminToken}`) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const pathname = typeof body.pathname === "string" ? body.pathname.trim() : "";

    if (!pathname || pathname.includes("\\") || pathname.split("/").includes("..")) {
      return NextResponse.json(
        { error: "Fournis le pathname exact du fichier à supprimer." },
        { status: 400 }
      );
    }

    const allBlobs = await listAllBlobs();
    const target = allBlobs.find((blob) => blob.pathname === pathname);

    if (!target) {
      return NextResponse.json({ error: "Fichier introuvable." }, { status: 404 });
    }

    await del(target.url);

    return NextResponse.json({
      success: true,
      deleted: target.pathname
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: error?.message || "Impossible de supprimer le fichier." },
      { status: 500 }
    );
  }
}
