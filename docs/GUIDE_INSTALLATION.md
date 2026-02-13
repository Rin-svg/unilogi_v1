# 🔐 UniLogi - Application Sécurisée

## 📋 Guide d'installation et de configuration

### 🎯 Problème résolu

**Problème original :** 
- Le frontend appelait `http://localhost:3000` mais le backend tournait sur le port `3001`
- Manque de sécurité (pas de CORS, pas de validation, etc.)

**Solutions apportées :**
- ✅ URL API corrigée (port 3001)
- ✅ CORS configuré correctement
- ✅ HTTPS disponible (certificats SSL)
- ✅ Validation des données (email, mot de passe)
- ✅ Rate limiting (protection contre les attaques)
- ✅ Hashing bcrypt renforcé (coût 12)
- ✅ JWT avec expiration (7 jours)
- ✅ Headers de sécurité (Helmet)
- ✅ Sanitization des inputs

---

## 🚀 Installation

### 1. Backend

```bash
# Aller dans le dossier backend
cd backend

# Copier les fichiers sécurisés
cp /chemin/vers/backend-secure/server.js ./server.js
cp /chemin/vers/backend-secure/package.json ./package.json
cp /chemin/vers/backend-secure/.env.example ./.env

# Installer les dépendances
npm install

# IMPORTANT : Modifier le JWT_SECRET dans .env
# Générer une clé aléatoire sécurisée :
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copier la clé générée dans .env
```

### 2. Frontend

```bash
# Aller dans le dossier frontend
cd frontend/src/pages

# Remplacer le fichier Login.jsx
cp /chemin/vers/frontend-fixed/Login.jsx ./Login.jsx

# Vérifier que config.js contient bien :
# API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001'
```

---

## ▶️ Démarrage

### Backend

```bash
cd backend

# Mode développement (HTTP uniquement)
npm start

# OU avec nodemon (auto-reload)
npm run dev

# OU avec HTTPS (certificat auto-signé)
npm run https
```

### Frontend

```bash
cd frontend
npm run dev
```

---

## 🔒 Sécurité activée

### 1. **Helmet** - Headers HTTP sécurisés
- Content Security Policy
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options
- X-Content-Type-Options

### 2. **CORS** - Cross-Origin Resource Sharing
- Origines autorisées configurées
- Méthodes HTTP limitées
- Headers autorisés spécifiés

### 3. **Rate Limiting**
- **Auth endpoints** : 5 tentatives / 15 minutes
- **API endpoints** : 100 requêtes / 15 minutes
- Protection contre force brute

### 4. **Validation des données**
- Email : format valide + normalisation
- Mot de passe : 
  - Min. 8 caractères
  - Au moins 1 majuscule
  - Au moins 1 minuscule
  - Au moins 1 chiffre
- Sanitization des inputs (protection XSS)

### 5. **Hashing bcrypt**
- Coût : 12 (très sécurisé)
- Salage automatique
- Impossible à déchiffrer

### 6. **JWT (JSON Web Token)**
- Expiration : 7 jours
- Secret cryptographique fort
- Vérification à chaque requête

### 7. **HTTPS (optionnel)**
- Certificats SSL auto-signés (dev)
- Chiffrement des communications
- Protection MITM

---

## 🔐 Générer des certificats SSL (optionnel)

Pour activer HTTPS en développement :

```bash
cd backend

# Générer les certificats SSL
chmod +x generate-ssl.sh
./generate-ssl.sh

# Démarrer en mode HTTPS
npm run https
```

