import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Heart, Phone, Filter, X, CheckCircle, Navigation, SlidersHorizontal } from 'lucide-react';
import { apartments as allApartments } from '../data';

// Coordonnées GPS des appartements (correspondant aux zones de data.js)
const APT_COORDS = [
  { id: 1, lat: 3.8622,  lng: 11.5125 }, // Ngoa-Ekellé UYI
  { id: 2, lat: 3.8055,  lng: 11.5485 }, // SOA
  { id: 3, lat: 3.8690,  lng: 11.5200 }, // Ekié
  { id: 4, lat: 4.0706,  lng: 9.7440  }, // Bonamoussadi Douala
  { id: 5, lat: 3.8855,  lng: 11.5253 }, // Ngousso
  { id: 6, lat: 3.8700,  lng: 11.4960 }, // Obili
  { id: 7, lat: 4.1571,  lng: 9.2429  }, // Molyko Buea
  { id: 8, lat: 4.0720,  lng: 9.7450  }, // Bonamoussadi IUC
];

const CENTERS = {
  all:          { lat: 4.0,    lng: 11.0,   zoom: 6  },
  yaoundé:      { lat: 3.8480, lng: 11.502, zoom: 13 },
  douala:       { lat: 4.0511, lng: 9.7679, zoom: 13 },
  buea:         { lat: 4.1571, lng: 9.2429, zoom: 14 },
};

const getFavIds = () => { try { return JSON.parse(localStorage.getItem('unilogi_favorites') || '[]'); } catch { return []; } };
const saveFavIds = (ids) => localStorage.setItem('unilogi_favorites', JSON.stringify(ids));

