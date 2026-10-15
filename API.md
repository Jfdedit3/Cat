# API Cat Gallery

Base URL de production : `https://cat-gallery-ashen.vercel.app`

## 1. Obtenir tous les noms des fichiers

**GET** `/api/files`

```bash
curl -s "https://cat-gallery-ashen.vercel.app/api/files"
```

La réponse JSON contient :
- `names` : tableau des noms de fichiers ;
- `blobs` : métadonnées de chaque fichier, dont `url`, `downloadUrl`, `pathname`, `name`, `size`, `contentType`, `type` (alias de `contentType`) et `uploadedAt` ;
- `count` : nombre total de fichiers.

La liste est paginée côté serveur pour inclure tous les fichiers.

Afficher uniquement les noms :

```bash
curl -s "https://cat-gallery-ashen.vercel.app/api/files" | jq -r '.names[]'
```

Afficher les noms et les chemins exacts :

```bash
curl -s "https://cat-gallery-ashen.vercel.app/api/files" | jq -r '.blobs[] | [.name, .pathname] | @tsv'
```

## 2. Supprimer un fichier

La suppression est disponible avec **DELETE** `/api/files`. Elle est protégée par un jeton d'administration robuste. Une suppression de blob est définitive.

### Configuration obligatoire

Génère un secret aléatoire (64 caractères hexadécimaux) :

```bash
openssl rand -hex 32
```

Dans Vercel, ouvre le projet **cat-gallery-ashen** → **Settings** → **Environment Variables**, puis définis `CAT_ADMIN_TOKEN` avec ce secret pour l'environnement Production. Enregistre puis redéploie le projet. Le serveur refuse les jetons de moins de 32 caractères.

Garde ce jeton privé : ne le mets jamais dans le code du site, dans une page web publique ou dans un dépôt Git. Mets aussi à jour la valeur utilisée par tes scripts locaux.

### Commande de suppression

D'abord, récupère les `pathname` exacts (le nom peut contenir un suffixe aléatoire) :

```bash
curl -s "https://cat-gallery-ashen.vercel.app/api/files" | jq -r '.blobs[] | [.name, .pathname] | @tsv'
```

Définis ensuite la variable `CAT_ADMIN_TOKEN` dans ton terminal, puis copie le `pathname` exact du fichier choisi :

```bash
export CAT_ADMIN_TOKEN='COLLE_ICI_TON_SECRET'
PATHNAME='COLLE_ICI_LE_PATHNAME_EXACT'

curl -X DELETE "https://cat-gallery-ashen.vercel.app/api/files" \
  -H "Authorization: Bearer $CAT_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg pathname "$PATHNAME" '{pathname:$pathname}')"
```

N'utilise pas littéralement les valeurs de remplacement ci-dessus : remplace-les par ton jeton secret et le pathname réellement retourné par l'API.

Succès :

```json
{"success":true,"deleted":"CHEMIN_EXACT_DU_FICHIER"}
```

Erreurs possibles : `401` jeton absent/invalide, `404` fichier introuvable, `503` jeton d'administration absent ou trop court.

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
