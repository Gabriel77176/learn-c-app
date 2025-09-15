# Variables d'Environnement GitHub Actions

## Configuration des Secrets

Pour sécuriser vos clés Firebase en production, ajoutez ces secrets dans :
**Settings > Secrets and variables > Actions**

### Secrets Requis

```bash
# Firebase Configuration
FIREBASE_API_KEY=your-api-key-here
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### Utilisation dans les Workflows

```yaml
env:
  REACT_APP_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
  REACT_APP_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
  REACT_APP_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
  REACT_APP_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
  REACT_APP_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}
  REACT_APP_FIREBASE_MEASUREMENT_ID: ${{ secrets.FIREBASE_MEASUREMENT_ID }}
```

## Variables d'Environnement Public

Ces variables peuvent être définies directement dans les workflows :

```yaml
env:
  PUBLIC_URL: /learn-c-app
  CI: false
  GENERATE_SOURCEMAP: false
  REACT_APP_VERSION: ${{ github.sha }}
  REACT_APP_ENVIRONMENT: production
```

## Configuration Locale

Pour le développement local, créez `.env.local` :

```bash
# Firebase Configuration (valeurs réelles)
REACT_APP_FIREBASE_API_KEY=your-real-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Development Settings
REACT_APP_ENVIRONMENT=development
GENERATE_SOURCEMAP=true
```
