# 🚀 Guide de Démarrage Rapide - UniLogi Enhanced

## ⚡ Installation en 5 minutes

### 1. Prérequis
- Node.js 18+ installé
- Compte Google Cloud (gratuit)

### 2. Obtenir une clé Google Maps API

**Option A - Compte existant:**
```
1. Aller sur https://console.cloud.google.com/
2. Sélectionner votre projet ou en créer un
3. Menu > APIs & Services > Enabled APIs & Services
4. Cliquer "ENABLE APIS AND SERVICES"
5. Rechercher et activer:
   ✓ Maps JavaScript API
   ✓ Places API
   ✓ Directions API
   ✓ Geocoding API
6. Menu > APIs & Services > Credentials
7. Cliquer "CREATE CREDENTIALS" > API Key
8. Copier la clé
```

**Option B - Nouveau compte:**
```
1. Aller sur https://console.cloud.google.com/
2. Se connecter avec un compte Google
3. Créer un nouveau projet "UniLogi"
4. Suivre les étapes de l'Option A
```

### 3. Configuration

**Créer le fichier de configuration:**

Dans `frontend/src/config.js`:
```javascript
export default {
  API_URL: 'http://localhost:3001',
  GOOGLE_MAPS_API_KEY: 'VOTRE_CLE_ICI'  // Remplacer par votre clé
};
```

### 4. Installation

**Terminal 1 - Backend:**
```bash
cd backend
npm install
node server-full.js
```

Vous devriez voir:
```
🚀 Serveur démarré sur le port 3001
📊 Base de données: /path/to/db.json
🏠 8 logements disponibles
👥 0 utilisateurs enregistrés
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Vous devriez voir:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 5. Tester l'application

1. Ouvrir http://localhost:5173/
2. Cliquer sur "Commencer" ou "Se connecter"
3. Créer un compte avec:
   - Email: test@unilogi.com
   - Mot de passe: Test1234!
   - Nom: Test User

4. Explorer les fonctionnalités:
   - ✅ Carte interactive (`/map`)
   - ✅ Favoris (`/favorites`)
   - ✅ Écoles (`/schools`)
   - ✅ Itinéraires (`/directions`)
   - ✅ Confidentialité (`/privacy`)

## 🎯 Fonctionnalités Principales

### Carte Interactive
1. Aller sur la page "Carte"
2. Autoriser la géolocalisation
3. Voir les 8 logements sur la carte
4. Cliquer sur un marqueur pour voir les détails
5. Utiliser les filtres pour affiner la recherche

### Recherche d'Écoles
1. Aller dans Profil > Recherche d'écoles
2. Sélectionner le type (Universités, Écoles, Lycées)
3. Chercher ou cliquer "Me localiser"
4. Cliquer "Rechercher"
5. Voir les établissements sur la carte
6. Cliquer pour plus de détails et itinéraire

### Favoris
1. Sur la carte ou la liste, cliquer sur ❤️
2. Aller dans Profil > Mes Favoris
3. Filtrer et trier vos favoris
4. Supprimer facilement

### Itinéraires
1. Aller dans Profil > Itinéraires
2. Entrer point de départ (ou utiliser "Ma position")
3. Entrer destination
4. Choisir le mode de transport
5. Cliquer "Rechercher"
6. Comparer les routes alternatives
7. Sauvegarder l'itinéraire

## 🐛 Résolution des Problèmes

### Problème: "Google Maps API error"
**Solution:**
- Vérifier que la clé API est correcte dans `config.js`
- Vérifier que les APIs sont bien activées
- Attendre quelques minutes après activation des APIs

### Problème: "Network Error" ou "Failed to fetch"
**Solution:**
- Vérifier que le backend tourne sur le port 3001
- Vérifier l'URL dans `config.js`
- Désactiver les bloqueurs de publicité

### Problème: "Cannot find module 'lowdb'"
**Solution:**
```bash
cd backend
npm install lowdb@7.0.1
```

### Problème: La carte ne s'affiche pas
**Solution:**
- Ouvrir la console du navigateur (F12)
- Vérifier les erreurs
- S'assurer que la clé Google Maps est valide
- Effacer le cache du navigateur

### Problème: Pas de logements sur la carte
**Solution:**
- Redémarrer le backend
- Vérifier que `db.json` existe et contient des données
- Supprimer `db.json` et redémarrer (il sera recréé)

## 📱 Utilisation Mobile

Pour tester sur mobile:
```bash
# Terminal frontend
npm run dev -- --host

# Puis accéder depuis votre mobile:
http://VOTRE_IP_LOCAL:5173
```

## 🎓 Logements de Test

Voici les 8 logements pré-chargés:

1. **Studio Quartier Latin** - 850€/mois - 75005 Paris
2. **T2 Montmartre** - 1200€/mois - 75018 Paris
3. **T3 Marais** - 1650€/mois - 75003 Paris
4. **Studio Saint-Germain** - 950€/mois - 75006 Paris
5. **T2 Bastille** - 1100€/mois - 75011 Paris
6. **T4 République** - 1900€/mois - 75003 Paris
7. **Studio Étoile** - 1050€/mois - 75008 Paris
8. **T2 Canal Saint-Martin** - 1250€/mois - 75010 Paris

## 🔑 Compte de Test

Créez simplement un nouveau compte avec:
- Email: Votre choix
- Mot de passe: Minimum 6 caractères
- Nom: Votre choix

Les données sont sauvegardées dans `backend/db.json`

## 📚 Ressources

- [Documentation Google Maps API](https://developers.google.com/maps)
- [React Google Maps API](https://react-google-maps-api-docs.netlify.app/)
- [LowDB Documentation](https://github.com/typicode/lowdb)

## 💡 Astuces

1. **Développement:** Utilisez deux terminaux (backend + frontend)
2. **Débogage:** Ouvrez la console navigateur (F12)
3. **Reset:** Supprimez `db.json` pour réinitialiser les données
4. **Performance:** Fermez les autres applications pour améliorer la vitesse

## 🎉 Prêt à démarrer!

Tout est configuré! Profitez de toutes les fonctionnalités de UniLogi Enhanced.

**Besoin d'aide?** Consultez le README-ENHANCED.md pour plus de détails.
