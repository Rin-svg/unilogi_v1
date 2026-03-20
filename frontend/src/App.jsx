import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import BottomNav from './components/BottomNav.jsx';
import AIChatbot from './components/AIChatbot.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import Home from './pages/Home.jsx';
import ApartmentDetails from './pages/ApartmentDetails.jsx';
import Community from './pages/Community.jsx';
import Profile from './pages/Profile.jsx';
import Map from './pages/Map.jsx';
import MapEnhanced from './pages/MapEnhanced.jsx';
import AddApartment from './pages/AddApartment.jsx';
import MyListings from './pages/MyListings.jsx';
import Favorites from './pages/Favorites.jsx';
import SchoolSearch from './pages/SchoolSearch.jsx';
import Privacy from './pages/Privacy.jsx';
import Directions from './pages/Directions.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  const wrap = (children) => (
    <ProtectedRoute>
      <div className="max-w-[480px] mx-auto min-h-screen bg-white shadow-2xl relative pb-20">
        <Navbar />
        {children}
        <BottomNav />
        <AIChatbot />
      </div>
    </ProtectedRoute>
  );

  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Routes protégées */}
        <Route path="/home"           element={wrap(<Home />)} />
        <Route path="/apartment/:id"  element={wrap(<ApartmentDetails />)} />
        <Route path="/community"      element={wrap(<Community />)} />
        <Route path="/profile"        element={wrap(<Profile />)} />
        <Route path="/map"            element={wrap(<MapEnhanced />)} />
        <Route path="/favorites"      element={wrap(<Favorites />)} />
        <Route path="/schools"        element={wrap(<SchoolSearch />)} />
        <Route path="/privacy"        element={wrap(<Privacy />)} />
        <Route path="/directions"     element={wrap(<Directions />)} />
        <Route path="/add"            element={wrap(<AddApartment />)} />
        <Route path="/my-listings"    element={wrap(<MyListings />)} />

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to={isAuthenticated() ? '/home' : '/'} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
