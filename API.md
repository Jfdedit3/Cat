# API Cat Gallery

Base URL de production : `https://cat-gallery-ashen.vercel.app`

## 1. Obtenir tous les noms des fichiers

**GET** `/api/files`

```bash
curl "https://cat-gallery-ashen.vercel.app/api/files"
```

La réponse JSON contient `names` (tableau de tous les noms), `blobs` (métadonnées avec `pathname`, `name`, `url`, `size`, `contentType` et `uploadedAt`) et `count` (nombre total de fichiers). La liste est paginée côté serveur pour inclure tous les fichiers.

Pour récupérer seulement les noms avec `jq` :

```bash
curl -s "https://cat-gallery-ashen.vercel.app/api/files" | jq '.names'
```

## 2. Supprimer un fichier

La suppression est disponible avec **DELETE** `/api/files`. Elle est protégée par un jeton d'administration afin d'empêcher les visiteurs d'effacer tes fichiers.

### Configuration obligatoire

Dans Vercel, ouvre le projet **cat-gallery-ashen** → **Settings** → **Environment Variables**, puis ajoute :

- Nom : `CAT_ADMIN_TOKEN`
- Valeur : un secret long, aléatoire et difficile à deviner.

Applique la variable à Production, puis redéploie le projet. Garde ce jeton privé : ne le mets jamais dans le code du site ni dans une page web publique.

### Commande de suppression

Utilise le `pathname` exact renvoyé par `GET /api/files` :

```bash
curl -X DELETE "https://cat-gallery-ashen.vercel.app/api/files" \\
  -H "Authorization: Bearer TON_CAT_ADMIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"pathname":"photo.png"}'
```

Succès :

```json
{"success":true,"deleted":"photo.png"}
```

Erreurs possibles : `401` jeton absent/invalide, `404` fichier introuvable, `503` jeton d'administration non configuré.

## 3. Envoyer un fichier

`POST /api/upload` est le point de négociation du protocole client Vercel Blob ; il ne reçoit pas directement un fichier avec `curl -F`. Pour envoyer un fichier depuis un terminal, utilise le script du dépôt :

```bash
git clone https://github.com/Jfdedit3/Cat.git
cd Cat
npm install
node scripts/upload.mjs "./application.apk" "https://cat-gallery-ashen.vercel.app"
```

Prérequis : Node.js 20+ et un stockage Vercel Blob lié au projet, avec `BLOB_READ_WRITE_TOKEN` configuré dans Vercel.

Les fichiers téléversés sont publics. Ne téléverse pas de fichiers confidentiels.
