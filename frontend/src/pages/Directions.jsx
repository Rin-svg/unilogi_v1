import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Car, Bike, PersonStanding, Clock, Route, X, Loader, Search, Home, ChevronDown } from 'lucide-react';
import { apartments as staticApartments } from '../data';

// ── Coordonnées GPS des appartements statiques ────────────────────────────
const STATIC_COORDS = [
  { id: 1, lat: 3.8622,  lng: 11.5125 },
  { id: 2, lat: 3.8055,  lng: 11.5485 },
  { id: 3, lat: 3.8690,  lng: 11.5200 },
  { id: 4, lat: 4.0706,  lng: 9.7440  },
  { id: 5, lat: 3.8855,  lng: 11.5253 },
  { id: 6, lat: 3.8700,  lng: 11.4960 },
  { id: 7, lat: 4.1571,  lng: 9.2429  },
  { id: 8, lat: 4.0720,  lng: 9.7450  },
];

// ── Géocodage par mots-clés pour les annonces postées ────────────────────
const LOCATION_KEYWORDS = [
  { keywords: ['ngoa', 'uyi', 'université de yaoundé i'],  lat: 3.8622, lng: 11.5125 },
  { keywords: ['soa', 'fasa', 'ensp'],                     lat: 3.8055, lng: 11.5485 },
  { keywords: ['ekié', 'ekie'],                            lat: 3.8690, lng: 11.5200 },
  { keywords: ['ngousso', 'enam'],                         lat: 3.8855, lng: 11.5253 },
  { keywords: ['obili', 'uyii', 'bastos'],                 lat: 3.8700, lng: 11.4960 },
  { keywords: ['messa'],                                   lat: 3.8780, lng: 11.5040 },
  { keywords: ['biyem-assi', 'biyem assi'],                lat: 3.8450, lng: 11.4900 },
  { keywords: ['etoudi'],                                  lat: 3.8920, lng: 11.5200 },
  { keywords: ['emana'],                                   lat: 3.8100, lng: 11.5600 },
  { keywords: ['yaoundé', 'yaounde'],                      lat: 3.8480, lng: 11.5021 },
  { keywords: ['bonamoussadi', 'keyce', 'iuc'],            lat: 4.0706, lng: 9.7440  },
  { keywords: ['akwa'],                                    lat: 4.0480, lng: 9.7050  },
  { keywords: ['bonapriso'],                               lat: 4.0390, lng: 9.6970  },
  { keywords: ['makepe'],                                  lat: 4.0830, lng: 9.7620  },
  { keywords: ['logbessou'],                               lat: 4.1050, lng: 9.7720  },
  { keywords: ['douala'],                                  lat: 4.0511, lng: 9.7679  },
  { keywords: ['molyko', 'université de buea', 'ub '],     lat: 4.1571, lng: 9.2429  },
  { keywords: ['buea'],                                    lat: 4.1540, lng: 9.2410  },
  { keywords: ['bamenda'],                                 lat: 5.9631, lng: 10.1591 },
  { keywords: ['bafoussam'],                               lat: 5.4781, lng: 10.4175 },
];

const geocodeLocation = (locationStr) => {
  if (!locationStr) return null;
  const loc = locationStr.toLowerCase();
  for (const entry of LOCATION_KEYWORDS) {
    if (entry.keywords.some((kw) => loc.includes(kw))) {
      return { lat: entry.lat, lng: entry.lng };
    }
  }
  return { lat: 3.848, lng: 11.502 }; // fallback Yaoundé centre
};

const getCoordsForApt = (apt) => {
  const staticCoords = STATIC_COORDS.find((c) => c.id === apt.id);
  if (staticCoords) return staticCoords;
  if (apt._coords) return apt._coords;
  return geocodeLocation(apt.location);
};

// ── Chargement fusionné (data.js + localStorage) ──────────────────────────
const getAllApartments = () => {
  try {
    const local = JSON.parse(localStorage.getItem('unilogi_apartments') || '[]');
    const staticIds = new Set(staticApartments.map((a) => String(a.id)));
    const localOnly = local.filter((a) => !staticIds.has(String(a.id)));
    return [...localOnly, ...staticApartments];
  } catch {
    return [...staticApartments];
  }
};

