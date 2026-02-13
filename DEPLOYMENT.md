# 🚀 Guide de Déploiement en Production - UniLogi

Ce guide vous accompagne étape par étape pour déployer UniLogi en production de manière sécurisée.

## 📋 Checklist Pré-Déploiement

Avant de déployer, assurez-vous que :

- [ ] Vous avez un nom de domaine (ex: unilogi.cm)
- [ ] Vous avez un serveur (VPS, AWS, DigitalOcean, etc.)
- [ ] Vous avez configuré les variables d'environnement
- [ ] Vous avez testé l'application localement
- [ ] Vous avez une stratégie de backup
- [ ] Vous avez configuré un service d'email professionnel

## 🌐 Option 1 : Déploiement sur VPS (Recommandé)

### Prérequis

- Un serveur Ubuntu 20.04+ ou Debian
- Accès SSH root
- Nom de domaine pointant vers le serveur

### Étape 1 : Préparation du Serveur

```bash
# Se connecter au serveur
ssh root@votre-serveur-ip

# Mettre à jour le système
apt update && apt upgrade -y

# Installer Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Installer PM2 (gestionnaire de processus)
npm install -g pm2

# Installer Nginx
apt install -y nginx

# Installer Certbot pour SSL
apt install -y certbot python3-certbot-nginx

# Créer un utilisateur pour l'application
adduser unilogi
usermod -aG sudo unilogi
su - unilogi
```

### Étape 2 : Cloner et Configurer l'Application

```bash
# Se placer dans le dossier home
cd ~

# Cloner le repository (ou upload via SFTP)
git clone https://github.com/votre-username/unilogi.git
cd unilogi

# Backend
cd backend
npm install --production

# Créer le fichier .env
nano .env
```

**Contenu du .env pour la production :**

```env
PORT=3000
NODE_ENV=production

# JWT - Générer avec: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=votre_secret_jwt_super_complexe_et_unique

# Email Production (exemple avec Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@unilogi.cm
EMAIL_PASSWORD=votre_mot_de_passe_application

FRONTEND_URL=https://unilogi.cm

# API Keys
ANTHROPIC_API_KEY=sk-ant-api03-...
GOOGLE_MAPS_API_KEY=AIza...

# Base de données (si MongoDB)
MONGODB_URI=mongodb://localhost:27017/unilogi
```

```bash
# Sauvegarder (Ctrl+O, Enter, Ctrl+X)

# Frontend
cd ../frontend
npm install
npm run build
```

### Étape 3 : Configuration PM2

```bash
# Revenir au dossier backend
cd ~/unilogi/backend

# Démarrer l'application avec PM2
pm2 start server-enhanced.js --name unilogi-backend

# Configurer PM2 pour démarrer au boot
pm2 startup
pm2 save

# Vérifier le statut
pm2 status
pm2 logs unilogi-backend
```

### Étape 4 : Configuration Nginx

```bash
# Devenir root temporairement
sudo su

# Créer la configuration Nginx
nano /etc/nginx/sites-available/unilogi
```

**Contenu du fichier :**

```nginx
server {
    listen 80;
    server_name unilogi.cm www.unilogi.cm;

    # Redirection HTTP vers HTTPS (sera activé après SSL)
    # return 301 https://$server_name$request_uri;

    # Frontend (fichiers statiques)
    root /home/unilogi/unilogi/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activer le site
ln -s /etc/nginx/sites-available/unilogi /etc/nginx/sites-enabled/

# Tester la configuration
nginx -t

# Redémarrer Nginx
systemctl restart nginx
```

### Étape 5 : Configurer SSL avec Let's Encrypt

```bash
# Obtenir le certificat SSL (gratuit)
certbot --nginx -d unilogi.cm -d www.unilogi.cm

# Le certificat se renouvelle automatiquement
# Tester le renouvellement
certbot renew --dry-run
```

Certbot modifie automatiquement la configuration Nginx pour ajouter HTTPS.

### Étape 6 : Configurer le Firewall

```bash
# Installer UFW
apt install -y ufw

# Autoriser SSH, HTTP et HTTPS
ufw allow ssh
ufw allow 'Nginx Full'

# Activer le firewall
ufw enable

# Vérifier le statut
ufw status
```

### Étape 7 : Configuration de la Base de Données

**Option A : MongoDB (Recommandé)**

```bash
# Installer MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org

# Démarrer MongoDB
systemctl start mongod
systemctl enable mongod

# Sécuriser MongoDB
mongo
```

Dans le shell MongoDB :
```javascript
use admin
db.createUser({
  user: "unilogiadmin",
  pwd: "mot_de_passe_très_complexe",
  roles: [{ role: "userAdminAnyDatabase", db: "admin" }]
})

use unilogi
db.createUser({
  user: "unilogi",
  pwd: "mot_de_passe_application",
  roles: [{ role: "readWrite", db: "unilogi" }]
})
exit
```

