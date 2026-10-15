# API d'upload de fichiers

Le dépôt expose `POST /api/upload` comme endpoint de négociation pour les uploads Vercel Blob. Pour envoyer un fichier depuis un terminal, utilise le script `scripts/upload.mjs` : il utilise cet endpoint puis transfère le fichier directement vers Blob, avec multipart pour les gros fichiers. Cela évite d'envoyer le contenu complet du fichier dans une fonction Vercel.

## Prérequis

- Node.js 20 ou plus récent.
- Le projet cloné et ses dépendances installées avec `npm install`.
- Le site déployé sur Vercel.
- Le stockage Vercel Blob relié au projet, avec `BLOB_READ_WRITE_TOKEN` configuré dans l'environnement de déploiement.

## Utilisation

Depuis la racine du dépôt :

```bash
node scripts/upload.mjs "./application.apk" "https://TON-SITE.vercel.app"
```

Le script affiche la progression et renvoie un JSON contenant notamment `url`, `downloadUrl`, `pathname`, le type MIME et la taille.

Tu peux aussi définir l'URL du site dans la variable d'environnement `CAT_UPLOAD_URL`, puis lancer :

```bash
node scripts/upload.mjs "./application.apk"
```

Les fichiers sont publiés dans le stockage public, donc toute personne qui possède leur URL peut y accéder. Ne téléverse pas de fichiers privés avec cette méthode.

## Utilisation depuis un autre programme

L'endpoint `/api/upload` est le point de terminaison du protocole d'upload client Vercel Blob ; ce n'est pas un endpoint qui accepte directement les octets d'un fichier via `curl --data-binary`. Pour les gros fichiers, utilise le script fourni ou le SDK `@vercel/blob/client` avec `handleUploadUrl: "https://TON-SITE.vercel.app/api/upload"` et `multipart: true`.
