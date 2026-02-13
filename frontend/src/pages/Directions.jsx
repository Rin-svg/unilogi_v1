import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Car, Bike, PersonStanding, Clock, Route, X, Loader } from 'lucide-react';

const CAMPUSES = [
  { name: "UYI — Ngoa-Ekellé, Yaoundé",          lat: 3.8622, lng: 11.5125 },
  { name: "UYII / ENSP — SOA, Yaoundé",           lat: 3.8050, lng: 11.5480 },
  { name: "ENAM — Ngousso, Yaoundé",              lat: 3.8855, lng: 11.5253 },
  { name: "UYII — Obili, Yaoundé",                lat: 3.8700, lng: 11.4960 },
  { name: "KEYCE / IUC — Bonamoussadi, Douala",   lat: 4.0706, lng: 9.7445  },
  { name: "Université de Buea — Molyko",          lat: 4.1571, lng: 9.2429  },
];

const TRAVEL_MODES = [
  { id: 'car',        label: 'Voiture',   icon: Car,            profile: 'driving'  },
  { id: 'bike',       label: 'Vélo',      icon: Bike,           profile: 'cycling'  },
  { id: 'foot',       label: 'À pied',    icon: PersonStanding, profile: 'walking'  },
];

export default function Directions() {
  const mapRef       = useRef(null);
  const leafletMap   = useRef(null);
  const routingCtrl  = useRef(null);

  const [mode, setMode]             = useState('car');
  const [originInput, setOriginInput] = useState('');
  const [destCampus, setDestCampus] = useState(null);
  const [originCoords, setOriginCoords] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [routeInfo, setRouteInfo]   = useState(null); // { distance, duration }
  const [error, setError]           = useState('');
  const [geoLoading, setGeoLoading] = useState(false);

  // Init carte Leaflet
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    if (typeof window.L === 'undefined') return;
    const L = window.L;

    const map = L.map(mapRef.current, {
      center: [3.848, 11.502],
      zoom: 10,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    leafletMap.current = map;
    return () => { map.remove(); leafletMap.current = null; };
  }, []);

  // Géolocalisation utilisateur
  const getUserLocation = () => {
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setOriginCoords({ lat, lng });
        setOriginInput('📍 Ma position actuelle');
        setGeoLoading(false);
        setError('');
      },
      () => {
        setError('Impossible d\'accéder à votre position.');
        setGeoLoading(false);
      }
    );
  };

  // Geocoder le texte d'origine via Nominatim (OSM)
  const geocodeOrigin = async () => {
    if (!originInput || originInput === '📍 Ma position actuelle') return originCoords;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(originInput + ', Cameroun')}&format=json&limit=1`
      );
      const data = await res.json();
      if (data.length === 0) throw new Error('Adresse introuvable. Essayez un quartier ou campus.');
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch (e) {
      throw new Error(e.message || 'Erreur de géocodage');
    }
  };

  // Calculer l'itinéraire avec Leaflet Routing Machine (OSRM)
  const calculateRoute = async () => {
    if (!destCampus) { setError('Choisissez un campus de destination.'); return; }
    if (!originInput && !originCoords) { setError('Entrez un point de départ ou utilisez votre position.'); return; }

    setLoading(true);
    setError('');
    setRouteInfo(null);

    const L = window.L;
    if (!L || !leafletMap.current) { setLoading(false); return; }
    const map = leafletMap.current;

    try {
      // Obtenir les coordonnées d'origine
      let from = originCoords;
      if (!from || (originInput && originInput !== '📍 Ma position actuelle')) {
        from = await geocodeOrigin();
        setOriginCoords(from);
      }

      // Supprimer l'ancien itinéraire
      if (routingCtrl.current) {
        map.removeControl(routingCtrl.current);
        routingCtrl.current = null;
      }

      // Choisir le profil OSRM selon mode
      const profile = TRAVEL_MODES.find(m => m.id === mode)?.profile || 'driving';
      const osrmBase = `https://router.project-osrm.org/route/v1/${profile}`;

      // Calcul via OSRM directement
      const url = `${osrmBase}/${from.lng},${from.lat};${destCampus.lng},${destCampus.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.code !== 'Ok' || !data.routes?.length) {
        throw new Error('Itinéraire introuvable pour ce trajet. Essayez une autre adresse.');
      }

      const route = data.routes[0];
      const distKm = (route.distance / 1000).toFixed(1);
      const durMin = Math.round(route.duration / 60);
      const hours  = Math.floor(durMin / 60);
      const mins   = durMin % 60;

      setRouteInfo({
        distance: `${distKm} km`,
        duration: hours > 0 ? `${hours}h${mins.toString().padStart(2,'0')}` : `${mins} min`,
      });

      // Afficher l'itinéraire sur la carte
      const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      const polyline = L.polyline(coords, {
        color: '#09392D',
        weight: 5,
        opacity: 0.85,
        dashArray: null,
      }).addTo(map);

      // Marqueur départ
      const startIcon = L.divIcon({
        className: '',
        html: `<div style="background:#389038;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:14px;">🏠</div>`,
        iconAnchor: [14, 14],
      });

      // Marqueur arrivée
      const endIcon = L.divIcon({
        className: '',
        html: `<div style="background:#FFC80D;color:#09392D;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:14px;">🎓</div>`,
        iconAnchor: [14, 14],
      });

      const startMarker = L.marker([from.lat, from.lng], { icon: startIcon }).addTo(map);
      const endMarker   = L.marker([destCampus.lat, destCampus.lng], { icon: endIcon }).addTo(map);

      // Stocker pour nettoyage ultérieur
      routingCtrl.current = { remove: () => {
        map.removeLayer(polyline);
        map.removeLayer(startMarker);
        map.removeLayer(endMarker);
      }};

      // Ajuster la vue
      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

    } catch (err) {
      setError(err.message || 'Erreur lors du calcul de l\'itinéraire.');
    } finally {
      setLoading(false);
    }
  };

  const resetRoute = () => {
    if (routingCtrl.current) {
      routingCtrl.current.remove();
      routingCtrl.current = null;
    }
    setRouteInfo(null);
    setError('');
    if (leafletMap.current) leafletMap.current.setView([3.848, 11.502], 10);
  };

  return (
    <div className="flex flex-col h-screen pb-20 bg-gray-50">

      {/* Header */}
      <div className="bg-[#09392D] text-white px-4 pt-4 pb-4 flex-shrink-0">
        <h1 className="text-lg font-bold mb-1">🧭 Itinéraires en temps réel</h1>
        <p className="text-gray-300 text-xs">Calcul via OpenStreetMap · Routing gratuit</p>
      </div>

      {/* Panneau de configuration */}
      <div className="px-4 pt-3 pb-2 flex-shrink-0 space-y-3 bg-white border-b border-gray-100 shadow-sm">

        {/* Mode transport */}
        <div className="grid grid-cols-3 gap-2">
          {TRAVEL_MODES.map(m => {
            const Icon = m.icon;
            return (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-bold transition
                  ${mode === m.id ? 'bg-[#09392D] text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>
                <Icon size={18}/>{m.label}
              </button>
            );
          })}
        </div>

        {/* Départ */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin size={14} className="absolute left-3 top-3 text-[#389038]"/>
            <input type="text" value={originInput} onChange={e => { setOriginInput(e.target.value); setOriginCoords(null); }}
              placeholder="Votre quartier ou adresse..."
              className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#FFC80D]"/>
          </div>
          <button onClick={getUserLocation} disabled={geoLoading}
            className="px-3 py-2.5 bg-[#FFC80D] text-[#09392D] rounded-xl font-bold text-xs flex items-center gap-1 flex-shrink-0">
            {geoLoading ? <Loader size={14} className="animate-spin"/> : <Navigation size={14}/>}
            {geoLoading ? '...' : 'GPS'}
          </button>
        </div>

        {/* Campus de destination */}
        <div className="relative">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Campus de destination</span>
          <div className="flex flex-wrap gap-1.5">
            {CAMPUSES.map(c => (
              <button key={c.name} onClick={() => { setDestCampus(c); resetRoute(); }}
                className={`text-xs px-2.5 py-1.5 rounded-full border transition font-medium
                  ${destCampus?.name === c.name
                    ? 'bg-[#09392D] text-white border-[#09392D]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#09392D]'}`}>
                {c.name.split('—')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700 flex items-center gap-2">
            <X size={14} className="text-red-400 flex-shrink-0"/> {error}
          </div>
        )}

        {/* Info itinéraire */}
        {routeInfo && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-xs text-gray-500">Distance</p>
                <p className="font-black text-[#09392D] text-lg">{routeInfo.distance}</p>
              </div>
              <div className="w-px h-8 bg-green-300"/>
              <div className="text-center">
                <p className="text-xs text-gray-500">Durée</p>
                <p className="font-black text-[#09392D] text-lg">{routeInfo.duration}</p>
              </div>
            </div>
            <button onClick={resetRoute} className="text-xs text-gray-400 underline">Effacer</button>
          </div>
        )}

        {/* Bouton calcul */}
        <button onClick={calculateRoute} disabled={loading || !destCampus}
          className="w-full bg-[#FFC80D] text-[#09392D] py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition shadow-md">
          {loading
            ? <><Loader size={18} className="animate-spin"/> Calcul en cours...</>
            : <><Route size={18}/> Calculer l'itinéraire</>
          }
        </button>
      </div>

      {/* Carte Leaflet */}
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }}/>
        {!destCampus && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/40 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm">
              Choisissez un campus ci-dessus
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
