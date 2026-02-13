import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search, Navigation, X } from 'lucide-react';

const MapWithPlaces = ({ apartments = [], onApartmentClick }) => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);
  const searchBoxRef = useRef(null);
  const placesServiceRef = useRef(null);

  // Initialiser Google Maps
  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const initialCenter = apartments.length > 0
      ? { lat: apartments[0].latitude, lng: apartments[0].longitude }
      : { lat: 48.8566, lng: 2.3522 }; // Paris par défaut

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: initialCenter,
      zoom: 13,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ],
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });

    setMap(mapInstance);
    placesServiceRef.current = new window.google.maps.places.PlacesService(mapInstance);

    // Obtenir la localisation de l'utilisateur
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(pos);
          
          // Ajouter un marqueur pour la position de l'utilisateur
          new window.google.maps.Marker({
            position: pos,
            map: mapInstance,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
            title: 'Votre position',
          });
        },
        () => {
          console.log('Erreur: Service de géolocalisation refusé');
        }
      );
    }
  }, [apartments]);

  // Ajouter les marqueurs pour les appartements
  useEffect(() => {
    if (!map) return;

    // Supprimer les anciens marqueurs
    markers.forEach(marker => marker.setMap(null));

    // Créer de nouveaux marqueurs
    const newMarkers = apartments.map(apartment => {
      const marker = new window.google.maps.Marker({
        position: { lat: apartment.latitude, lng: apartment.longitude },
        map: map,
        title: apartment.title,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#EF4444',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${apartment.title}</h3>
            <p style="margin: 4px 0; color: #666;">${apartment.address}</p>
            <p style="margin: 4px 0; font-weight: bold; color: #EF4444;">${apartment.price}€/mois</p>
            <p style="margin: 4px 0; color: #666;">${apartment.rooms} pièce(s) - ${apartment.surface}m²</p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        if (onApartmentClick) {
          onApartmentClick(apartment);
        }
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Ajuster les limites de la carte pour inclure tous les marqueurs
    if (apartments.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      apartments.forEach(apt => {
        bounds.extend({ lat: apt.latitude, lng: apt.longitude });
      });
      map.fitBounds(bounds);
    }
  }, [map, apartments, onApartmentClick]);

  // Recherche de lieux avec Google Places API
  const searchPlaces = useCallback(() => {
    if (!placesServiceRef.current || !searchQuery.trim() || !map) return;

    const request = {
      query: searchQuery,
      location: map.getCenter(),
      radius: 5000, // 5km de rayon
    };

    placesServiceRef.current.textSearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setSearchResults(results);
        
        // Afficher les résultats sur la carte
        results.forEach((place, index) => {
          const marker = new window.google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name,
            label: {
              text: String(index + 1),
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
            },
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 15,
              fillColor: '#10B981',
              fillOpacity: 0.9,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 10px; max-width: 250px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${place.name}</h3>
                <p style="margin: 4px 0; color: #666;">${place.formatted_address}</p>
                ${place.rating ? `<p style="margin: 4px 0;">⭐ ${place.rating}/5</p>` : ''}
              </div>
            `,
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
            setSelectedPlace(place);
          });

          setMarkers(prev => [...prev, marker]);
        });

        // Centrer sur les résultats
        if (results.length > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          results.forEach(place => {
            bounds.extend(place.geometry.location);
          });
          map.fitBounds(bounds);
        }
      } else {
        console.error('Erreur de recherche Places:', status);
      }
    });
  }, [searchQuery, map]);

  // Recherche à proximité
  const searchNearby = useCallback((type) => {
    if (!placesServiceRef.current || !map) return;

    const location = userLocation || map.getCenter();

    const request = {
      location: location,
      radius: 1000, // 1km de rayon
      type: [type], // 'restaurant', 'school', 'hospital', 'transit_station', etc.
    };

    placesServiceRef.current.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setSearchResults(results);
        
        // Afficher les résultats
        results.slice(0, 10).forEach((place, index) => {
          const marker = new window.google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: '#8B5CF6',
              fillOpacity: 0.9,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 10px; max-width: 250px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${place.name}</h3>
                <p style="margin: 4px 0; color: #666;">${place.vicinity}</p>
                ${place.rating ? `<p style="margin: 4px 0;">⭐ ${place.rating}/5</p>` : ''}
              </div>
            `,
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          setMarkers(prev => [...prev, marker]);
        });
      }
    });
  }, [map, userLocation]);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    // Supprimer les marqueurs de recherche (garder les appartements)
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
  };

  return (
    <div className="relative w-full h-full">
      {/* Barre de recherche */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-white rounded-lg shadow-lg p-4 space-y-3">
          {/* Recherche de lieux */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={searchBoxRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchPlaces()}
                placeholder="Rechercher un lieu (école, restaurant, métro...)"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={searchPlaces}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Rechercher
            </button>
            {searchResults.length > 0 && (
              <button
                onClick={clearSearch}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Boutons de recherche rapide */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => searchNearby('restaurant')}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition"
            >
              🍽️ Restaurants
            </button>
            <button
              onClick={() => searchNearby('school')}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition"
            >
              🎓 Écoles
            </button>
            <button
              onClick={() => searchNearby('hospital')}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition"
            >
              🏥 Hôpitaux
            </button>
            <button
              onClick={() => searchNearby('transit_station')}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition"
            >
              🚇 Transport
            </button>
            <button
              onClick={() => searchNearby('park')}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition"
            >
              🌳 Parcs
            </button>
            <button
              onClick={() => searchNearby('supermarket')}
              className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition"
            >
              🛒 Supermarchés
            </button>
          </div>
        </div>
      </div>

      {/* Résultats de recherche */}
      {searchResults.length > 0 && (
        <div className="absolute top-40 right-4 z-10 w-80 bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-4 border-b">
            <h3 className="font-bold text-lg">Résultats ({searchResults.length})</h3>
          </div>
          <div className="divide-y">
            {searchResults.map((place, index) => (
              <div
                key={place.place_id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition"
                onClick={() => {
                  map.setCenter(place.geometry.location);
                  map.setZoom(15);
                  setSelectedPlace(place);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{place.name}</h4>
                    <p className="text-xs text-gray-600 truncate">
                      {place.formatted_address || place.vicinity}
                    </p>
                    {place.rating && (
                      <p className="text-xs text-yellow-600 mt-1">
                        ⭐ {place.rating}/5 ({place.user_ratings_total} avis)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Carte */}
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Légende */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span>Appartements</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span>Résultats de recherche</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span>Votre position</span>
        </div>
      </div>
    </div>
  );
};

export default MapWithPlaces;
