# 🚀 Guide de Déploiement - Learn-C App

## 📋 Prérequis

1. **Repository GitHub** configuré
2. **Firebase** projet créé et configuré
3. **Node.js** 18+ installé
4. **Git** configuré avec votre compte GitHub

## 🔧 Configuration Initiale

### 1. Modifier package.json

Remplacez `USERNAME` par votre nom d'utilisateur GitHub :

```json
{
  "homepage": "https://VOTRE-USERNAME.github.io/learn-c-app"
}
```

### 2. Configuration Firebase

Modifiez `src/firebase/config.ts` avec vos vraies credentials Firebase :

```typescript
const firebaseConfig = {
  apiKey: "votre-vraie-api-key",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  messagingSenderId: "votre-sender-id",
  appId: "votre-app-id",
  measurementId: "votre-measurement-id"
};
```

## 🚀 Déploiement Automatique (Recommandé)

### Étape 1: Activer GitHub Pages

1. Allez dans **Settings** > **Pages** de votre repository
2. Source : sélectionnez **"GitHub Actions"**
3. Sauvegardez

### Étape 2: Push vers master

```bash
git add .
git commit -m "feat: setup deployment workflow"
git push origin master
```

Le déploiement se lancera automatiquement ! 🎉

### Étape 3: Vérifier le Déploiement

- Allez dans l'onglet **Actions** de votre repository
- Vérifiez que le workflow "Deploy React App to GitHub Pages" s'exécute
- Une fois terminé, votre app sera disponible sur : `https://VOTRE-USERNAME.github.io/learn-c-app`

## 🛠️ Déploiement Manuel

Si vous préférez déployer manuellement :

```bash
# Installer gh-pages
npm install -g gh-pages

# Build et déployer
npm run deploy
```

## 📊 Workflows GitHub Actions

### 1. `github-pages.yml` - Déploiement
- **Déclencheur** : Push sur `master`
- **Actions** : Build + déploiement sur GitHub Pages
- **Durée** : ~2-3 minutes

### 2. `ci.yml` - Tests et Qualité
- **Déclencheur** : Push/PR sur `master`, `main`, `develop`
- **Actions** : Tests, linting, vérifications TypeScript
- **Matrix** : Node.js 18.x et 20.x

### 3. `deploy.yml` - CI/CD Complet
- **Déclencheur** : Push/PR sur `master`, `main`
- **Actions** : Tests complets, audit sécurité, déploiement

## 🔍 Vérification du Déploiement

### Vérifications Automatiques

Les workflows vérifient automatiquement :
- ✅ Compilation TypeScript
- ✅ Tests unitaires
- ✅ Build de production
- ✅ Audit de sécurité
- ✅ Taille du bundle

### Tests Locaux

Avant de déployer, testez localement :

```bash
# Vérifications
npm run type-check
npm run test:coverage
npm run build:prod

# Servir le build localement
npx serve -s build
```

## 🐛 Dépannage

### Erreur : "Process completed with exit code 1"

**Cause** : Erreur de build ou tests qui échouent

**Solution** :
```bash
# Vérifier localement
npm run build:prod
npm run test:coverage
npm run type-check
```

### Erreur : "Permission denied"

**Cause** : Permissions GitHub Actions

**Solution** :
1. Settings > Actions > General
2. Workflow permissions : "Read and write permissions"
3. Cocher "Allow GitHub Actions to create and approve pull requests"

### Page blanche après déploiement

**Cause** : Problème de routing avec React Router

**Solution** : Vérifiez que `PUBLIC_URL` est correct dans le workflow

### Firebase ne fonctionne pas en production

**Cause** : Configuration Firebase incorrecte

**Solution** :
1. Vérifiez les credentials dans `config.ts`
2. Configurez les domaines autorisés dans Firebase Console
3. Vérifiez les règles Firestore

## 📈 Optimisations

### Réduire la Taille du Bundle

```bash
# Analyser le bundle
npm run analyze

# Variables d'environnement dans le workflow
GENERATE_SOURCEMAP=false
CI=false
```

### Cache et Performance

Les workflows utilisent automatiquement :
- Cache npm pour les dépendances
- Artifacts pour réutiliser les builds
- Compression automatique

## 🔒 Sécurité

### Variables d'Environnement

Pour les secrets (clés API, etc.) :

1. Settings > Secrets and variables > Actions
2. Ajouter vos secrets
3. Les utiliser dans les workflows :

```yaml
env:
  REACT_APP_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
```

### Audit de Sécurité

Automatiquement exécuté dans les workflows :
```bash
npm audit --audit-level=high
```

## 📞 Support

- **Logs des workflows** : Onglet Actions de GitHub
- **Status du déploiement** : Badge dans le README
- **Firebase Console** : Monitoring et logs
- **GitHub Pages** : Settings > Pages pour le status

---

🎉 **Votre app Learn-C est maintenant déployée automatiquement !**
