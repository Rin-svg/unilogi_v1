# Guide Docker pour UniLogi

## 🐳 Démarrage Rapide avec Docker

Si vous voulez démarrer tout le projet (PostgreSQL + Backend + Frontend) en une seule commande :

### Prérequis
- Docker Desktop installé ([Télécharger](https://www.docker.com/products/docker-desktop))
- Docker Compose (inclus dans Docker Desktop)

### Configuration

1. **Créer un fichier .env à la racine du projet** :

```bash
# Créez le fichier .env
touch .env
```

2. **Ajoutez votre clé Google Maps** :

```env
GOOGLE_MAPS_API_KEY=AIzaSy...votre_cle_api
```

### Démarrer tous les services

```bash
# Démarrer en mode détaché (en arrière-plan)
docker-compose up -d

# Ou démarrer avec les logs visibles
docker-compose up
```

Cette commande va :
1. ✅ Créer un conteneur PostgreSQL
2. ✅ Initialiser la base de données avec le schéma
3. ✅ Insérer les données de démonstration
4. ✅ Démarrer le backend sur http://localhost:3001
5. ✅ Démarrer le frontend sur http://localhost:5173
6. ✅ Démarrer pgAdmin sur http://localhost:5050 (optionnel)

### Vérifier que tout fonctionne

```bash
# Vérifier les conteneurs en cours d'exécution
docker-compose ps

# Devrait afficher :
# unilogi_postgres    running    5432/tcp
# unilogi_backend     running    3001/tcp
# unilogi_frontend    running    5173/tcp
# unilogi_pgadmin     running    5050/tcp
```

### Accéder aux services

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3001
- **pgAdmin** : http://localhost:5050
  - Email : admin@unilogi.com
  - Mot de passe : admin

### Voir les logs

```bash
# Logs de tous les services
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f frontend
```

### Arrêter les services

```bash
# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker-compose down -v
```

### Redémarrer un service spécifique

```bash
# Redémarrer le backend
docker-compose restart backend

# Reconstruire et redémarrer le backend
docker-compose up -d --build backend
```

## 🔧 Commandes Utiles

### Se connecter à la base de données

```bash
# Via docker-compose
docker-compose exec postgres psql -U unilogi_user -d unilogi_db

# Ou directement avec psql si installé localement
psql -h localhost -U unilogi_user -d unilogi_db
```

### Exécuter des commandes dans les conteneurs

```bash
# Ouvrir un shell dans le backend
docker-compose exec backend sh

# Ouvrir un shell dans postgres
docker-compose exec postgres bash

# Exécuter une commande npm dans le backend
docker-compose exec backend npm run migration
```

### Sauvegarder la base de données

```bash
# Créer un backup
docker-compose exec postgres pg_dump -U unilogi_user unilogi_db > backup.sql

# Restaurer un backup
docker-compose exec -T postgres psql -U unilogi_user -d unilogi_db < backup.sql
```

### Vider et recréer la base de données

```bash
# Arrêter les services
docker-compose down

# Supprimer le volume de la base de données
docker volume rm unilogi-migration_postgres_data

# Redémarrer (la base sera recréée automatiquement)
docker-compose up -d
```

## 🔍 Débogage

### Le backend ne démarre pas

```bash
# Vérifier les logs du backend
docker-compose logs backend

# Vérifier que PostgreSQL est prêt
docker-compose exec postgres pg_isready -U unilogi_user
```

### Problèmes de connexion à la base de données

```bash
# Vérifier que PostgreSQL est accessible
docker-compose exec backend ping postgres

# Vérifier les variables d'environnement
docker-compose exec backend env | grep DB_
```

### Le frontend ne se connecte pas au backend

1. Vérifiez que `VITE_API_URL` est bien configuré
2. Vérifiez les logs du backend : `docker-compose logs backend`
3. Testez l'API manuellement : `curl http://localhost:3001/health`

## 📦 Construction d'images personnalisées

### Construire les images

```bash
# Construire toutes les images
docker-compose build

# Construire une image spécifique
docker-compose build backend
docker-compose build frontend
```

### Pousser vers Docker Hub (optionnel)

```bash
# Tag de l'image
docker tag unilogi_backend:latest votre-username/unilogi-backend:latest

# Push vers Docker Hub
docker push votre-username/unilogi-backend:latest
```

## 🚀 Déploiement en Production

### Avec Docker Swarm

```bash
# Initialiser Swarm
docker swarm init

# Déployer la stack
docker stack deploy -c docker-compose.yml unilogi

# Vérifier les services
docker service ls
```

### Avec Kubernetes

Vous aurez besoin de créer des manifests Kubernetes (non inclus dans ce guide).

## 🔐 Sécurité en Production

⚠️ **Important** : Le `docker-compose.yml` fourni est configuré pour le développement.

Pour la production :

1. **Changez tous les mots de passe** :
   - PostgreSQL : `POSTGRES_PASSWORD`
   - pgAdmin : `PGADMIN_DEFAULT_PASSWORD`
   - JWT : `JWT_SECRET`

2. **Utilisez des secrets Docker** :
```yaml
secrets:
  db_password:
    external: true
```

3. **Activez SSL/TLS** pour PostgreSQL

4. **Utilisez un reverse proxy** (Nginx, Traefik)

5. **Configurez des health checks** appropriés

6. **Limitez les ressources** :
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
```

## 📊 Monitoring

### Avec Docker Stats

```bash
# Voir l'utilisation en temps réel
docker stats

# Pour des conteneurs spécifiques
docker stats unilogi_backend unilogi_postgres
```

### Logs centralisés

Vous pouvez configurer un système de logging comme ELK Stack ou Loki pour centraliser les logs.

## 🎯 Bonnes Pratiques

1. ✅ Utilisez `.env` pour les secrets (ne jamais commiter)
2. ✅ Définissez des health checks pour tous les services
3. ✅ Utilisez des volumes nommés pour la persistance
4. ✅ Configurez des limites de ressources
5. ✅ Utilisez des réseaux Docker pour isoler les services
6. ✅ Faites des backups réguliers de la base de données
7. ✅ Mettez à jour régulièrement les images de base

## 🆘 Dépannage Commun

### "Port already in use"

```bash
# Trouver le processus utilisant le port
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Tuer le processus ou changer le port dans docker-compose.yml
```

### "Cannot connect to Docker daemon"

```bash
# Démarrer Docker Desktop
# Ou sur Linux :
sudo systemctl start docker
```

### Volumes de données corrompus

```bash
# Arrêter tous les conteneurs
docker-compose down

# Supprimer les volumes
docker volume prune

# Redémarrer
docker-compose up -d
```

---

**Pour plus d'informations, consultez :**
- [Documentation Docker](https://docs.docker.com/)
- [Documentation Docker Compose](https://docs.docker.com/compose/)
