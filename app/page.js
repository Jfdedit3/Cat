"use client";

import { upload } from "@vercel/blob/client";
import { useCallback, useEffect, useRef, useState } from "react";

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function getExtension(name = "") {
  const cleanName = name.split("?")[0].split("#")[0];
  const parts = cleanName.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() : "";
}

function detectType(file) {
  const contentType = (file.contentType || "").toLowerCase();
  const ext = getExtension(file.pathname || file.url || "");

  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/")) return "video";
  if (contentType.startsWith("audio/")) return "audio";

  const imageExtensions = [
    "jpg", "jpeg", "png", "gif", "webp", "avif", "bmp", "svg", "ico", "tif", "tiff"
  ];
  const videoExtensions = [
    "mp4", "webm", "mov", "m4v", "avi", "mkv", "ogv", "3gp"
  ];
  const audioExtensions = [
    "mp3", "wav", "ogg", "oga", "m4a", "aac", "flac", "opus"
  ];

  if (imageExtensions.includes(ext)) return "image";
  if (videoExtensions.includes(ext)) return "video";
  if (audioExtensions.includes(ext)) return "audio";

  return "file";
}

function getMimeType(file) {
  const contentType = (file.contentType || "").toLowerCase();
  if (contentType && contentType !== "application/octet-stream") return contentType;

  const ext = getExtension(file.pathname || file.url || "");
  const mimeTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    avif: "image/avif",
    svg: "image/svg+xml",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    m4v: "video/x-m4v",
    ogv: "video/ogg",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    oga: "audio/ogg",
    m4a: "audio/mp4",
    aac: "audio/aac",
    flac: "audio/flac",
    opus: "audio/opus"
  };

  return mimeTypes[ext] || "";
}

function extension(name) {
  const ext = getExtension(name);
  return ext ? ext.slice(0, 5) : "FILE";
}

export default function Home() {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Prêt.");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/files", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible de charger les fichiers.");
      }

      setFiles(data.blobs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  async function uploadFiles(list) {
    const incoming = Array.from(list || []);
    if (!incoming.length) return;

    setSelected(incoming);
    setStatus(`${incoming.length} fichier(s) en préparation…`);
    setError("");

    for (let index = 0; index < incoming.length; index++) {
      const file = incoming[index];

      try {
        setProgress(0);
        setStatus(`Upload ${index + 1}/${incoming.length} : ${file.name}`);

        await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
          multipart: file.size > 4 * 1024 * 1024,
          onUploadProgress: ({ percentage }) =>
            setProgress(Math.round(percentage))
        });
      } catch (err) {
        setError(`Échec pour ${file.name} : ${err.message}`);
      }
    }

    setProgress(100);
    setStatus("Upload terminé.");
    setSelected([]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    await loadFiles();
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    uploadFiles(event.dataTransfer.files);
  }

  async function copyUrl(url) {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("URL copiée dans le presse-papiers.");
    } catch {
      setStatus("Impossible de copier l'URL.");
    }
  }

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">CAT FILE SERVER</p>
          <h1>Upload & Gallery</h1>
          <p className="subtitle">
            Héberge tes images, vidéos, fichiers audio, documents et autres formats
            dans Vercel Blob, puis retrouve-les directement dans cette galerie.
          </p>
        </div>
      </header>

      <section className="panel upload">
        <div
          className={`dropzone ${dragging ? "dragging" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div>
            <strong>Glisse tes fichiers ici</strong>
            <span>ou sélectionne plusieurs fichiers depuis ton appareil</span>

            <div className="actions">
              <button
                className="btn primary"
                onClick={() => inputRef.current?.click()}
              >
                Choisir des fichiers
              </button>

              <button
                className="btn"
                onClick={loadFiles}
                disabled={loading}
              >
                Actualiser
              </button>
            </div>

            <input
              ref={inputRef}
              className="file-input"
              type="file"
              multiple
              onChange={(event) => uploadFiles(event.target.files)}
            />
          </div>
        </div>

        {selected.length > 0 && (
          <div className="status">
            {selected.length} fichier(s) sélectionné(s)
          </div>
        )}

        <div className="progress">
          <div style={{ width: `${progress}%` }} />
        </div>

        <div className="status">{status}</div>
      </section>

      <section>
        <div className="toolbar">
          <div>
            <h2>Galerie</h2>
            <span className="count">{files.length} fichier(s)</span>
          </div>
        </div>

        {error && <div className="panel error">{error}</div>}

        {loading ? (
          <div className="panel empty">Chargement de la galerie…</div>
        ) : files.length === 0 ? (
          <div className="panel empty">Aucun fichier pour le moment.</div>
        ) : (
          <div className="gallery">
            {files.map((file) => {
              const type = detectType(file);
              const mimeType = getMimeType(file);

              return (
                <article className="card" key={file.url}>
                  <div className={`preview preview-${type}`}>
                    {type === "image" && (
                      <img
                        src={file.url}
                        alt={file.pathname}
                        loading="lazy"
                        decoding="async"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    )}

                    {type === "video" && (
                      <video
                        controls
                        preload="metadata"
                        playsInline
                        src={file.url}
                      >
                        {mimeType && <source src={file.url} type={mimeType} />}
                        Ton navigateur ne peut pas lire cette vidéo.
                      </video>
                    )}

                    {type === "audio" && (
                      <audio controls preload="metadata" src={file.url}>
                        {mimeType && <source src={file.url} type={mimeType} />}
                        Ton navigateur ne peut pas lire ce fichier audio.
                      </audio>
                    )}

                    {type === "file" && (
                      <div className="generic">{extension(file.pathname)}</div>
                    )}
                  </div>

                  <div className="card-body">
                    <p className="filename" title={file.pathname}>
                      {file.pathname}
                    </p>

                    <div className="meta">
                      <span>{formatBytes(file.size)}</span>
                      <span>{formatDate(file.uploadedAt)}</span>
                    </div>

                    <div className="card-actions">
                      <a
                        className="btn"
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ouvrir
                      </a>

                      <button
                        className="btn"
                        onClick={() => copyUrl(file.url)}
                      >
                        Copier
                      </button>

                      <a
                        className="btn"
                        href={file.downloadUrl || file.url}
                        download
                      >
                        Télécharger
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
