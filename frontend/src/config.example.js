// Configuration pour l'application UniLogi Enhanced
// Copiez ce fichier et renommez-le en "config.js"

export default {
  // URL de l'API backend
  API_URL: 'http://localhost:3001',
  
  // Clé API Google Maps
  // Obtenez votre clé sur: https://console.cloud.google.com/
  // Activez: Maps JavaScript API, Places API, Directions API, Geocoding API
  GOOGLE_MAPS_API_KEY: 'AIzaSyDKLcx0tFuIQVd4RIdpBWDniTQtf7O-f9I',
  
  // Configuration optionnelle
  DEFAULT_CENTER: {
    lat: 48.8566,  // Paris par défaut
    lng: 2.3522
  },
  
  DEFAULT_ZOOM: 13,
  
  // Rayon de recherche par défaut (en mètres)
  DEFAULT_SEARCH_RADIUS: 2000,
  
  // Nombre maximum de favoris
  MAX_FAVORITES: 100,
  
  // Activer le mode debug (affiche plus de logs dans la console)
  DEBUG_MODE: false
};
