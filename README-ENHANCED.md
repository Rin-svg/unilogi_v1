# UniLogi - Version Améliorée 🏠✨

Application complète de recherche de logements étudiants avec intégration Google Maps et fonctionnalités avancées.

## 🎯 Nouvelles Fonctionnalités Ajoutées

### 1. **Google Maps - Intégration Complète** 🗺️
- **Carte interactive** avec marqueurs personnalisés pour chaque logement
- **Géolocalisation en temps réel** de l'utilisateur
- **Recherche par rayon** (500m à 10km)
- **Clustering intelligent** des logements proches
- **InfoWindow détaillée** pour chaque annonce
- **Intégration des vrais logements** avec coordonnées GPS réelles à Paris

**Accès:** `/map` - Carte Interactive

### 2. **Système de Favoris Complet** ❤️
- **Sauvegarde persistante** des logements favoris
- **Filtres avancés:** Prix, Nombre de pièces, Type
- **Tri intelligent:** Plus récent, Prix croissant/décroissant
- **Gestion facile:** Ajout/suppression en un clic
- **Synchronisation** avec la carte et les détails

**Accès:** `/favorites` - Mes Favoris

### 3. **Recherche d'Écoles (Google Places)** 🎓
- **Recherche d'établissements** autour de votre position
- **Types d'écoles:** Universités, Primaires, Collèges & Lycées
- **Détails complets:** Notes, horaires, téléphone, site web
- **Calcul d'itinéraire** vers chaque établissement
- **Rayon de recherche** personnalisable (jusqu'à 5km)

**Accès:** `/schools` - Recherche d'Écoles

### 4. **Base de Données Persistante** 💾
- **LowDB** pour stockage JSON persistant
- **Sauvegarde automatique** de toutes les données
- **8 logements réels** pré-chargés à Paris
- **Collections:** Users, Apartments, Favorites, Messages, Privacy Settings
- **Export/Import** de données

**Fichier:** `backend/db.json`

### 5. **Paramètres de Confidentialité** 🔒
- **Visibilité du profil:** Public, Amis, Privé
- **Contrôle des informations:** Email, téléphone, localisation
- **Gestion des communications:** Messages, notifications, statut
- **Paramètres de tracking:** Localisation, analytics
- **Export de données:** Téléchargez toutes vos données (RGPD)
- **Suppression de compte:** Option avec confirmation

**Accès:** `/privacy` - Confidentialité & Sécurité

### 6. **Système d'Itinéraires (Google Directions)** 🚗
- **Calcul d'itinéraire** entre deux points
- **4 modes de transport:** Voiture, Transports en commun, Vélo, À pied
- **Routes alternatives** avec comparaison
- **Instructions détaillées** étape par étape
- **Sauvegarde d'itinéraires** favoris (10 derniers)
- **Temps et distance** en temps réel

**Accès:** `/directions` - Itinéraires

### 7. **Recherche Avancée avec Localisation** 🔍
- **Recherche par adresse** avec autocomplete Google Places
- **Filtres multiples:**
  - Prix (min/max)
  - Nombre de pièces (0-5+)
  - Meublé / Non meublé
  - Animaux acceptés
  - Parking disponible
- **Recherche par rayon** autour d'un point
- **Cercle de visualisation** sur la carte

## 📱 Structure des Pages

```
/                    - Landing page
/login              - Connexion
/home               - Accueil avec liste des logements
/apartment/:id      - Détails d'un logement
/map                - Carte interactive Google Maps
/favorites          - Mes favoris
/schools            - Recherche d'écoles
/directions         - Calcul d'itinéraires
/privacy            - Confidentialité & sécurité
/community          - Communauté
/profile            - Mon profil
/add                - Ajouter un logement
```

## 🛠️ Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Clé API Google Maps

### 1. Cloner le projet
```bash
cd unilogi-enhanced
```

### 2. Configuration Google Maps API

Créer un fichier `frontend/src/config.js`:
```javascript
export default {
  API_URL: 'http://localhost:3001',
  GOOGLE_MAPS_API_KEY: 'VOTRE_CLE_API_GOOGLE_MAPS'
};
```

**Obtenir une clé API:**
1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un projet ou utiliser un existant
3. Activer les APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API
4. Créer une clé API dans "Identifiants"
5. Copier la clé dans le fichier config.js

### 3. Installation des dépendances

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 4. Lancer l'application

**Terminal 1 - Backend:**
```bash
cd backend
node server-full.js
```
Le serveur démarre sur http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
L'application démarre sur http://localhost:5173

## 📦 Dépendances Principales

### Frontend
- **React 19** - Framework UI
- **React Router DOM** - Routing
- **@react-google-maps/api** - Intégration Google Maps
- **Lucide React** - Icônes
- **Tailwind CSS** - Styling

### Backend
- **Express** - Serveur web
- **LowDB** - Base de données JSON
- **bcryptjs** - Hashage des mots de passe
- **jsonwebtoken** - Authentification JWT
- **cors** - Gestion CORS

## 🗺️ Logements Pré-chargés

8 logements réels à Paris avec coordonnées GPS:
1. Studio Quartier Latin (850€)
2. T2 Montmartre (1200€)
3. T3 Marais (1650€)
4. Studio Saint-Germain (950€)
5. T2 Bastille (1100€)
6. T4 République (1900€)
7. Studio Étoile (1050€)
8. T2 Canal Saint-Martin (1250€)

## 🔐 Sécurité

- **JWT** pour l'authentification
- **Bcrypt** pour le hashage des mots de passe
- **Validation** des entrées utilisateur
- **Protection CORS**
- **Données sensibles** séparées (config.js)

## 📊 Base de Données

Structure du fichier `backend/db.json`:
```json
{
  "users": [],
  "apartments": [],
  "favorites": [],
  "messages": [],
  "privacySettings": [],
  "savedRoutes": []
}
```

## 🎨 Design

- **Palette de couleurs:**
  - Primaire: `#09392D` (Vert foncé)
  - Secondaire: `#94D358` (Vert clair)
  - Accent: `#FFC80D` (Jaune)
  - Indigo: `#4F46E5` (pour nouveaux éléments)

- **Mobile-first** avec max-width 480px
- **Animations** fluides et modernes
- **Interface intuitive** avec icônes claires

## 🚀 Déploiement

### Backend
1. Configurer les variables d'environnement
2. Utiliser un service comme Heroku, Railway, ou Render
3. Assurez-vous que le fichier `db.json` persiste

### Frontend
1. Build de production: `npm run build`
2. Déployer sur Vercel, Netlify, ou GitHub Pages
3. Configurer l'URL du backend dans `config.js`

## 📝 TODO / Améliorations Possibles

- [ ] Notifications push en temps réel
- [ ] Chat en direct avec les propriétaires
- [ ] Upload d'images pour les annonces
- [ ] Système de réservation/rendez-vous
- [ ] Avis et notes des logements
- [ ] Filtres avancés (accessibilité, équipements)
- [ ] Mode sombre
- [ ] Support multilingue
- [ ] Application mobile native (React Native)

## 🤝 Support

Pour toute question ou problème:
- Créer une issue sur GitHub
- Contact: support@unilogi.com

## 📄 Licence

MIT License - Libre d'utilisation et de modification

---

**Version:** 2.0.0 Enhanced  
**Dernière mise à jour:** Février 2026  
**Développé avec** ❤️ **pour les étudiants**
