#!/bin/bash

# Script pour générer des certificats SSL auto-signés pour le développement
# NE PAS UTILISER EN PRODUCTION - Utilisez Let's Encrypt ou un vrai certificat

echo "🔐 Génération des certificats SSL pour le développement..."

# Créer le dossier ssl s'il n'existe pas
mkdir -p ssl

# Générer une clé privée
openssl genrsa -out ssl/server.key 2048

# Générer un certificat auto-signé valide pour 365 jours
openssl req -new -x509 -key ssl/server.key -out ssl/server.cert -days 365 \
  -subj "/C=FR/ST=IDF/L=Paris/O=UniLogi/OU=Dev/CN=localhost"

echo "✅ Certificats SSL générés avec succès!"
echo "📁 Fichiers créés:"
echo "   - ssl/server.key (clé privée)"
echo "   - ssl/server.cert (certificat)"
echo ""
echo "⚠️  ATTENTION: Ces certificats sont auto-signés et destinés au développement uniquement."
echo "   Votre navigateur affichera un avertissement de sécurité (c'est normal)."
echo ""
echo "🚀 Pour démarrer le serveur HTTPS:"
echo "   npm run https"
