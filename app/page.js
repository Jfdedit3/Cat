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

function kind(file) {
  const type = file.contentType || "";
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  return "file";
}

function extension(name) {
  const ext = name.split(".").pop();
  return ext && ext !== name ? ext.slice(0, 5) : "FILE";
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
      if (!response.ok) throw new Error(data.error || "Impossible de charger les fichiers.");
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
          onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage))
        });
      } catch (err) {
        setError(`Échec pour ${file.name} : ${err.message}`);
      }
    }

    setProgress(100);
    setStatus("Upload terminé.");
    setSelected([]);
    if (inputRef.current) inputRef.current.value = "";
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
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div>
            <strong>Glisse tes fichiers ici</strong>
            <span>ou sélectionne plusieurs fichiers depuis ton appareil</span>
            <div className="actions">
              <button className="btn primary" onClick={() => inputRef.current?.click()}>
                Choisir des fichiers
              </button>
              <button className="btn" onClick={loadFiles} disabled={loading}>
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
              const type = kind(file);
              return (
                <article className="card" key={file.url}>
                  <div className="preview">
                    {type === "image" && (
                      <img src={file.url} alt={file.pathname} loading="lazy" />
                    )}
                    {type === "video" && (
                      <video src={file.url} controls preload="metadata" />
                    )}
                    {type === "audio" && (
                      <audio src={file.url} controls preload="metadata" />
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
                      <a className="btn" href={file.url} target="_blank" rel="noreferrer">
                        Ouvrir
                      </a>
                      <button className="btn" onClick={() => copyUrl(file.url)}>
                        Copier
                      </button>
                      <a className="btn" href={file.downloadUrl || file.url} download>
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
