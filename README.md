# UniLogi - Migration PostgreSQL + Google Places API

Migration complète de UniLogi depuis lowdb vers PostgreSQL avec intégration de Google Places API pour les recherches en temps réel.

## 🚀 Démarrage Rapide

### 1. Installer PostgreSQL

```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql@14

# Windows
# Téléchargez depuis https://www.postgresql.org/download/
```

### 2. Créer la base de données

```bash
sudo -u postgres psql
CREATE USER unilogi_user WITH PASSWORD 'votre_password';
CREATE DATABASE unilogi_db OWNER unilogi_user;
GRANT ALL PRIVILEGES ON DATABASE unilogi_db TO unilogi_user;
\q
```

### 3. Initialiser le schéma

```bash
cd database
psql -U unilogi_user -d unilogi_db -f schema.sql
psql -U unilogi_user -d unilogi_db -f seed.sql  # Données de démo
```

### 4. Configurer le backend

```bash
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos paramètres
npm run dev
```

### 5. Activer Google Places API

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un projet
3. Activez **Maps JavaScript API** et **Places API**
4. Créez une clé API
5. Ajoutez la clé dans `.env` :
   ```
   GOOGLE_MAPS_API_KEY=votre_cle_api
   ```

### 6. Configurer le frontend

```bash
cd frontend
npm install
# Ajoutez votre clé Google Maps dans .env ou config.js
VITE_GOOGLE_MAPS_API_KEY=votre_cle_api
npm run dev
```

## 📁 Structure du Projet

```
unilogi-migration/
├── database/
│   ├── schema.sql          # Schéma PostgreSQL
│   └── seed.sql            # Données de démonstration
├── backend/
│   ├── server-postgresql.js  # Nouveau serveur avec PostgreSQL
│   ├── migrate-from-lowdb.js # Script de migration
│   ├── package.json
│   └── .env.example
├── frontend/
│   └── components/
│       └── MapWithPlaces.jsx  # Composant carte avec Places API
└── GUIDE_MIGRATION.md      # Guide détaillé
```

## 🔑 Fonctionnalités Principales

### PostgreSQL
✅ Base de données relationnelle robuste
✅ Transactions ACID
✅ Contraintes d'intégrité référentielle
✅ Index optimisés pour les recherches
✅ Triggers automatiques pour updated_at
✅ Support des types JSONB pour flexibilité

### Google Places API
✅ Recherche de lieux en temps réel
✅ Recherche à proximité (restaurants, écoles, hôpitaux, etc.)
✅ Autocomplete de lieux
✅ Détails des lieux (notes, adresses, photos)
✅ Géolocalisation de l'utilisateur
✅ Marqueurs interactifs sur la carte

## 🔐 Variables d'Environnement

### Backend (.env)
```env
# Serveur
PORT=3001
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=unilogi_db
DB_USER=unilogi_user
DB_PASSWORD=votre_password

# JWT
JWT_SECRET=votre_secret_jwt_long_et_complexe

# Google Maps
GOOGLE_MAPS_API_KEY=AIzaSy...

# Frontend (CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
```

## 📊 Schéma de la Base de Données

- **users** : Utilisateurs de l'application
- **apartments** : Logements disponibles
- **favorites** : Favoris des utilisateurs
- **messages** : Messagerie entre utilisateurs
- **privacy_settings** : Paramètres de confidentialité
- **saved_routes** : Routes sauvegardées

## 🔄 Migration depuis lowdb

Si vous avez des données existantes dans lowdb :

```bash
cd backend
node migrate-from-lowdb.js path/to/db.json
```

Le script migrera automatiquement :
- Utilisateurs (avec mots de passe hashés)
- Appartements
- Favoris
- Messages
- Paramètres de confidentialité

## 🧪 Tests

```bash
# Test de santé du serveur
curl http://localhost:3001/health

# Test d'inscription
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Password123!","name":"Test"}'

# Test de connexion
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Password123!"}'
```

## 📱 Utilisation du Composant MapWithPlaces

```jsx
import MapWithPlaces from './components/MapWithPlaces';

function ApartmentPage() {
  const [apartments, setApartments] = useState([]);

  return (
    <div className="h-screen">
      <MapWithPlaces 
        apartments={apartments}
        onApartmentClick={(apt) => console.log(apt)}
      />
    </div>
  );
}
```

Le composant offre :
- 🔍 Barre de recherche de lieux
- 🎯 Boutons de recherche rapide (restaurants, écoles, transports, etc.)
- 📍 Marqueurs pour les appartements
- 🌍 Géolocalisation de l'utilisateur
- 📋 Liste des résultats de recherche
- 💬 InfoWindows avec détails

## 🚢 Déploiement

### Heroku
```bash
heroku create unilogi-app
heroku addons:create heroku-postgresql:mini
heroku config:set JWT_SECRET=...
heroku config:set GOOGLE_MAPS_API_KEY=...
git push heroku main
```

### Render
1. Créer une PostgreSQL Database
2. Créer un Web Service
3. Connecter au repo GitHub
4. Configurer les variables d'environnement

### Vercel (Frontend)
```bash
cd frontend
vercel
```

## 📚 Documentation Complète

Consultez `GUIDE_MIGRATION.md` pour :
- Instructions d'installation détaillées
- Configuration de Google Cloud Platform
- Sécurisation de la clé API
- Bonnes pratiques
- Dépannage
- Monitoring

## 🆘 Support

Pour toute question ou problème :
1. Consultez le `GUIDE_MIGRATION.md`
2. Vérifiez les logs du serveur
3. Consultez la console du navigateur
4. Vérifiez la configuration de Google Cloud

## 📄 Licence

MIT

---

**Développé avec ❤️ pour faciliter la recherche de logement étudiant**