**Note :** Les certificats auto-signés génèrent un avertissement dans le navigateur (c'est normal en dev).

---

## 📝 Variables d'environnement (.env)

```env
# Port du serveur
PORT=3001
HTTPS_PORT=3443
USE_HTTPS=false

# JWT Secret - CHANGEZ-LE !
JWT_SECRET=VOTRE_CLE_SECRETE_ICI

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5

# Base de données
DB_FILE=db.json

# Environnement
NODE_ENV=development
```

---

## 🧪 Tester l'application

### 1. Inscription

1. Ouvrez http://localhost:5173
2. Cliquez sur "S'inscrire"
3. Remplissez le formulaire :
   - Nom : minimum 2 caractères
   - Email : format valide
   - Mot de passe : respecte les critères de sécurité
4. Cliquez sur "S'inscrire"

### 2. Connexion

1. Utilisez l'email et le mot de passe créés
2. Cliquez sur "Se connecter"
3. Vous êtes redirigé vers /home

---

## 🛡️ Bonnes pratiques de sécurité

### En développement :
- ✅ Utilisez le serveur HTTP (port 3001)
- ✅ JWT_SECRET peut rester simple
- ✅ Rate limiting configuré mais permissif

### En production :
- 🔥 **OBLIGATOIRE** : HTTPS uniquement
- 🔥 **OBLIGATOIRE** : JWT_SECRET cryptographiquement fort (64+ caractères)
- 🔥 **OBLIGATOIRE** : Rate limiting strict
- 🔥 **RECOMMANDÉ** : Variables d'environnement sécurisées
- 🔥 **RECOMMANDÉ** : Base de données réelle (PostgreSQL, MongoDB)
- 🔥 **RECOMMANDÉ** : Logs de sécurité
- 🔥 **RECOMMANDÉ** : Monitoring

---

## 🐛 Dépannage

### Erreur "Failed to fetch"
- Vérifiez que le backend tourne sur le port 3001
- Vérifiez le fichier `frontend/src/config.js`
- Vérifiez la console du navigateur (F12)

### Erreur CORS
- Vérifiez les origines autorisées dans le backend
- Vérifiez que le frontend utilise la bonne URL

### Erreur "Token invalide"
- Supprimez le localStorage : `localStorage.clear()`
- Reconnectez-vous

### Rate limit dépassé
- Attendez 15 minutes
- OU redémarrez le serveur backend

---

## 📦 Dépendances installées

### Backend :
- `express` : Framework web
- `cors` : Gestion CORS
- `jsonwebtoken` : Authentification JWT
- `bcryptjs` : Hashing de mots de passe
- `lowdb` : Base de données JSON
- `helmet` : Sécurité HTTP headers
- `express-rate-limit` : Rate limiting
- `validator` : Validation et sanitization

### Frontend :
- Aucune dépendance supplémentaire nécessaire
- Utilise la configuration existante

---

## 📊 Points de terminaison (API)

### Authentification
- `POST /api/register` - Inscription
- `POST /api/login` - Connexion

### Logements
- `GET /api/apartments` - Liste des logements
- `GET /api/apartments/:id` - Détails d'un logement
- `POST /api/apartments` - Créer un logement

### Favoris
- `GET /api/favorites` - Mes favoris
- `POST /api/favorites/:apartmentId` - Ajouter un favori
- `DELETE /api/favorites/:apartmentId` - Supprimer un favori

### Messages
- `GET /api/messages` - Mes messages
- `POST /api/messages` - Envoyer un message

### Données personnelles
- `GET /api/privacy-settings` - Paramètres de confidentialité
- `PUT /api/privacy-settings` - Modifier les paramètres
- `GET /api/download-data` - Télécharger mes données
- `DELETE /api/delete-account` - Supprimer mon compte

### Santé
- `GET /health` - Statut du serveur

---

## 🎉 Félicitations !

Votre application UniLogi est maintenant :
- ✅ Fonctionnelle (inscription/connexion corrigés)
- ✅ Sécurisée (HTTPS, validation, rate limiting)
- ✅ Prête pour le développement

**Prochaines étapes :**
1. Tester tous les cas d'usage
2. Personnaliser le design si nécessaire
3. Déployer en production avec HTTPS réel

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs du serveur
2. Vérifiez la console du navigateur (F12)
3. Consultez ce guide
4. Vérifiez que toutes les dépendances sont installées

---

**Développé avec ❤️ pour UniLogi**
