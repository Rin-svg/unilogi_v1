import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Home, Trash2, Filter, SortAsc } from 'lucide-react';
import { apartments } from '../data';

// Helpers localStorage
const getFavIds = () => {
  try { return JSON.parse(localStorage.getItem('unilogi_favorites') || '[]'); }
  catch { return []; }
};
const saveFavIds = (ids) => localStorage.setItem('unilogi_favorites', JSON.stringify(ids));

export default function Favorites() {
  const navigate = useNavigate();
  const [favoriteIds, setFavoriteIds] = useState(getFavIds);
  const [sortBy, setSortBy] = useState('recent');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const favorites = apartments.filter(apt => favoriteIds.includes(apt.id));

  const removeFavorite = (apartmentId) => {
    const updated = favoriteIds.filter(id => id !== apartmentId);
    setFavoriteIds(updated);
    saveFavIds(updated);
  };

  const getSortedAndFilteredFavorites = () => {
    let filtered = [...favorites];
    if (filterType !== 'all') {
      filtered = filtered.filter(fav => {
        const rooms = fav.rooms || 1;
        if (filterType === 'studio') return rooms === 1;
        if (filterType === 't1') return rooms === 2;
        if (filterType === 't2') return rooms === 3;
        if (filterType === 't3+') return rooms >= 4;
        return true;
      });
    }
    if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
    return filtered;
  };

  const displayedFavorites = getSortedAndFilteredFavorites();

  return (
    <div className="px-4 py-6 pb-24">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#09392D] mb-2">Mes Favoris</h1>
        <p className="text-gray-500">
          {favorites.length} {favorites.length > 1 ? 'logements sauvegardés' : 'logement sauvegardé'}
        </p>
      </div>

      {favorites.length > 0 && (
        <div className="mb-4 space-y-3">
          <div className="flex gap-2">
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-full text-sm font-medium hover:border-[#FFC80D] transition-colors">
              <Filter className="w-4 h-4" /> Filtres
            </button>
            <button onClick={() => {
              const sorts = ['recent', 'price-low', 'price-high'];
              setSortBy(sorts[(sorts.indexOf(sortBy) + 1) % sorts.length]);
            }} className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-full text-sm font-medium hover:border-[#FFC80D] transition-colors">
              <SortAsc className="w-4 h-4" />
              {sortBy === 'recent' && 'Plus récent'}
              {sortBy === 'price-low' && 'Prix croissant'}
              {sortBy === 'price-high' && 'Prix décroissant'}
            </button>
          </div>
          {showFilters && (
            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
              {['all', 'studio', 't1', 't2', 't3+'].map(type => (
                <button key={type} onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterType === type ? 'bg-[#09392D] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                  {type === 'all' && 'Tous'}{type === 'studio' && 'Studio'}{type === 't1' && 'T1'}{type === 't2' && 'T2'}{type === 't3+' && 'T3+'}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {displayedFavorites.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-20 h-20 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {favorites.length === 0 ? 'Aucun favori' : 'Aucun résultat'}
          </h3>
          <p className="text-gray-500 mb-6">
            {favorites.length === 0 ? 'Ajoutez des logements à vos favoris depuis la page d\'accueil' : 'Essayez de modifier vos filtres'}
          </p>
          {favorites.length === 0 && (
            <button onClick={() => navigate('/home')}
              className="px-6 py-3 bg-[#09392D] text-white rounded-full font-medium hover:bg-[#389038] transition-colors">
              Découvrir des logements
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedFavorites.map((apartment) => (
            <div key={apartment.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <img src={apartment.image} alt={apartment.title} className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => navigate(`/apartment/${apartment.id}`)} />
                <button onClick={() => removeFavorite(apartment.id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-[#09392D] mb-2 cursor-pointer hover:text-[#389038]"
                  onClick={() => navigate(`/apartment/${apartment.id}`)}>
                  {apartment.title}
                </h3>
                <div className="flex items-center text-gray-500 mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{apartment.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[#09392D] font-black text-xl">{apartment.price.toLocaleString()} <span className="text-sm font-medium text-gray-400">FCFA/mois</span></span>
                    <div className="flex items-center text-gray-500">
                      <Home className="w-4 h-4 mr-1" />
                      <span className="text-sm">{apartment.rooms} pièce{apartment.rooms > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/apartment/${apartment.id}`)}
                    className="px-4 py-2 bg-[#FFC80D] text-[#09392D] rounded-full text-sm font-bold hover:bg-[#e6b40b] transition-colors">
                    Voir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
