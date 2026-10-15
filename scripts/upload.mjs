#!/usr/bin/env node

import { openAsBlob } from "node:fs";
import { stat } from "node:fs/promises";
import { basename, resolve, extname } from "node:path";
import { upload } from "@vercel/blob/client";

const [, , inputPath, suppliedBaseUrl] = process.argv;

if (!inputPath) {
  console.error("Usage: node scripts/upload.mjs <fichier> [URL_DU_SITE]");
  console.error("Exemple: node scripts/upload.mjs ./application.apk https://ton-site.vercel.app");
  process.exit(1);
}

const baseUrl = (suppliedBaseUrl || process.env.CAT_UPLOAD_URL || "").replace(/\/$/, "");

if (!baseUrl || !/^https?:\/\//i.test(baseUrl)) {
  console.error("Indique l'URL de ton site Vercel en argument ou dans CAT_UPLOAD_URL.");
  process.exit(1);
}

const filePath = resolve(inputPath);
const fileName = basename(filePath);
const fileStats = await stat(filePath);

if (!fileStats.isFile()) {
  console.error("Le chemin indiqué ne correspond pas à un fichier.");
  process.exit(1);
}

const mimeTypes = {
  ".apk": "application/vnd.android.package-archive",
  ".apks": "application/octet-stream",
  ".xapk": "application/octet-stream",
  ".zip": "application/zip",
  ".pdf": "application/pdf",
  ".json": "application/json",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp"
};

const contentType = mimeTypes[extname(fileName).toLowerCase()] || "application/octet-stream";
const readableSize = (bytes) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
};

console.log(`Fichier : ${fileName} (${readableSize(fileStats.size)})`);
console.log(`Destination : ${baseUrl}`);
console.log("Envoi vers Vercel Blob...");

try {
  const file = await openAsBlob(filePath, { type: contentType });
  const result = await upload(fileName, file, {
    access: "public",
    contentType,
    handleUploadUrl: `${baseUrl}/api/upload`,
    multipart: fileStats.size > 4 * 1024 * 1024,
    onUploadProgress: ({ percentage }) => {
      process.stdout.write(`\rProgression : ${Math.floor(percentage)}%`);
    }
  });

  process.stdout.write("\n");
  console.log("\nUpload terminé :");
  console.log(JSON.stringify({
    success: true,
    filename: fileName,
    size: fileStats.size,
    contentType: result.contentType,
    url: result.url,
    downloadUrl: result.downloadUrl,
    pathname: result.pathname
  }, null, 2));
} catch (error) {
  process.stderr.write("\n");
  console.error("Échec de l'upload :", error?.message || error);
  process.exit(1);
}
