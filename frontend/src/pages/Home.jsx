import { apartments } from '../data';
import { Search, MapPin, CheckCircle, Star, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {

  return (
    <div className="pb-20">
      {/* 🟦 Header Section Premium */}
<div className="bg-[#09392D] text-white p-8 rounded-b-[40px] shadow-2xl overflow-hidden relative">
  {/* Petit effet décoratif avec ta couleur 94D358 */}
  <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#94D358] opacity-10 rounded-full blur-3xl"></div>

  <h1 className="text-3xl font-extrabold leading-tight mb-2">
    Votre appartement à <span className="text-[#FFC80D]">2km</span> de votre campus
  </h1>
  <p className="text-gray-300 text-sm mb-6 opacity-80">
    Recherchez, comparez et réservez des logements de qualité au Cameroun.
  </p>

  {/* Barre de recherche stylisée */}
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
      <MapPin size={18} className="text-[#389038]" />
    </div>
    <input 
      type="text" 
      placeholder="Rechercher par campus ou quartier..." 
      className="w-full bg-white/10 border border-white/20 backdrop-blur-md p-4 pl-12 rounded-2xl text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#FFC80D] transition-all"
    />
    <button className="mt-4 w-full bg-[#FFC80D] hover:bg-[#e6b40b] text-[#09392D] font-bold p-4 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg">
      <Search size={20} />
      Rechercher
    </button>
  </div>
</div>

      {apartments.map((apt) => (
  <Link to={`/apartment/${apt.id}`} key={apt.id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 mb-6 block group">
    <div className="relative">
      <img src={apt.image} alt={apt.title} className="h-64 w-full object-cover group-hover:scale-105 transition-transform duration-500" />
      
      {/* Badge Certifié avec ton vert 389038 */}
      {apt.isCertified && (
        <div className="absolute top-4 left-4 bg-[#389038] text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
          <CheckCircle size={12} /> Certifié UNILOGIS
        </div>
      )}

      {/* Note avec ton jaune attrayant FFC80D */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-lg flex items-center gap-1 text-sm">
        <Star size={14} fill="#FFC80D" color="#FFC80D" /> 
        <span className="font-bold">4.7</span> <span className="text-gray-300 text-xs">(9 avis)</span>
      </div>
    </div>

    <div className="p-5">
      <h3 className="text-[#09392D] font-bold text-xl mb-1">{apt.title}</h3>
      <div className="flex items-center text-gray-400 text-sm mb-4">
        <MapPin size={14} className="mr-1" /> {apt.location}
      </div>
      
      <div className="flex justify-between items-end">
        <div>
          <span className="text-2xl font-black text-[#09392D]">{apt.price.toLocaleString()}</span>
          <span className="text-gray-400 text-sm ml-1 font-medium">FCFA/mois</span>
        </div>
        {/* Bouton de statut en jaune attrayant */}
        <span className="bg-[#FFC80D] text-[#09392D] text-[10px] font-black px-4 py-2 rounded-full shadow-sm">
          {apt.status.toUpperCase()}
        </span>
      </div>
    </div>
  </Link>
))}
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