Modifier `/etc/mongod.conf` :
```yaml
security:
  authorization: enabled
```

Redémarrer MongoDB :
```bash
systemctl restart mongod
```

Mettre à jour `.env` :
```env
MONGODB_URI=mongodb://unilogi:mot_de_passe_application@localhost:27017/unilogi
```

### Étape 8 : Monitoring et Logs

```bash
# Voir les logs de l'application
pm2 logs unilogi-backend

# Voir les logs Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Monitoring avec PM2
pm2 monit

# Installer PM2 Web Dashboard (optionnel)
pm2 install pm2-logrotate
```

## 🔄 Option 2 : Déploiement avec Docker

### Dockerfile Backend

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server-enhanced.js"]
```

### Dockerfile Frontend

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    env_file:
      - ./backend/.env
    depends_on:
      - mongodb
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

Déployer :
```bash
docker-compose up -d
```

## ☁️ Option 3 : Déploiement Cloud

### Vercel (Frontend uniquement)

```bash
cd frontend
npm install -g vercel
vercel --prod
```

### Heroku (Backend)

```bash
cd backend

# Créer Procfile
echo "web: node server-enhanced.js" > Procfile

# Déployer
heroku create unilogi-api
heroku config:set JWT_SECRET=...
heroku config:set ANTHROPIC_API_KEY=...
git push heroku main
```

### Railway / Render

Ces plateformes détectent automatiquement Node.js et déploient l'application.

## 🔐 Sécurisation Post-Déploiement

### 1. Rate Limiting

Installer et configurer :
```bash
npm install express-rate-limit
```

Dans `server-enhanced.js` :
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);
```

### 2. Helmet.js

```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 3. CORS Production

```javascript
app.use(cors({
  origin: ['https://unilogi.cm', 'https://www.unilogi.cm'],
  credentials: true,
  optionsSuccessStatus: 200
}));
```

### 4. Backups Automatiques

```bash
# Script de backup MongoDB
nano ~/backup-unilogi.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/unilogi/backups"
mkdir -p $BACKUP_DIR

mongodump --db unilogi --out $BACKUP_DIR/mongo_$DATE
tar -czf $BACKUP_DIR/mongo_$DATE.tar.gz $BACKUP_DIR/mongo_$DATE
rm -rf $BACKUP_DIR/mongo_$DATE

# Garder seulement les 7 derniers backups
find $BACKUP_DIR -name "mongo_*.tar.gz" -mtime +7 -delete
```

```bash
chmod +x ~/backup-unilogi.sh

# Ajouter au crontab (tous les jours à 2h du matin)
crontab -e
```

Ajouter :
```
0 2 * * * /home/unilogi/backup-unilogi.sh
```

## 📊 Monitoring

### Uptime Monitoring

Utilisez des services comme :
- **UptimeRobot** (gratuit)
- **Pingdom**
- **StatusCake**

### Performance Monitoring

- **PM2 Plus** - Monitoring avancé pour PM2
- **New Relic** - Application Performance Monitoring
- **Datadog** - Infrastructure monitoring

## 🔄 Mise à jour de l'Application

```bash
# Se connecter au serveur
ssh unilogi@votre-serveur

# Aller dans le dossier
cd ~/unilogi

# Sauvegarder les changements locaux (si nécessaire)
git stash

# Récupérer les dernières modifications
git pull origin main

# Backend
cd backend
npm install --production
pm2 restart unilogi-backend

# Frontend
cd ../frontend
npm install
npm run build

# Recharger Nginx
sudo systemctl reload nginx
```

## 🆘 Dépannage Production

### L'application ne démarre pas

```bash
# Vérifier les logs PM2
pm2 logs unilogi-backend

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/error.log

# Vérifier le statut des services
pm2 status
sudo systemctl status nginx
sudo systemctl status mongod
```

### Erreur 502 Bad Gateway

```bash
# Vérifier que le backend tourne
pm2 status

# Redémarrer le backend
pm2 restart unilogi-backend

# Vérifier la configuration Nginx
sudo nginx -t
```

### Base de données inaccessible

```bash
# Vérifier MongoDB
sudo systemctl status mongod

# Voir les logs MongoDB
sudo tail -f /var/log/mongodb/mongod.log

# Redémarrer MongoDB
sudo systemctl restart mongod
```

## 📞 Support

Pour toute question sur le déploiement :
- Documentation : https://docs.unilogi.cm
- Email : devops@unilogi.cm
- Issues : https://github.com/votre-repo/unilogi/issues

---

**Bon déploiement ! 🚀**
