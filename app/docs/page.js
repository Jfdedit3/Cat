"use client";

import Link from "next/link";

const site = "https://cat-gallery-ashen.vercel.app";

const panel = {
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 18,
  background: "rgba(16,18,28,.78)",
  padding: 20,
  marginTop: 16,
};

const code = {
  display: "block",
  overflowX: "auto",
  padding: 14,
  borderRadius: 12,
  background: "#080a11",
  border: "1px solid rgba(99,230,255,.18)",
  color: "#9eeeff",
  fontSize: 13,
  lineHeight: 1.6,
  whiteSpace: "pre",
};

export default function DocsPage() {
  return (
    <main style={{ width: "min(900px, calc(100% - 28px))", margin: "0 auto", padding: "30px 0 60px" }}>
      <Link href="/" className="btn" style={{ display: "inline-block", textDecoration: "none", marginBottom: 24 }}>
        ← Retour à la galerie
      </Link>

      <p className="eyebrow">CAT FILE SERVER</p>
      <h1 style={{ fontSize: "clamp(32px, 7vw, 52px)", lineHeight: 1.05 }}>Documentation API</h1>
      <p className="subtitle">
        Comment envoyer des fichiers, récupérer leur URL et consulter la liste des fichiers hébergés.
      </p>

      <section style={panel}>
        <h2>1. Envoyer un fichier depuis le site</h2>
        <p>La méthode la plus simple : ouvre la galerie, clique sur <strong>Choisir des fichiers</strong>, sélectionne un ou plusieurs fichiers puis attends la fin de l’envoi.</p>
        <p>Les fichiers envoyés sont publics : toute personne qui possède leur URL peut y accéder. N’envoie pas de fichiers confidentiels.</p>
        <a className="btn primary" href={site}>Ouvrir la galerie ↗</a>
      </section>

      <section style={panel}>
        <h2>2. Consulter la liste des fichiers (API)</h2>
        <p><strong>Méthode :</strong> GET</p>
        <p><strong>Endpoint :</strong></p>
        <code style={code}>{site}/api/files</code>
        <p>Ouvre cette adresse dans ton navigateur ou utilise la commande :</p>
        <code style={code}>curl "{site}/api/files"</code>
        <p>La réponse JSON contient notamment <code>blobs</code>, avec les URL, noms, tailles, types MIME et dates des fichiers disponibles.</p>
        <a className="btn" href={site + "/api/files"} target="_blank" rel="noreferrer">Tester l’API ↗</a>
      </section>

      <section style={panel}>
        <h2>3. Envoyer un fichier depuis un terminal</h2>
        <p>L’endpoint <code>/api/upload</code> sert à négocier un upload sécurisé avec Vercel Blob. Il ne reçoit pas directement un fichier avec <code>curl -F</code>. Pour un APK ou un gros fichier, utilise le script fourni dans le dépôt GitHub.</p>
        <h3>Prérequis</h3>
        <ul>
          <li>Node.js 20 ou plus récent.</li>
          <li>Le dépôt cloné et les dépendances installées.</li>
          <li>Un stockage Vercel Blob associé au projet, avec la variable <code>BLOB_READ_WRITE_TOKEN</code> configurée sur Vercel.</li>
        </ul>
        <h3>Commandes</h3>
        <code style={code}>git clone https://github.com/Jfdedit3/Cat.git{"\n"}cd Cat{"\n"}npm install</code>
        <p>Depuis le dossier du projet, envoie le fichier en remplaçant le chemin par celui de ton fichier :</p>
        <code style={code}>node scripts/upload.mjs "./application.apk" "{site}"</code>
        <p>Le script affiche la progression puis renvoie les informations du fichier, dont son URL publique.</p>
        <a className="btn" href="https://github.com/Jfdedit3/Cat/blob/main/scripts/upload.mjs" target="_blank" rel="noreferrer">Voir le script sur GitHub ↗</a>
      </section>

      <section style={panel}>
        <h2>4. Endpoints disponibles</h2>
        <p><strong>GET</strong> <code>/api/files</code> — récupère la liste des fichiers.</p>
        <p><strong>POST</strong> <code>/api/upload</code> — endpoint de négociation utilisé par le SDK Vercel Blob ; ce n’est pas un endpoint multipart classique pour cURL.</p>
      </section>

      <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 22 }}>
        Pour plus de détails techniques, consulte aussi le fichier API.md du dépôt.
      </p>
      <a className="btn" href="https://github.com/Jfdedit3/Cat/blob/main/API.md" target="_blank" rel="noreferrer">Documentation technique sur GitHub ↗</a>
    </main>
  );
}
