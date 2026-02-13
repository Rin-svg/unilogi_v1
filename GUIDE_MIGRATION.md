# Guide de Migration UniLogi : lowdb → PostgreSQL + Google Places API

## 📋 Table des Matières

1. [Installation de PostgreSQL](#installation-postgresql)
2. [Configuration de la base de données](#configuration-base-de-données)
3. [Migration des données](#migration-données)
4. [Activation de Google Places API](#activation-google-places)
5. [Configuration du backend](#configuration-backend)
6. [Configuration du frontend](#configuration-frontend)
7. [Déploiement](#déploiement)

---

## 1. Installation de PostgreSQL

### Sur Windows

1. Téléchargez PostgreSQL depuis [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Installez PostgreSQL (version 14 ou supérieure recommandée)
3. Notez le mot de passe du super utilisateur `postgres`

### Sur macOS

```bash
# Avec Homebrew
brew install postgresql@14
brew services start postgresql@14
```

### Sur Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Vérification de l'installation

```bash
psql --version
# Devrait afficher: psql (PostgreSQL) 14.x
```

---

## 2. Configuration de la base de données

### Créer l'utilisateur et la base de données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Dans le terminal PostgreSQL
CREATE USER unilogi_user WITH PASSWORD 'votre_mot_de_passe_securise';
CREATE DATABASE unilogi_db OWNER unilogi_user;
GRANT ALL PRIVILEGES ON DATABASE unilogi_db TO unilogi_user;

# Quitter
\q
```

### Créer le schéma de la base de données

```bash
# Depuis le répertoire du projet
cd backend
psql -U unilogi_user -d unilogi_db -f ../database/schema.sql
```

### Insérer les données de démonstration (optionnel)

```bash
psql -U unilogi_user -d unilogi_db -f ../database/seed.sql
```

### Vérification

```bash
psql -U unilogi_user -d unilogi_db

# Dans PostgreSQL
\dt  # Lister les tables
SELECT COUNT(*) FROM apartments;  # Vérifier les données
\q
```

---

## 3. Migration des données

Si vous avez déjà des données dans lowdb (fichier `db.json`), vous pouvez les migrer :

### Préparer l'environnement

```bash
cd backend
cp .env.example .env
# Éditer .env avec vos paramètres de connexion PostgreSQL
```

### Exemple de fichier .env

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=unilogi_db
DB_USER=unilogi_user
DB_PASSWORD=votre_mot_de_passe_securise
```

### Exécuter la migration

```bash
# Installer les dépendances
npm install

# Migrer les données
node migrate-from-lowdb.js path/to/db.json

# Ou si db.json est dans le répertoire courant
node migrate-from-lowdb.js ./db.json
```

---

## 4. Activation de Google Places API

### Étape 1 : Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Notez l'ID du projet

### Étape 2 : Activer les APIs nécessaires

1. Dans le menu, allez à **APIs & Services** → **Library**
2. Recherchez et activez les APIs suivantes :
   - **Maps JavaScript API** ✅
   - **Places API** ✅
   - **Geocoding API** ✅ (optionnel mais recommandé)

### Étape 3 : Créer une clé API

1. Allez à **APIs & Services** → **Credentials**
2. Cliquez sur **Create Credentials** → **API Key**
3. Votre clé API sera générée

### Étape 4 : Sécuriser la clé API (IMPORTANT !)

1. Cliquez sur la clé pour la modifier
2. **Restrictions d'application** :
   - Pour le développement : Choisir "HTTP referrers"
   - Ajouter : `http://localhost:5173/*`, `http://localhost:3001/*`
   - Pour la production : Ajouter votre domaine (`https://votredomaine.com/*`)

3. **Restrictions d'API** :
   - Sélectionnez "Restrict key"
   - Cochez uniquement :
     - Maps JavaScript API
     - Places API
     - Geocoding API

4. Sauvegardez

### Étape 5 : Configurer les quotas (optionnel)

Google offre $200 de crédit gratuit par mois. Pour éviter les surcoûts :

1. Allez à **APIs & Services** → **Dashboard**
2. Cliquez sur chaque API
3. Allez à **Quotas**
4. Définissez des limites quotidiennes (ex: 1000 requêtes/jour)

### Étape 6 : Ajouter la clé dans votre projet

#### Backend (.env)

```env
GOOGLE_MAPS_API_KEY=AIzaSy...votre_cle_api
```

#### Frontend (.env ou config.js)

```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...votre_cle_api
```

### Étape 7 : Charger l'API dans le HTML

Modifiez `frontend/index.html` :

```html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>UniLogi - Trouvez votre logement étudiant</title>
    
    <!-- Google Maps API avec Places Library -->
    <script src="https://maps.googleapis.com/maps/api/js?key=VOTRE_CLE_API&libraries=places&language=fr" async defer></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**⚠️ IMPORTANT** : Remplacez `VOTRE_CLE_API` par votre vraie clé, OU utilisez une variable d'environnement.

### Méthode recommandée avec variable d'environnement

Créez `frontend/.env` :

```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...votre_cle_api
```

Puis dans `index.html`, utilisez un script pour charger dynamiquement :

```html
<script>
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&language=fr`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
</script>
```

---

## 5. Configuration du backend

### Installation des dépendances

```bash
cd backend
npm install
```

Les nouvelles dépendances incluent :
- `pg` : Client PostgreSQL
- `dotenv` : Gestion des variables d'environnement

### Configuration .env complète

```env
# Serveur
PORT=3001
HTTPS_PORT=3443
USE_HTTPS=false
NODE_ENV=development

# JWT
JWT_SECRET=changez-cette-cle-secrete-en-production-faites-la-longue-et-complexe
JWT_EXPIRATION=7d

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=unilogi_db
DB_USER=unilogi_user
DB_PASSWORD=votre_mot_de_passe_securise
DB_SSL=false

# Google Maps
GOOGLE_MAPS_API_KEY=AIzaSy...votre_cle_api

# Frontend (pour CORS)
FRONTEND_URL=http://localhost:5173

# Sécurité
BCRYPT_ROUNDS=12
```

### Démarrage du serveur

```bash
# Mode développement
npm run dev

# Mode production
npm start
```

### Vérification

```bash
curl http://localhost:3001/health

# Devrait retourner :
# {"status":"ok","timestamp":"...","database":"PostgreSQL","https":false}
```

---

## 6. Configuration du frontend

### Installation du nouveau composant

Copiez le fichier `MapWithPlaces.jsx` dans :

```
frontend/src/components/MapWithPlaces.jsx
```

### Utilisation dans vos pages

```jsx
import MapWithPlaces from '../components/MapWithPlaces';

function ApartmentMap() {
  const [apartments, setApartments] = useState([]);

  useEffect(() => {
    // Charger les appartements depuis l'API
    fetch('http://localhost:3001/api/apartments', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => setApartments(data.apartments));
  }, []);

  return (
    <div className="h-screen">
      <MapWithPlaces 
        apartments={apartments}
        onApartmentClick={(apt) => console.log('Clicked:', apt)}
      />
    </div>
  );
}
```

### Fonctionnalités disponibles

Le nouveau composant `MapWithPlaces` offre :

✅ **Recherche de lieux** : Recherchez n'importe quel lieu (restaurant, école, hôpital, etc.)
✅ **Recherche à proximité** : Boutons rapides pour trouver les services autour des appartements
✅ **Marqueurs interactifs** : Cliquez sur les marqueurs pour voir les détails
✅ **Géolocalisation** : Affiche votre position actuelle
✅ **Autocomplete** : Suggestions en temps réel lors de la saisie
✅ **Détails des lieux** : Notes, adresses, types d'établissements

---

## 7. Déploiement

### Déploiement sur Heroku

#### Prérequis
- Compte Heroku
- Heroku CLI installé

#### Étapes

```bash
# Se connecter à Heroku
heroku login

# Créer une application
heroku create unilogi-app

# Ajouter PostgreSQL
heroku addons:create heroku-postgresql:mini

# Configurer les variables d'environnement
heroku config:set JWT_SECRET=votre_secret_jwt
heroku config:set GOOGLE_MAPS_API_KEY=votre_cle_google
heroku config:set FRONTEND_URL=https://votre-frontend.com
heroku config:set NODE_ENV=production

# Déployer
git push heroku main

# Initialiser la base de données
heroku pg:psql < database/schema.sql
heroku pg:psql < database/seed.sql
```

### Déploiement sur Render

1. Créez un compte sur [render.com](https://render.com)
2. Créez une nouvelle **PostgreSQL Database**
3. Créez un nouveau **Web Service**
4. Connectez votre repo GitHub
5. Configurez :
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
6. Ajoutez les variables d'environnement dans Render Dashboard
7. Connectez la base de données au service

### Déploiement sur Vercel (Frontend)

```bash
# Dans le répertoire frontend
npm install -g vercel
vercel

# Suivez les instructions
# Configurez les variables d'environnement dans Vercel Dashboard
```

---

## 🔐 Bonnes Pratiques de Sécurité

### Pour la clé Google Maps API

1. ✅ Ne jamais commiter la clé dans Git
2. ✅ Utiliser des restrictions par domaine
3. ✅ Utiliser des restrictions par API
4. ✅ Définir des quotas
5. ✅ Surveiller l'utilisation dans Google Cloud Console

### Pour PostgreSQL

1. ✅ Utilisez des mots de passe forts
2. ✅ Ne jamais exposer la base de données directement
3. ✅ Utilisez SSL en production (`DB_SSL=true`)
4. ✅ Limitez les connexions avec `max` dans pool config
5. ✅ Faites des sauvegardes régulières

### Pour JWT

1. ✅ Changez `JWT_SECRET` en production
2. ✅ Utilisez une chaîne longue et aléatoire (64+ caractères)
3. ✅ Définissez une expiration appropriée

---

## 🧪 Tests

### Tester l'API backend

```bash
# Santé du serveur
curl http://localhost:3001/health

# Inscription
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!","name":"Test User"}'

# Connexion
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

# Récupérer les appartements (avec token)
curl http://localhost:3001/api/apartments \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### Tester Google Places API

Ouvrez la console du navigateur sur votre page de carte et tapez :

```javascript
// Tester si l'API est chargée
console.log(window.google);

// Devrait afficher l'objet google avec maps et places
```

---

## 📊 Monitoring

### Surveiller PostgreSQL

```bash
# Connexions actives
psql -U unilogi_user -d unilogi_db -c "SELECT count(*) FROM pg_stat_activity;"

# Taille de la base
psql -U unilogi_user -d unilogi_db -c "SELECT pg_size_pretty(pg_database_size('unilogi_db'));"

# Performance des requêtes
psql -U unilogi_user -d unilogi_db -c "SELECT * FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;"
```

### Surveiller l'utilisation de Google Places API

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Dashboard**
3. Cliquez sur chaque API pour voir l'utilisation

---

## 🆘 Dépannage

### Problème : "Connection refused" PostgreSQL

```bash
# Vérifier que PostgreSQL est en cours d'exécution
sudo systemctl status postgresql  # Linux
brew services list  # macOS
```

### Problème : "FATAL: role 'unilogi_user' does not exist"

```bash
# Recréer l'utilisateur
sudo -u postgres psql -c "CREATE USER unilogi_user WITH PASSWORD 'votre_password';"
```

### Problème : Google Maps ne s'affiche pas

1. Vérifiez que la clé API est correcte dans `.env`
2. Vérifiez que les APIs sont activées dans Google Cloud
3. Vérifiez les restrictions de domaine
4. Ouvrez la console du navigateur pour voir les erreurs

### Problème : "This API project is not authorized"

Vérifiez que votre domaine est bien autorisé dans les restrictions de la clé API.

---

## 📚 Ressources

- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
- [Documentation Google Maps API](https://developers.google.com/maps/documentation)
- [Documentation Places API](https://developers.google.com/maps/documentation/places/web-service)
- [Node.js pg library](https://node-postgres.com/)

---

## ✅ Checklist de déploiement

- [ ] PostgreSQL installé et configuré
- [ ] Base de données créée avec schéma
- [ ] Données migrées (si applicable)
- [ ] Google Places API activée
- [ ] Clé API Google sécurisée avec restrictions
- [ ] Variables d'environnement configurées (.env)
- [ ] Backend démarré et testé
- [ ] Frontend connecté au backend
- [ ] Carte avec Places API fonctionnelle
- [ ] Tests d'intégration réussis
- [ ] Prêt pour le déploiement

---

**Bon développement ! 🚀**
