import { del, list } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
      contentType: blob.contentType
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

  if (!adminToken) {
    return NextResponse.json(
      { error: "La suppression n'est pas configurée. Ajoute CAT_ADMIN_TOKEN dans les variables d'environnement Vercel." },
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
