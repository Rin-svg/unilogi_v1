import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Trash2, Plus, BedDouble, Maximize2, Phone } from 'lucide-react';

const MY_APARTMENTS_KEY = 'unilogi_my_apartments';

const MyListings = () => {
  const navigate = useNavigate();
  const [myApartments, setMyApartments] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    try {
      const data = JSON.parse(localStorage.getItem(MY_APARTMENTS_KEY) || '[]');
      setMyApartments(data);
    } catch {
      setMyApartments([]);
    }
  };

  const handleDelete = (id) => {
    if (!confirm('Supprimer cette annonce définitivement ?')) return;

    // Supprimer de mes annonces
    const updated = myApartments.filter((a) => a.id !== id);
    setMyApartments(updated);
    localStorage.setItem(MY_APARTMENTS_KEY, JSON.stringify(updated));

    // Supprimer aussi de la liste globale
    try {
      const all = JSON.parse(localStorage.getItem('unilogi_apartments') || '[]');
      localStorage.setItem('unilogi_apartments', JSON.stringify(all.filter((a) => a.id !== id)));
    } catch { /* ignore */ }
  };

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#09392D] to-[#0d4d3a] text-white p-6 pb-8">
        <h2 className="text-2xl font-bold">Mes Annonces</h2>
        <p className="text-gray-300 text-sm mt-1">{myApartments.length} logement{myApartments.length !== 1 ? 's' : ''} publié{myApartments.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Bouton ajouter */}
      <div className="p-4">
        <button
          onClick={() => navigate('/add')}
          className="w-full bg-[#FFC80D] text-[#09392D] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#e6b40b] transition shadow-md"
        >
          <Plus size={22} />
          Publier un nouveau logement
        </button>
      </div>

      {/* Liste */}
      {myApartments.length === 0 ? (
        <div className="text-center py-16 text-gray-400 px-8">
          <div className="text-6xl mb-4">🏠</div>
          <p className="font-bold text-lg text-gray-600 mb-2">Aucune annonce publiée</p>
          <p className="text-sm">Publiez votre premier logement en appuyant sur le bouton ci-dessus.</p>
        </div>
      ) : (
        <div className="px-4 space-y-4">
          {myApartments.map((apt) => (
            <div key={apt.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Image */}
              <div className="relative h-48">
                <img
                  src={apt.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'}
                  alt={apt.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  {apt._localOnly && (
                    <span className="bg-orange-400 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                      Local
                    </span>
                  )}
                  <span className="bg-[#FFC80D] text-[#09392D] text-[10px] font-black px-3 py-1 rounded-full">
                    {(apt.status || 'disponible').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Détails */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-[#09392D] text-lg flex-1 pr-2">{apt.title}</h3>
                  <button
                    onClick={() => handleDelete(apt.id)}
                    className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <MapPin size={14} className="mr-1 text-[#389038]" />
                  {apt.location}
                </div>

                <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-600">
                  {apt.rooms && (
                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                      <BedDouble size={12} />
                      {apt.rooms} chambre{Number(apt.rooms) > 1 ? 's' : ''}
                    </span>
                  )}
                  {apt.surface && (
                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                      <Maximize2 size={12} />
                      {apt.surface} m²
                    </span>
                  )}
                  {apt.contact && (
                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                      <Phone size={12} />
                      {apt.contact}
                    </span>
                  )}
                </div>

                {apt.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{apt.description}</p>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div>
                    <span className="text-xl font-black text-[#09392D]">
                      {Number(apt.price).toLocaleString()}
                    </span>
                    <span className="text-gray-400 text-sm ml-1">FCFA/mois</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(apt.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
