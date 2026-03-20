import { useState, useEffect } from 'react';
import { Search, MapPin, CheckCircle, Star, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apartments as staticApartments } from '../data';

const APARTMENTS_KEY = 'unilogi_apartments';

// Fusionne les appartements statiques (data.js) avec ceux du localStorage
const getAllApartments = () => {
  try {
    const local = JSON.parse(localStorage.getItem(APARTMENTS_KEY) || '[]');
    const staticIds = new Set(staticApartments.map((a) => String(a.id)));
    const localOnly = local.filter((a) => !staticIds.has(String(a.id)));
    return [...localOnly, ...staticApartments];
  } catch {
    return [...staticApartments];
  }
};

const Home = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    setApartments(getAllApartments());
    setLoading(false);
    fetchFromServer();
  }, []);

  const fetchFromServer = async () => {
    try {
      const response = await fetch(`${API_URL}/api/apartments`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        const serverApts = data.apartments || [];
        const local = JSON.parse(localStorage.getItem(APARTMENTS_KEY) || '[]');
        const serverIds = new Set(serverApts.map((a) => String(a.id)));
        const localOnly = local.filter((a) => a._localOnly && !serverIds.has(String(a.id)));
        const merged = [...localOnly, ...serverApts];
        localStorage.setItem(APARTMENTS_KEY, JSON.stringify(merged));
        // Affichage : locaux non-sync + serveur + statiques sans doublon
        const staticIds = new Set(staticApartments.map((a) => String(a.id)));
        setApartments([
          ...localOnly,
          ...serverApts.filter((a) => !staticIds.has(String(a.id))),
          ...staticApartments,
        ]);
      }
    } catch {
      // Pas de réseau → affichage local + statique déjà en place
    }
  };

  const filtered = apartments.filter((apt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return apt.title?.toLowerCase().includes(q) || apt.location?.toLowerCase().includes(q);
  });

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-[#09392D] text-white p-8 rounded-b-[40px] shadow-2xl overflow-hidden relative">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#94D358] opacity-10 rounded-full blur-3xl" />
        <h1 className="text-3xl font-extrabold leading-tight mb-2">
          Votre appartement <span className="text-[#FFC80D]">à quelques mètres</span> de votre campus
        </h1>
        <p className="text-gray-300 text-sm mb-6 opacity-80">
          Recherchez, comparez et réservez des logements de qualité au Cameroun.
        </p>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MapPin size={18} className="text-[#389038]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par campus ou quartier..."
            className="w-full bg-white/10 border border-white/20 backdrop-blur-md p-4 pl-12 rounded-2xl text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#FFC80D] transition-all"
          />
          <button className="mt-4 w-full bg-[#FFC80D] hover:bg-[#e6b40b] text-[#09392D] font-bold p-4 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg">
            <Search size={20} /> Rechercher
          </button>
        </div>
      </div>

      {loading && apartments.length === 0 && (
        <div className="p-8 text-center text-gray-500">Chargement des logements...</div>
      )}

      {/* Liste */}
      <div className="p-4 space-y-6">
        {filtered.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-400">
            {searchQuery ? <p>Aucun logement pour "{searchQuery}"</p> : <p>Aucune annonce disponible.</p>}
          </div>
        )}

        {filtered.map((apt) => (
          <Link
            to={`/apartment/${apt.id}`}
            key={apt.id}
            className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 block group"
          >
            <div className="relative">
              <img
                src={apt.image || apt.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'}
                alt={apt.title}
                className="h-64 w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {apt.isCertified && (
                <div className="absolute top-4 left-4 bg-[#389038] text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                  <CheckCircle size={12} /> Certifié UNILOGIS
                </div>
              )}
              {apt._localOnly && (
                <div className="absolute top-4 right-4 bg-orange-400 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                  Non synchronisé
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-lg flex items-center gap-1 text-sm">
                <Star size={14} fill="#FFC80D" color="#FFC80D" />
                <span className="font-bold">4.7</span>
                <span className="text-gray-300 text-xs">(9 avis)</span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-[#09392D] font-bold text-xl mb-1">{apt.title}</h3>
              <div className="flex items-center text-gray-400 text-sm mb-4">
                <MapPin size={14} className="mr-1" /> {apt.location}
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-2xl font-black text-[#09392D]">{Number(apt.price).toLocaleString()}</span>
                  <span className="text-gray-400 text-sm ml-1 font-medium">FCFA/mois</span>
                </div>
                <span className="bg-[#FFC80D] text-[#09392D] text-[10px] font-black px-4 py-2 rounded-full shadow-sm">
                  {(apt.status || 'Disponible').toUpperCase()}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="flex justify-around py-8 bg-white my-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#09392D] rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-green-100">
            <User className="text-[#94D358]" size={24} />
          </div>
          <p className="text-xl font-black text-[#09392D]">2000+</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Étudiants satisfaits</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-[#09392D] rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-green-100">
            <Star className="text-[#FFC80D]" size={24} fill="#FFC80D" />
          </div>
          <p className="text-xl font-black text-[#09392D]">4.8</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Note moyenne</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
