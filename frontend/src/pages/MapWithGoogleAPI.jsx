import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, X } from 'lucide-react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const MapWithGoogleAPI = () => {
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 3.8667, lng: 11.5167 }); // Yaoundé par défaut
  const [searchQuery, setSearchQuery] = useState('');

  // Styles de la carte
  const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '16px',
  };

  const schools = [
    { id: 'ub', name: 'Université de Buea', color: '#3B82F6', lat: 4.1633, lng: 9.2445 },
    { id: 'uy1', name: 'Université Yaoundé 1', color: '#10B981', lat: 3.8667, lng: 11.5167 },
    { id: 'poly', name: 'Polytechnique Yaoundé', color: '#EF4444', lat: 3.8558, lng: 11.5033 },
    { id: 'enset', name: 'ENSET Douala', color: '#8B5CF6', lat: 4.0511, lng: 9.7679 },
    { id: 'ude', name: 'Université de Dschang', color: '#F59E0B', lat: 5.4479, lng: 10.0538 },
  ];

  const apartments = [
    {
      id: 1,
      school: 'ub',
      name: 'Studio Molyko',
      address: 'Quartier Molyko, Buea',
      distance: '0.5 km',
      price: 55000,
      lat: 4.1650,
      lng: 9.2460,
      type: 'Studio',
      rooms: 1,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
    },
    {
      id: 2,
      school: 'poly',
      name: 'Colocation Melen',
      address: 'Melen, Yaoundé',
      distance: '0.3 km',
      price: 60000,
      lat: 3.8570,
      lng: 11.5050,
      type: 'Chambre en colocation',
      rooms: 3,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
    },
    {
      id: 3,
      school: 'uy1',
      name: 'Studio Ngoa-Ekelle',
      address: 'Ngoa-Ekelle, Yaoundé',
      distance: '1.2 km',
      price: 45000,
      lat: 3.8680,
      lng: 11.5180,
      type: 'Studio',
      rooms: 1,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
    },
    {
      id: 4,
      school: 'enset',
      name: 'Appartement 2 pièces Akwa',
      address: 'Akwa, Douala',
      distance: '0.8 km',
      price: 75000,
      lat: 4.0520,
      lng: 9.7690,
      type: 'Appartement',
      rooms: 2,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
    },
    {
      id: 5,
      school: 'ude',
      name: 'Chambre en résidence',
      address: 'Centre-ville, Dschang',
      distance: '0.6 km',
      price: 35000,
      lat: 5.4490,
      lng: 10.0550,
      type: 'Chambre',
      rooms: 1,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
    },
  ];

  const filteredApartments = selectedSchool === 'all' 
    ? apartments 
    : apartments.filter(apt => apt.school === selectedSchool);

  const handleSchoolSelect = (schoolId) => {
    setSelectedSchool(schoolId);
    if (schoolId !== 'all') {
      const school = schools.find(s => s.id === schoolId);
      if (school) {
        setMapCenter({ lat: school.lat, lng: school.lng });
      }
    }
  };

  const handleApartmentClick = (apartment) => {
    setSelectedApartment(apartment);
    setMapCenter({ lat: apartment.lat, lng: apartment.lng });
  };

  // Icône personnalisée pour les appartements
  const apartmentIcon = {
    path: "M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z",
    fillColor: "#FFC80D",
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: "#09392D",
    scale: 1.5,
  };

  return (
    <div className="pb-24 bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#09392D] to-[#0d4d3a] text-white p-6">
        <h2 className="text-2xl font-bold mb-4">Carte & Localisation</h2>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-300" />
          <input 
            type="text" 
            placeholder="Rechercher un logement, une école..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/20 border border-white/30 pl-10 pr-4 py-2.5 rounded-xl text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-[#FFC80D]"
          />
        </div>
      </div>

      {/* Google Map */}
      <div className="p-6">
        <LoadScript googleMapsApiKey="AIzaSyDKLcx0tFuIQVd4RIdpBWDniTQtf7O-f9I">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={13}
            options={{
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }]
                }
              ],
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
            }}
          >
            {/* Marqueurs des universités */}
            {schools.map((school) => (
              <Marker
                key={school.id}
                position={{ lat: school.lat, lng: school.lng }}
                icon={{
                  path: window.google?.maps.SymbolPath.CIRCLE,
                  fillColor: school.color,
                  fillOpacity: 1,
                  strokeWeight: 3,
                  strokeColor: '#FFFFFF',
                  scale: 12,
                }}
                label={{
                  text: school.name.charAt(0),
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                  fontSize: '14px',
                }}
                title={school.name}
              />
            ))}

            {/* Marqueurs des appartements */}
            {filteredApartments.map((apartment) => (
              <Marker
                key={apartment.id}
                position={{ lat: apartment.lat, lng: apartment.lng }}
                icon={apartmentIcon}
                onClick={() => handleApartmentClick(apartment)}
              />
            ))}

            {/* InfoWindow pour l'appartement sélectionné */}
            {selectedApartment && (
              <InfoWindow
                position={{ lat: selectedApartment.lat, lng: selectedApartment.lng }}
                onCloseClick={() => setSelectedApartment(null)}
              >
                <div className="p-2 max-w-xs">
                  <img 
                    src={selectedApartment.image} 
                    alt={selectedApartment.name}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  <h3 className="font-bold text-[#09392D] mb-1">
                    {selectedApartment.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedApartment.address}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {selectedApartment.distance}
                    </span>
                    <span className="font-bold text-[#389038]">
                      {selectedApartment.price.toLocaleString()} FCFA/mois
                    </span>
                  </div>
                  <button 
                    className="mt-2 w-full bg-[#09392D] text-white py-2 rounded-lg text-sm font-bold hover:bg-[#0d4d3a] transition"
                    onClick={() => window.location.href = `/apartment/${selectedApartment.id}`}
                  >
                    Voir les détails
                  </button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>

        {/* Note d'installation */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>📍 Important :</strong> Pour utiliser Google Maps, vous devez :
            <br />1. Créer une clé API sur Google Cloud Console
            <br />2. Activer "Maps JavaScript API" et "Places API"
            <br />3. Remplacer "VOTRE_CLE_API_GOOGLE_MAPS" dans le code
            <br />4. Installer : <code className="bg-blue-100 px-2 py-1 rounded">npm install @react-google-maps/api</code>
          </p>
        </div>
      </div>

      {/* Filtres par campus */}
      <div className="px-6 pb-6 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-[#09392D]" />
          <h3 className="font-bold text-[#09392D]">Filtrer par campus</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSchoolSelect('all')}
            className={`px-4 py-2 rounded-full font-medium text-sm transition ${
              selectedSchool === 'all'
                ? 'bg-[#09392D] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>
          {schools.map((school) => (
            <button
              key={school.id}
              onClick={() => handleSchoolSelect(school.id)}
              className={`px-4 py-2 rounded-full font-medium text-sm transition flex items-center gap-2 ${
                selectedSchool === school.id
                  ? 'bg-[#09392D] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: school.color }}
              ></span>
              {school.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des logements */}
      <div className="p-6">
        <h3 className="font-bold text-[#09392D] mb-4">
          Logements disponibles ({filteredApartments.length})
        </h3>
        
        <div className="space-y-4">
          {filteredApartments.map((apt) => (
            <div 
              key={apt.id} 
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer"
              onClick={() => handleApartmentClick(apt)}
            >
              <div className="flex gap-4">
                <img 
                  src={apt.image} 
                  alt={apt.name}
                  className="w-28 h-28 object-cover"
                />
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-[#09392D]">{apt.name}</h4>
                    <span className="text-xs bg-[#94D358] text-[#09392D] px-2 py-1 rounded-full font-bold whitespace-nowrap">
                      {apt.price.toLocaleString()} FCFA
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin size={16} className="text-[#389038]" />
                    <span>{apt.distance} du campus</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{apt.type}</span>
                    <span>•</span>
                    <span>{apt.rooms} pièce{apt.rooms > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapWithGoogleAPI;