// ── Modes de transport ────────────────────────────────────────────────────
const TRAVEL_MODES = [
  { id: 'car',  label: 'Voiture', icon: Car,            profile: 'driving' },
  { id: 'bike', label: 'Vélo',    icon: Bike,           profile: 'cycling' },
  { id: 'foot', label: 'À pied',  icon: PersonStanding, profile: 'walking' },
];

// ─────────────────────────────────────────────────────────────────────────
export default function Directions() {
  const mapRef      = useRef(null);
  const leafletMap  = useRef(null);
  const routingCtrl = useRef(null);
  const searchRef   = useRef(null);

  const [allApartments, setAllApartments] = useState([]);
  const [mode, setMode]                   = useState('car');
  const [originInput, setOriginInput]     = useState('');
  const [originCoords, setOriginCoords]   = useState(null);
  const [destApt, setDestApt]             = useState(null);         // appartement choisi
  const [searchQuery, setSearchQuery]     = useState('');           // barre de recherche
  const [showDropdown, setShowDropdown]   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [routeInfo, setRouteInfo]         = useState(null);
  const [error, setError]                 = useState('');
  const [geoLoading, setGeoLoading]       = useState(false);

  // Charger les appartements
  useEffect(() => {
    setAllApartments(getAllApartments());
  }, []);

  // Fermer dropdown au clic extérieur
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Appartements filtrés selon la recherche
  const filteredApts = allApartments.filter((apt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      apt.title?.toLowerCase().includes(q) ||
      apt.location?.toLowerCase().includes(q)
    );
  });

  // Init carte Leaflet
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    if (typeof window.L === 'undefined') return;
    const L = window.L;
    const map = L.map(mapRef.current, { center: [3.848, 11.502], zoom: 10, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    leafletMap.current = map;
    return () => { map.remove(); leafletMap.current = null; };
  }, []);

  // Géolocalisation
  const getUserLocation = () => {
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOriginCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setOriginInput('📍 Ma position actuelle');
        setGeoLoading(false);
        setError('');
      },
      () => {
        setError("Impossible d'accéder à votre position.");
        setGeoLoading(false);
      }
    );
  };

  // Géocoder l'adresse saisie manuellement
  const geocodeOrigin = async () => {
    if (!originInput || originInput === '📍 Ma position actuelle') return originCoords;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(originInput + ', Cameroun')}&format=json&limit=1`
    );
    const data = await res.json();
    if (!data.length) throw new Error('Adresse de départ introuvable. Essayez un quartier précis.');
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  };

  // Choisir un appartement depuis le dropdown
  const selectApartment = (apt) => {
    setDestApt(apt);
    setSearchQuery(apt.title);
    setShowDropdown(false);
    resetRoute(false); // reset carte sans effacer la sélection
    setError('');
    // Centrer la carte sur l'appartement sélectionné
    const coords = getCoordsForApt(apt);
    if (coords && leafletMap.current) {
      leafletMap.current.setView([coords.lat, coords.lng], 14);
      // Ajouter un marqueur de prévisualisation
      const L = window.L;
      if (routingCtrl.current) { routingCtrl.current.remove(); routingCtrl.current = null; }
      const icon = L.divIcon({
        className: '',
        html: `<div style="background:#09392D;color:white;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);font-size:16px;">🏠</div>`,
        iconAnchor: [17, 17],
      });
      const marker = L.marker([coords.lat, coords.lng], { icon }).addTo(leafletMap.current);
      routingCtrl.current = { remove: () => leafletMap.current?.removeLayer(marker) };
    }
  };

  // Calculer l'itinéraire
  const calculateRoute = async () => {
    if (!destApt) { setError('Sélectionnez un logement de destination.'); return; }
    if (!originInput.trim() && !originCoords) { setError('Entrez un point de départ ou utilisez le GPS.'); return; }

    setLoading(true);
    setError('');
    setRouteInfo(null);

    const L = window.L;
    if (!L || !leafletMap.current) { setLoading(false); return; }
    const map = leafletMap.current;

    try {
      // 1. Coordonnées de départ
      let from = originCoords;
      if (!from || (originInput && originInput !== '📍 Ma position actuelle')) {
        from = await geocodeOrigin();
        setOriginCoords(from);
      }

      // 2. Coordonnées de destination
      const to = getCoordsForApt(destApt);
      if (!to) throw new Error("Impossible de localiser ce logement.");

      // 3. Nettoyer ancienne route
      if (routingCtrl.current) { routingCtrl.current.remove(); routingCtrl.current = null; }

      // 4. Appel OSRM
      const profile = TRAVEL_MODES.find((m) => m.id === mode)?.profile || 'driving';
      const url = `https://router.project-osrm.org/route/v1/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
      const res  = await fetch(url, { signal: AbortSignal.timeout(10000) });
      const data = await res.json();

      if (data.code !== 'Ok' || !data.routes?.length) {
        throw new Error('Itinéraire introuvable. Vérifiez les adresses et réessayez.');
      }

      const route  = data.routes[0];
      const distKm = (route.distance / 1000).toFixed(1);
      const durMin = Math.round(route.duration / 60);
      const hours  = Math.floor(durMin / 60);
      const mins   = durMin % 60;

      setRouteInfo({
        distance: `${distKm} km`,
        duration: hours > 0 ? `${hours}h${mins.toString().padStart(2, '0')}` : `${mins} min`,
      });

      // 5. Dessiner la route
      const latlngs  = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      const polyline = L.polyline(latlngs, { color: '#09392D', weight: 5, opacity: 0.9 }).addTo(map);

      // 6. Marqueurs
      const startIcon = L.divIcon({
        className: '',
        html: `<div style="background:#389038;color:white;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:15px;">📌</div>`,
        iconAnchor: [15, 15],
      });
      const endIcon = L.divIcon({
        className: '',
        html: `<div style="background:#FFC80D;color:#09392D;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:15px;">🏠</div>`,
        iconAnchor: [15, 15],
      });

      const startMarker = L.marker([from.lat, from.lng], { icon: startIcon })
        .addTo(map)
        .bindPopup('📌 Départ')
        .openPopup();
      const endMarker = L.marker([to.lat, to.lng], { icon: endIcon })
        .addTo(map)
        .bindPopup(`🏠 ${destApt.title}`);

      routingCtrl.current = {
        remove: () => {
          map.removeLayer(polyline);
          map.removeLayer(startMarker);
          map.removeLayer(endMarker);
        },
      };

      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    } catch (err) {
      setError(err.message || "Erreur lors du calcul de l'itinéraire.");
    } finally {
      setLoading(false);
    }
  };

  const resetRoute = (clearSelection = true) => {
    if (routingCtrl.current) { routingCtrl.current.remove(); routingCtrl.current = null; }
    setRouteInfo(null);
    setError('');
    if (clearSelection) {
      setDestApt(null);
      setSearchQuery('');
    }
    if (leafletMap.current) leafletMap.current.setView([3.848, 11.502], 10);
  };

  // ── Rendu ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen pb-20 bg-gray-50">

      {/* Header */}
      <div className="bg-[#09392D] text-white px-4 pt-4 pb-4 flex-shrink-0">
        <h1 className="text-lg font-bold mb-0.5">🧭 Itinéraires vers les logements</h1>
        <p className="text-gray-300 text-xs">Recherchez une offre et calculez votre trajet</p>
      </div>

      {/* Panneau */}
      <div className="px-4 pt-3 pb-2 flex-shrink-0 space-y-3 bg-white border-b border-gray-100 shadow-sm overflow-y-auto" style={{ maxHeight: '62vh' }}>

        {/* Mode transport */}
        <div className="grid grid-cols-3 gap-2">
          {TRAVEL_MODES.map((m) => {
            const Icon = m.icon;
            return (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-bold transition
                  ${mode === m.id ? 'bg-[#09392D] text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>
                <Icon size={18} />{m.label}
              </button>
            );
          })}
        </div>

        {/* Recherche de logement (destination) */}
        <div ref={searchRef} className="relative">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Logement de destination
          </p>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-3.5 text-[#389038]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
                if (!e.target.value) { setDestApt(null); resetRoute(false); }
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Tapez le nom ou le quartier du logement..."
              className="w-full border-2 border-gray-200 rounded-xl pl-8 pr-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#FFC80D] focus:border-[#FFC80D]"
            />
            {searchQuery ? (
              <button onClick={() => { setSearchQuery(''); setDestApt(null); resetRoute(false); setShowDropdown(true); }}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            ) : (
              <ChevronDown size={14} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
            )}
          </div>

          {/* Appartement sélectionné */}
          {destApt && (
            <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={destApt.image || destApt.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'}
                  alt={destApt.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#09392D] truncate">{destApt.title}</p>
                <p className="text-[11px] text-gray-500 truncate flex items-center gap-0.5">
                  <MapPin size={10} /> {destApt.location}
                </p>
              </div>
              <p className="text-xs font-black text-[#09392D] flex-shrink-0">
                {Number(destApt.price).toLocaleString()} FCFA
              </p>
            </div>
          )}

          {/* Dropdown résultats */}
          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 max-h-56 overflow-y-auto">
              {filteredApts.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-400">
                  Aucun logement trouvé pour "{searchQuery}"
                </div>
              ) : (
                filteredApts.map((apt) => (
                  <button
                    key={apt.id}
                    onClick={() => selectApartment(apt)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition text-left border-b border-gray-50 last:border-0
                      ${destApt?.id === apt.id ? 'bg-green-50' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={apt.image || apt.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'}
                        alt={apt.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#09392D] truncate">{apt.title}</p>
                      <p className="text-xs text-gray-400 truncate flex items-center gap-0.5">
                        <MapPin size={10} /> {apt.location}
                      </p>
                    </div>
                    <p className="text-xs font-black text-[#09392D] flex-shrink-0">
                      {Number(apt.price).toLocaleString()}
                      <span className="font-normal text-gray-400"> FCFA</span>
                    </p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Point de départ */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Votre point de départ
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin size={14} className="absolute left-3 top-3.5 text-[#389038]" />
              <input
                type="text"
                value={originInput}
                onChange={(e) => { setOriginInput(e.target.value); setOriginCoords(null); }}
                placeholder="Votre quartier ou adresse..."
                className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#FFC80D]"
              />
            </div>
            <button
              onClick={getUserLocation}
              disabled={geoLoading}
              className="px-3 py-2.5 bg-[#FFC80D] text-[#09392D] rounded-xl font-bold text-xs flex items-center gap-1 flex-shrink-0"
            >
              {geoLoading ? <Loader size={14} className="animate-spin" /> : <Navigation size={14} />}
              {geoLoading ? '...' : 'GPS'}
            </button>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700 flex items-center gap-2">
            <X size={14} className="text-red-400 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Résultat itinéraire */}
        {routeInfo && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500">Distance</p>
                <p className="font-black text-[#09392D] text-xl">{routeInfo.distance}</p>
              </div>
              <div className="w-px h-8 bg-green-300" />
              <div className="text-center">
                <p className="text-xs text-gray-500">Durée</p>
                <p className="font-black text-[#09392D] text-xl">{routeInfo.duration}</p>
              </div>
            </div>
            <button onClick={() => resetRoute(true)} className="text-xs text-gray-400 underline">
              Effacer
            </button>
          </div>
        )}

        {/* Bouton calcul */}
        <button
          onClick={calculateRoute}
          disabled={loading || !destApt}
          className="w-full bg-[#FFC80D] text-[#09392D] py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition shadow-md"
        >
          {loading
            ? <><Loader size={18} className="animate-spin" /> Calcul en cours...</>
            : <><Route size={18} /> Calculer l'itinéraire</>
          }
        </button>
      </div>

      {/* Carte Leaflet */}
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        {!destApt && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/40 text-white text-sm px-5 py-2.5 rounded-full backdrop-blur-sm text-center">
              🔍 Recherchez un logement ci-dessus
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
