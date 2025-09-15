# Learn-C App 📚

[![Deploy to GitHub Pages](https://github.com/USERNAME/learn-c-app/actions/workflows/github-pages.yml/badge.svg)](https://github.com/USERNAME/learn-c-app/actions/workflows/github-pages.yml)
[![CI](https://github.com/USERNAME/learn-c-app/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/learn-c-app/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=flat&logo=Firebase&logoColor=white)](https://firebase.google.com/)

Une application web moderne pour l'apprentissage et l'évaluation en programmation, construite avec React, TypeScript, et Firebase.

## 🚀 Fonctionnalités

- **Gestion des leçons** : Création et organisation de cours
- **Exercices interactifs** : QCM, exercices de code avec coloration syntaxique, exercices texte
- **Système de soumission** : Interface de review avec support Markdown
- **Gestion des utilisateurs** : Rôles étudiant/enseignant/admin
- **Correction en ligne** : Système de notation et feedback
- **Interface moderne** : Design responsive avec Material-UI

## 🛠️ Technologies

- **Frontend** : React 18, TypeScript, Material-UI
- **Backend** : Firebase (Firestore, Authentication)
- **Déploiement** : GitHub Pages avec GitHub Actions
- **Outils** : ESLint, Jest, Monaco Editor, React Syntax Highlighter

## 📦 Installation

```bash
# Cloner le repository
git clone https://github.com/USERNAME/learn-c-app.git
cd learn-c-app

# Installer les dépendances
npm install

# Configurer Firebase
# 1. Créer un projet Firebase
# 2. Modifier src/firebase/config.ts avec vos credentials
# 3. Configurer Firestore et Authentication

# Lancer en développement
npm start
```

## 🔧 Configuration Firebase

1. Créez un projet sur [Firebase Console](https://console.firebase.google.com)
2. Activez **Firestore Database** et **Authentication**
3. Copiez la configuration dans `src/firebase/config.ts` :

```typescript
const firebaseConfig = {
  apiKey: "votre-api-key",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  // ... autres clés
};
```

4. Configurez les règles Firestore (voir `firestore.rules`)

## 🚀 Déploiement

### Automatique (GitHub Actions)

Le déploiement se fait automatiquement sur chaque push vers `master` :

1. **Modifier `package.json`** : Remplacez `USERNAME` par votre nom d'utilisateur GitHub :
   ```json
   "homepage": "https://VOTRE-USERNAME.github.io/learn-c-app"
   ```

2. **Activer GitHub Pages** :
   - Aller dans Settings > Pages
   - Source : "GitHub Actions"

3. **Push vers master** :
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin master
   ```

### Manuel

```bash
# Build de production
npm run build

# Déploiement avec gh-pages (optionnel)
npm install -g gh-pages
gh-pages -d build
```

## 🧪 Tests et Qualité

```bash
# Tests unitaires
npm test

# Vérification TypeScript
npx tsc --noEmit

# Build de production
npm run build

# Audit de sécurité
npm audit
```

## 📁 Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── Auth/           # Authentification
│   ├── Exercise/       # Types d'exercices
│   └── Layout/         # Navigation et layout
├── contexts/           # Contexts React (Auth)
├── firebase/           # Configuration Firebase
├── pages/              # Pages principales
├── services/           # Services Firebase
└── types/              # Types TypeScript
```

## 🔐 Rôles Utilisateur

- **Étudiant** : Consulter leçons, faire exercices, voir ses soumissions
- **Enseignant** : Créer leçons/exercices, corriger soumissions, gérer étudiants
- **Admin** : Toutes les permissions

## 🎯 Workflows GitHub Actions

### 🚢 Déploiement (`github-pages.yml`)
- Déclenché sur push vers `master`
- Build et déploiement automatique sur GitHub Pages

### 🧪 CI (`ci.yml`)
- Tests sur Node.js 18.x et 20.x
- Vérifications TypeScript et sécurité
- Couverture de code

### 🔍 Qualité (`deploy.yml`)
- Tests complets avec matrice
- Audit de sécurité
- Vérification des dépendances

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- **Issues** : [GitHub Issues](https://github.com/USERNAME/learn-c-app/issues)
- **Documentation** : Voir le wiki du projet
- **Firebase** : [Documentation officielle](https://firebase.google.com/docs)

---

Fait avec ❤️ pour l'éducation en programmation