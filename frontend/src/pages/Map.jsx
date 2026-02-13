import { MapPin, Search, Filter } from 'lucide-react';
import { useState } from 'react';

const Map = () => {
  const [selectedSchool, setSelectedSchool] = useState('all');

  const schools = [
    { id: 'ub', name: 'Université de Buea', color: 'bg-blue-500', lat: 4.1633, lng: 9.7445 },
    { id: 'uis', name: 'Université Yaoundé 1', color: 'bg-green-500', lat: 3.8667, lng: 11.5167 },
    { id: 'poly', name: 'Polytechnique Yaoundé', color: 'bg-red-500', lat: 3.8558, lng: 11.5033 },
    { id: 'enset', name: 'ENSET Douala', color: 'bg-purple-500', lat: 4.0511, lng: 9.7679 },
  ];

  const apartments = [
    {
      id: 1,
      school: 'ub',
      name: 'Studio Molyko',
      distance: '0.5 km',
      price: 55000,
      lat: 4.1633,
      lng: 9.7445,
    },
    {
      id: 2,
      school: 'poly',
      name: 'Colocation Melen',
      distance: '0.3 km',
      price: 60000,
      lat: 3.8558,
      lng: 11.5033,
    },
    {
      id: 3,
      school: 'uis',
      name: 'Studio Ngoa-Ekelle',
      distance: '1.2 km',
      price: 45000,
      lat: 3.8667,
      lng: 11.5167,
    },
  ];

  const filteredApartments = selectedSchool === 'all' 
    ? apartments 
    : apartments.filter(apt => apt.school === selectedSchool);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#09392D] to-[#0d4d3a] text-white p-6">
        <h2 className="text-2xl font-bold mb-4">Campus & Localisation</h2>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-300" />
          <input 
            type="text" 
            placeholder="Rechercher une école..." 
            className="w-full bg-white/20 border border-white/30 pl-10 pr-4 py-2.5 rounded-xl text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-[#FFC80D]"
          />
        </div>
      </div>

      {/* Carte stylisée (SVG) */}
      <div className="bg-gradient-to-br from-blue-50 to-green-50 p-6 relative h-72">
        <svg 
          viewBox="0 0 400 300" 
          className="w-full h-full border-2 border-gray-200 rounded-2xl bg-white/50"
        >
          {/* Grille */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="400" height="300" fill="url(#grid)" />
          
          {/* Campus markers */}
          {schools.map((school) => (
            <g key={school.id}>
              {/* Cercle de rayon */}
              <circle 
                cx={school.lat * 60} 
                cy={school.lng * 20} 
                r="30" 
                fill="currentColor" 
                opacity="0.1" 
                className={school.color}
              />
              {/* Marker */}
              <circle 
                cx={school.lat * 60} 
                cy={school.lng * 20} 
                r="8" 
                className={school.color}
                style={{ cursor: 'pointer' }}
              />
              <text 
                x={school.lat * 60} 
                y={school.lng * 20 + 20} 
                textAnchor="middle" 
                className="text-xs fill-gray-700"
              >
                {school.name.split(' ')[0]}
              </text>
            </g>
          ))}

          {/* Apartments */}
          {filteredApartments.map((apt) => (
            <g key={apt.id}>
              <rect 
                x={apt.lat * 60 - 6} 
                y={apt.lng * 20 - 6} 
                width="12" 
                height="12" 
                fill="#FFC80D" 
                rx="2"
              />
              <text 
                x={apt.lat * 60} 
                y={apt.lng * 20 - 15} 
                textAnchor="middle" 
                className="text-xs fill-gray-600 font-bold"
              >
                {apt.price.toLocaleString()} FCFA
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Filtres */}
      <div className="p-6 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-[#09392D]" />
          <h3 className="font-bold text-[#09392D]">Filtrer par campus</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSchool('all')}
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
              onClick={() => setSelectedSchool(school.id)}
              className={`px-4 py-2 rounded-full font-medium text-sm transition flex items-center gap-2 ${
                selectedSchool === school.id
                  ? 'bg-[#09392D] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className={`w-3 h-3 rounded-full ${school.color}`}></span>
              {school.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des logements à proximité */}
      <div className="p-6">
        <h3 className="font-bold text-[#09392D] mb-4">Logements à proximité ({filteredApartments.length})</h3>
        
        <div className="space-y-4">
          {filteredApartments.map((apt) => (
            <div 
              key={apt.id} 
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-[#09392D]">{apt.name}</h4>
                <span className="text-xs bg-[#94D358] text-[#09392D] px-2 py-1 rounded-full font-bold">
                  {apt.price.toLocaleString()} FCFA
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} className="text-[#389038]" />
                <span>{apt.distance} du campus</span>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <button className="text-sm font-bold text-[#09392D] hover:text-[#389038] transition">
                  Voir les détails →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Map;
