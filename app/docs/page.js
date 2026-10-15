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
        <p>La réponse JSON contient <code>names</code> (noms de fichiers), <code>blobs</code> (métadonnées) et <code>count</code> (nombre total). Chaque entrée de <code>blobs</code> expose notamment <code>url</code>, <code>downloadUrl</code>, <code>pathname</code>, <code>name</code>, <code>size</code>, <code>contentType</code>, <code>type</code> (alias MIME) et <code>uploadedAt</code>.</p>
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
        <code style={code}>{"git clone https://github.com/Jfdedit3/Cat.git\ncd Cat\nnpm install"}</code>
        <p>Depuis le dossier du projet, envoie le fichier en remplaçant le chemin par celui de ton fichier :</p>
        <code style={code}>node scripts/upload.mjs "./application.apk" "{site}"</code>
        <p>Le script affiche la progression puis renvoie les informations du fichier, dont son URL publique.</p>
        <a className="btn" href="https://github.com/Jfdedit3/Cat/blob/main/scripts/upload.mjs" target="_blank" rel="noreferrer">Voir le script sur GitHub ↗</a>
      </section>

      <section style={panel}>
        <h2>4. Récupérer tous les noms des fichiers</h2>
        <p><strong>Méthode :</strong> GET</p>
        <code style={code}>{site}/api/files</code>
        <p>Pour afficher uniquement les noms :</p>
        <code style={code}>curl -s "{site}/api/files" | jq -r '.names[]'</code>
        <p>Pour afficher aussi les chemins exacts nécessaires à la suppression :</p>
        <code style={code}>curl -s "{site}/api/files" | jq -r '.blobs[] | [.name, .pathname] | @tsv'</code>
        <a className="btn" href={site + "/api/files"} target="_blank" rel="noreferrer">Afficher la liste JSON ↗</a>
      </section>

      <section style={panel}>
        <h2>5. Supprimer un fichier via l’API</h2>
        <p>La suppression utilise <strong>DELETE</strong> <code>/api/files</code> et nécessite un jeton d’administration robuste. La suppression est définitive : vérifie toujours le pathname avant de lancer la commande.</p>
        <h3>Configurer le jeton</h3>
        <ol>
          <li>Génère un secret avec <code>openssl rand -hex 32</code> (64 caractères hexadécimaux aléatoires).</li>
          <li>Dans Vercel, ouvre le projet puis <strong>Settings → Environment Variables</strong>.</li>
          <li>Définis <code>CAT_ADMIN_TOKEN</code> avec ce secret, pour l’environnement Production.</li>
          <li>Enregistre puis redéploie le site. Le serveur refuse les jetons de moins de 32 caractères.</li>
          <li>Mets à jour le jeton utilisé par tes scripts locaux. Ne le place jamais dans le code public du site.</li>
        </ol>
        <h3>Commande cURL</h3>
        <p>Prérequis : <code>jq</code> et la variable d’environnement <code>CAT_ADMIN_TOKEN</code> définie dans ton terminal. La première commande affiche les noms et les <code>pathname</code> exacts. Copie le pathname du fichier voulu dans la variable ci-dessous : ne mets pas un nom inventé comme <code>photo.png</code>.</p>
        <code style={code}>{"curl -s \"" + site + "/api/files\" | jq -r '.blobs[] | [.name, .pathname] | @tsv'\n\n# Colle ici le pathname exact renvoyé par la commande précédente\nPATHNAME='COLLE_ICI_LE_PATHNAME_EXACT'\n\ncurl -X DELETE \"" + site + "/api/files\" \\\n  -H \"Authorization: Bearer $CAT_ADMIN_TOKEN\" \\\n  -H \"Content-Type: application/json\" \\\n  -d \"$(jq -n --arg pathname \"$PATHNAME\" '{pathname:$pathname}')\""}</code>
        <p>Une réponse avec <code>success: true</code> confirme la suppression. <code>401</code> signifie que le jeton est absent ou incorrect ; <code>404</code> signifie que le pathname exact est introuvable ; <code>503</code> signifie que le jeton est absent ou trop court.</p>
      </section>

      <section style={panel}>
        <h2>6. Endpoints disponibles</h2>
        <p><strong>GET</strong> <code>/api/files</code> — récupère la liste des fichiers et leurs métadonnées.</p>
        <p><strong>DELETE</strong> <code>/api/files</code> — supprime un fichier après vérification du jeton et du pathname exact.</p>
        <p><strong>POST</strong> <code>/api/upload</code> — endpoint de négociation utilisé par le SDK Vercel Blob ; ce n’est pas un endpoint multipart classique pour cURL.</p>
      </section>

      <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 22 }}>
        Pour plus de détails techniques, consulte aussi le fichier API.md du dépôt.
      </p>
      <a className="btn" href="https://github.com/Jfdedit3/Cat/blob/main/API.md" target="_blank" rel="noreferrer">Documentation technique sur GitHub ↗</a>
    </main>
  );
}