export default function MapEnhanced() {
  const navigate    = useNavigate();
  const mapRef      = useRef(null);    // div container
  const leafletMap  = useRef(null);    // Leaflet map instance
  const markersRef  = useRef([]);      // marker instances
  const [search, setSearch]           = useState('');
  const [cityFilter, setCityFilter]   = useState('all');
  const [maxPrice, setMaxPrice]       = useState(100000);
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(getFavIds);
  const [selectedApt, setSelectedApt] = useState(null);
  const [viewMode, setViewMode]       = useState('map'); // 'map' | 'list'

  // Appartements filtrés
  const filtered = allApartments.filter(apt => {
    const loc = apt.location.toLowerCase();
    const matchCity =
      cityFilter === 'all'      ? true :
      cityFilter === 'yaoundé'  ? (loc.includes('yaoundé') || loc.includes('ngoa') || loc.includes('soa') || loc.includes('obili') || loc.includes('ngousso') || loc.includes('ekié')) :
      cityFilter === 'douala'   ? loc.includes('douala') :
      cityFilter === 'buea'     ? loc.includes('buea') : true;
    const matchSearch = !search ||
      apt.title.toLowerCase().includes(search.toLowerCase()) ||
      apt.location.toLowerCase().includes(search.toLowerCase());
    return matchCity && matchSearch && apt.price <= maxPrice;
  });

  // Initialisation de la carte Leaflet
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    if (typeof window.L === 'undefined') return;

    const L = window.L;
    const map = L.map(mapRef.current, {
      center: [4.0, 11.0],
      zoom: 6,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    leafletMap.current = map;

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  // Mise à jour des marqueurs quand les filtres changent
  useEffect(() => {
    const L = window.L;
    if (!leafletMap.current || !L) return;
    const map = leafletMap.current;

    // Supprimer anciens marqueurs
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    filtered.forEach(apt => {
      const coords = APT_COORDS.find(c => c.id === apt.id);
      if (!coords) return;

      const isFav = favoriteIds.includes(apt.id);
      const color = isFav ? '#EF4444' : '#09392D';

      // Marqueur SVG custom
      const svgIcon = L.divIcon({
        className: '',
        html: `
          <div style="
            background:${color};
            color:white;
            padding:5px 8px;
            border-radius:20px;
            font-size:11px;
            font-weight:bold;
            white-space:nowrap;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
            border:2px solid white;
            cursor:pointer;
            position:relative;
          ">
            ${(apt.price/1000).toFixed(0)}k FCFA
            <div style="
              position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);
              border-left:6px solid transparent;border-right:6px solid transparent;
              border-top:8px solid ${color};
            "></div>
          </div>`,
        iconAnchor: [35, 38],
        popupAnchor: [0, -40],
      });

      const marker = L.marker([coords.lat, coords.lng], { icon: svgIcon })
        .addTo(map)
        .on('click', () => setSelectedApt(apt));

      markersRef.current.push(marker);
    });

    // Recentrer sur la ville filtrée
    const center = CENTERS[cityFilter] || CENTERS.all;
    map.setView([center.lat, center.lng], center.zoom);

  }, [filtered, favoriteIds, cityFilter]);

  const toggleFavorite = (id) => {
    const updated = favoriteIds.includes(id)
      ? favoriteIds.filter(f => f !== id)
      : [...favoriteIds, id];
    setFavoriteIds(updated);
    saveFavIds(updated);
  };

  const flyToApartment = (apt) => {
    const coords = APT_COORDS.find(c => c.id === apt.id);
    if (coords && leafletMap.current) {
      leafletMap.current.flyTo([coords.lat, coords.lng], 16, { duration: 1 });
    }
    setSelectedApt(apt);
    setViewMode('map');
  };

  return (
    <div className="flex flex-col h-screen pb-20 bg-gray-50">

      {/* ===== HEADER ===== */}
      <div className="bg-[#09392D] text-white px-4 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold">🗺️ Carte Interactive</h1>
          <div className="flex gap-2 items-center">
            <button onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
              className="bg-[#FFC80D] text-[#09392D] text-xs font-bold px-3 py-1.5 rounded-full">
              {viewMode === 'map' ? '📋 Liste' : '🗺 Carte'}
            </button>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-full transition ${showFilters ? 'bg-[#FFC80D] text-[#09392D]' : 'bg-white/20'}`}>
              <SlidersHorizontal size={17} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={15} className="absolute left-3 top-3 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un quartier ou campus..."
            className="w-full bg-white text-gray-800 pl-9 pr-8 py-2.5 rounded-xl text-sm outline-none" />
          {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-3"><X size={14} className="text-gray-400"/></button>}
        </div>

        {/* Villes */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { id: 'all',     label: 'Tout le Cameroun' },
            { id: 'yaoundé', label: '🏙️ Yaoundé' },
            { id: 'douala',  label: '🌊 Douala' },
            { id: 'buea',    label: '🌿 Buea' },
          ].map(c => (
            <button key={c.id} onClick={() => setCityFilter(c.id)}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition flex-shrink-0
                ${cityFilter === c.id ? 'bg-[#FFC80D] text-[#09392D]' : 'bg-white/20 text-white'}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtres prix */}
      {showFilters && (
        <div className="mx-4 mt-2 bg-white rounded-2xl shadow-lg p-4 border border-gray-100 flex-shrink-0 z-10">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-bold text-[#09392D]">Prix maximum</p>
            <span className="text-sm font-black text-[#FFC80D]">{maxPrice.toLocaleString()} FCFA</span>
          </div>
          <input type="range" min="25000" max="100000" step="5000" value={maxPrice}
            onChange={e => setMaxPrice(Number(e.target.value))}
            className="w-full accent-[#09392D]" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>25 000</span><span>100 000 FCFA</span>
          </div>
          <button onClick={() => { setMaxPrice(100000); setShowFilters(false); }}
            className="mt-2 w-full py-2 bg-[#09392D] text-white rounded-xl text-sm font-bold">
            Appliquer
          </button>
        </div>
      )}

      {/* Compteur */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
        <p className="text-xs text-gray-500">
          <span className="font-bold text-[#09392D]">{filtered.length}</span> logement{filtered.length !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-gray-400">Cliquez un marqueur pour les détails</p>
      </div>

      {/* ===== CARTE LEAFLET ===== */}
      {viewMode === 'map' && (
        <div className="flex-1 relative mx-0 overflow-hidden" style={{ minHeight: '400px' }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />

          {/* Popup appartement sélectionné */}
          {selectedApt && (
            <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-2xl p-4 z-[1000] border border-gray-100">
              <button onClick={() => setSelectedApt(null)}
                className="absolute top-3 right-3 text-gray-400"><X size={18}/></button>
              <div className="flex gap-3">
                <img src={selectedApt.image} alt={selectedApt.title}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#09392D] text-sm leading-tight mb-0.5">{selectedApt.title}</h3>
                  <div className="flex items-center text-gray-400 text-xs mb-1">
                    <MapPin size={10} className="mr-1"/> {selectedApt.location}
                  </div>
                  <p className="text-[#09392D] font-black text-base">{selectedApt.price.toLocaleString()} <span className="text-xs font-normal text-gray-400">FCFA/mois</span></p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => toggleFavorite(selectedApt.id)}
                  className={`p-2.5 rounded-xl border-2 transition ${favoriteIds.includes(selectedApt.id) ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                  <Heart size={18} className={favoriteIds.includes(selectedApt.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}/>
                </button>
                <button onClick={() => navigate(`/apartment/${selectedApt.id}`)}
                  className="flex-1 bg-[#09392D] text-white py-2.5 rounded-xl text-sm font-bold">
                  Voir le logement
                </button>
                <a href={`tel:${selectedApt.contact}`}
                  className="p-2.5 bg-[#FFC80D] rounded-xl flex items-center justify-center">
                  <Phone size={18} className="text-[#09392D]"/>
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== VUE LISTE ===== */}
      {viewMode === 'list' && (
        <div className="flex-1 overflow-y-auto px-4 space-y-3 pt-1 pb-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <MapPin size={40} className="mx-auto text-gray-300 mb-3"/>
              <p className="text-gray-500">Aucun logement pour ces critères</p>
            </div>
          ) : filtered.map(apt => (
            <div key={apt.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative cursor-pointer" onClick={() => flyToApartment(apt)}>
                <img src={apt.image} alt={apt.title} className="w-full h-40 object-cover"/>
                {apt.isCertified && (
                  <div className="absolute top-3 left-3 bg-[#389038] text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle size={10}/> Certifié
                  </div>
                )}
                <button onClick={e => { e.stopPropagation(); toggleFavorite(apt.id); }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow">
                  <Heart size={16} className={favoriteIds.includes(apt.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}/>
                </button>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-[#09392D] text-sm mb-0.5">{apt.title}</h3>
                <p className="text-gray-400 text-xs flex items-center mb-2"><MapPin size={10} className="mr-1"/>{apt.location}</p>
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#09392D]">{apt.price.toLocaleString()} <span className="text-xs font-normal text-gray-400">FCFA/mois</span></span>
                  <div className="flex gap-1.5">
                    <button onClick={() => flyToApartment(apt)}
                      className="bg-[#09392D] text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                      <Navigation size={12}/> Carte
                    </button>
                    <a href={`tel:${apt.contact}`}
                      className="bg-[#FFC80D] text-[#09392D] text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                      <Phone size={12}/> Appeler
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
