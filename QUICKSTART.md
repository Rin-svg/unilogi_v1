# 🚀 DÉMARRAGE RAPIDE - UNILOGI MIGRATION

## Option 1 : Avec Docker (RECOMMANDÉ - Le plus simple)

```bash
# 1. Créer un fichier .env avec votre clé Google Maps
echo "GOOGLE_MAPS_API_KEY=votre_cle_api" > .env

# 2. Démarrer tous les services
docker-compose up -d

# 3. Accéder à l'application
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
# pgAdmin: http://localhost:5050
```

✅ Tout est configuré automatiquement : PostgreSQL, Backend, Frontend !

---

## Option 2 : Installation Manuelle

### Étape 1 : PostgreSQL

```bash
# Installer PostgreSQL
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql@14

# Démarrer PostgreSQL et créer la base
sudo -u postgres psql
CREATE USER unilogi_user WITH PASSWORD 'votre_password';
CREATE DATABASE unilogi_db OWNER unilogi_user;
GRANT ALL PRIVILEGES ON DATABASE unilogi_db TO unilogi_user;
\q

# Initialiser le schéma
cd database
psql -U unilogi_user -d unilogi_db -f schema.sql
psql -U unilogi_user -d unilogi_db -f seed.sql
```

### Étape 2 : Backend

```bash
cd backend
npm install
cp .env.example .env

# Éditer .env avec vos paramètres :
# - DB_PASSWORD
# - JWT_SECRET
# - GOOGLE_MAPS_API_KEY

npm run dev
```

### Étape 3 : Frontend

```bash
cd frontend
npm install

# Configurer la clé Google Maps dans .env
echo "VITE_GOOGLE_MAPS_API_KEY=votre_cle_api" > .env
echo "VITE_API_URL=http://localhost:3001" >> .env

npm run dev
```

---

## 🔑 Obtenir une Clé Google Maps API

1. Allez sur https://console.cloud.google.com/
2. Créez un nouveau projet
3. Activez les APIs :
   - Maps JavaScript API
   - Places API
4. Créez une clé API dans "Credentials"
5. **IMPORTANT** : Ajoutez des restrictions :
   - Application : HTTP referrers
   - Ajoutez : `http://localhost:5173/*`
   - Restrictions API : Maps JavaScript API, Places API

---

## 📁 Structure des Fichiers

```
unilogi-migration/
├── database/
│   ├── schema.sql          ← Schéma PostgreSQL
│   └── seed.sql            ← Données de démo
├── backend/
│   ├── server-postgresql.js ← Serveur avec PostgreSQL
│   ├── migrate-from-lowdb.js ← Script de migration
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   └── components/
│       └── MapWithPlaces.jsx ← Composant carte + Places API
├── docker-compose.yml      ← Configuration Docker
├── GUIDE_MIGRATION.md      ← Guide complet détaillé
├── DOCKER_GUIDE.md         ← Guide Docker
└── README.md               ← Documentation générale
```

---

## ✅ Vérification

### Tester le Backend

```bash
curl http://localhost:3001/health
# Devrait retourner : {"status":"ok","database":"PostgreSQL"}
```

### Tester Google Maps

Ouvrez http://localhost:5173, la carte devrait s'afficher avec :
- Les appartements marqués en rouge
- Une barre de recherche fonctionnelle
- Des boutons de recherche rapide

---

## 🔄 Migration depuis lowdb

Si vous avez déjà un fichier `db.json` :

```bash
cd backend
node migrate-from-lowdb.js ../path/to/db.json
```

---

## 📚 Documentation

- **GUIDE_MIGRATION.md** : Guide complet étape par étape
- **DOCKER_GUIDE.md** : Tout sur Docker
- **README.md** : Vue d'ensemble du projet

---

## 🆘 Problèmes Courants

### Docker ne démarre pas
```bash
# Vérifier que Docker Desktop est lancé
docker version

# Voir les logs
docker-compose logs -f
```

### PostgreSQL : connexion refusée
```bash
# Vérifier que PostgreSQL est en cours
sudo systemctl status postgresql  # Linux
brew services list  # macOS
```

### Google Maps ne s'affiche pas
1. Vérifiez votre clé API dans .env
2. Vérifiez que les APIs sont activées dans Google Cloud
3. Vérifiez les restrictions de domaine
4. Regardez la console du navigateur (F12)

---

## 🎯 Prochaines Étapes

1. ✅ Testez l'application localement
2. ✅ Personnalisez les composants frontend
3. ✅ Ajoutez vos propres appartements
4. ✅ Configurez pour la production
5. ✅ Déployez sur Heroku/Render/Vercel

---

**Bon développement ! 🚀**

Pour toute question, consultez les guides détaillés.
