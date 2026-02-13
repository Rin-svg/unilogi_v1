// Configuration de l'application
// En production, utilisez des variables d'environnement

const config = {
  // URL de l'API backend
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  
  // Clé API Google Maps
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDKLcx0tFuIQVd4RIdpBWDniTQtf7O-f9I',
  
  // Configuration de l'environnement
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
};

export default config;
