import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, MapPin, Search, ExternalLink, BookOpen, Users } from 'lucide-react';

const CAMPUSES = [
  {
    id: 1,
    name: "Université de Yaoundé I (UYI)",
    type: "Université publique",
    location: "Ngoa-Ekellé, Yaoundé",
    address: "BP 812, Yaoundé",
    students: "~45 000",
    faculties: ["FSSN", "FMSB", "FSE", "Faculté des Sciences"],
    color: "#09392D",
    mapUrl: "https://maps.google.com/?q=Université+Yaoundé+1+Ngoa-Ekelle",
    osmUrl: "https://www.openstreetmap.org/?mlat=3.862&mlon=11.512#map=15/3.862/11.512",
  },
  {
    id: 2,
    name: "Université de Yaoundé II (UYII)",
    type: "Université publique",
    location: "SOA, Yaoundé",
    address: "BP 18, Yaoundé-Soa",
    students: "~30 000",
    faculties: ["FSJP", "FSEG", "ENSET", "IRIC"],
    color: "#389038",
    mapUrl: "https://maps.google.com/?q=Université+Yaoundé+2+Soa",
    osmUrl: "https://www.openstreetmap.org/?mlat=3.805&mlon=11.548#map=15/3.805/11.548",
  },
  {
    id: 3,
    name: "ENSP — École Nationale Supérieure Polytechnique",
    type: "Grande École",
    location: "Ngoa-Ekellé, Yaoundé",
    address: "BP 8390, Yaoundé",
    students: "~5 000",
    faculties: ["Génie Civil", "Génie Électrique", "Informatique", "Génie Mécanique"],
    color: "#1a6b4a",
    mapUrl: "https://maps.google.com/?q=ENSP+Yaoundé",
    osmUrl: "https://www.openstreetmap.org/?mlat=3.862&mlon=11.513#map=16/3.862/11.513",
  },
  {
    id: 4,
    name: "Université de Buea (UB)",
    type: "Université publique",
    location: "Molyko, Buea",
    address: "PO Box 63, Buea",
    students: "~20 000",
    faculties: ["FAS", "FHS", "FET", "HTTC"],
    color: "#7B2D8B",
    mapUrl: "https://maps.google.com/?q=University+of+Buea+Molyko",
    osmUrl: "https://www.openstreetmap.org/?mlat=4.157&mlon=9.243#map=15/4.157/9.243",
  },
  {
    id: 5,
    name: "KEYCE Academy",
    type: "École privée",
    location: "Bonamoussadi, Douala",
    address: "Rue School, Bonamoussadi",
    students: "~2 000",
    faculties: ["Business", "IT", "Finance", "Marketing"],
    color: "#E65100",
    mapUrl: "https://maps.google.com/?q=KEYCE+Academy+Douala",
    osmUrl: "https://www.openstreetmap.org/?mlat=4.070&mlon=9.744#map=15/4.070/9.744",
  },
  {
    id: 6,
    name: "IUC — Institut Universitaire de la Côte",
    type: "Université privée",
    location: "Bonamoussadi, Douala",
    address: "BP 1615, Douala",
    students: "~8 000",
    faculties: ["Droit", "Économie", "Informatique", "Sciences de la Santé"],
    color: "#0277BD",
    mapUrl: "https://maps.google.com/?q=Institut+Universitaire+Côte+Douala",
    osmUrl: "https://www.openstreetmap.org/?mlat=4.071&mlon=9.745#map=15/4.071/9.745",
  },
  {
    id: 7,
    name: "ENAM — École Nationale d'Administration et de Magistrature",
    type: "Grande École",
    location: "Ngousso, Yaoundé",
    address: "BP 1353, Yaoundé",
    students: "~1 500",
    faculties: ["Administration Générale", "Magistrature", "Diplomatie", "Finances Publiques"],
    color: "#37474F",
    mapUrl: "https://maps.google.com/?q=ENAM+Yaoundé",
    osmUrl: "https://www.openstreetmap.org/?mlat=3.885&mlon=11.525#map=16/3.885/11.525",
  },
  {
    id: 8,
    name: "FASA — Faculté d'Agronomie et des Sciences Agricoles",
    type: "Faculté universitaire",
    location: "SOA, Yaoundé",
    address: "BP 222, Dschang / Antenne Soa",
    students: "~3 000",
    faculties: ["Agropastoral", "Eau & Forêts", "Agro-Industrie", "Rural"],
    color: "#558B2F",
    mapUrl: "https://maps.google.com/?q=FASA+Soa+Cameroun",
    osmUrl: "https://www.openstreetmap.org/?mlat=3.806&mlon=11.549#map=16/3.806/11.549",
  },
];

export default function SchoolSearch() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const types = ['all', 'Université publique', 'Grande École', 'Université privée', 'Faculté universitaire', 'École privée'];

  const filtered = CAMPUSES.filter(c => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || c.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="pb-24 min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-[#09392D] text-white p-5 rounded-b-3xl shadow-lg">
        <h1 className="text-xl font-bold mb-1">🎓 Campus & Écoles</h1>
        <p className="text-gray-300 text-xs mb-4">Universités et grandes écoles du Cameroun</p>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un campus..."
            className="w-full bg-white text-gray-800 pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none" />
        </div>
      </div>

      {/* Filtres type */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {types.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium border transition flex-shrink-0
              ${typeFilter === t ? 'bg-[#09392D] text-white border-[#09392D]' : 'bg-white text-gray-600 border-gray-200'}`}>
            {t === 'all' ? 'Tous' : t}
          </button>
        ))}
      </div>

      {/* Compteur */}
      <p className="px-4 pb-2 text-sm text-gray-400">
        <span className="font-bold text-[#09392D]">{filtered.length}</span> établissement{filtered.length > 1 ? 's' : ''}
      </p>

      {/* Liste */}
      <div className="px-4 space-y-3">
        {filtered.map(campus => (
          <div key={campus.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Bande couleur + nom */}
            <div className="p-4" style={{ borderLeft: `4px solid ${campus.color}` }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: campus.color + '20' }}>
                      <School size={16} style={{ color: campus.color }} />
                    </div>
                    <h3 className="font-bold text-[#09392D] text-sm leading-tight">{campus.name}</h3>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white inline-block mb-2"
                    style={{ backgroundColor: campus.color }}>
                    {campus.type}
                  </span>
                  <div className="flex items-center text-gray-400 text-xs mb-1">
                    <MapPin size={11} className="mr-1" /> {campus.location}
                  </div>
                  <div className="flex items-center text-gray-400 text-xs">
                    <Users size={11} className="mr-1" /> {campus.students} étudiants
                  </div>
                </div>
              </div>

              {/* Filières */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {campus.faculties.map(f => (
                  <span key={f} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {f}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                <button onClick={() => navigate('/home')}
                  className="flex-1 py-2 text-xs font-bold rounded-xl text-white flex items-center justify-center gap-1"
                  style={{ backgroundColor: campus.color }}>
                  <BookOpen size={13} /> Logements proches
                </button>
                <a href={campus.osmUrl} target="_blank" rel="noreferrer"
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-medium flex items-center gap-1">
                  <ExternalLink size={13} /> Carte
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
