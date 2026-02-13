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
import Favorites from './pages/Favorites.jsx';
import SchoolSearch from './pages/SchoolSearch.jsx';
import Privacy from './pages/Privacy.jsx';
import Directions from './pages/Directions.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Routes protégées */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <div className="max-w-[480px] mx-auto min-h-screen bg-white shadow-2xl relative pb-20">
                <Navbar />
                <Home />
                <BottomNav />
                <AIChatbot />
              </div>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/apartment/:id"
          element={
            <ProtectedRoute>
              <div className="max-w-[480px] mx-auto min-h-screen bg-white shadow-2xl relative pb-20">
                <Navbar />
                <ApartmentDetails />
                <BottomNav />
                <AIChatbot />
              </div>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <div className="max-w-[480px] mx-auto min-h-screen bg-white shadow-2xl relative pb-20">
                <Navbar />
                <Community />
                <BottomNav />
                <AIChatbot />
              </div>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div className="max-w-[480px] mx-auto min-h-screen bg-white shadow-2xl relative pb-20">
                <Navbar />
                <Profile />
                <BottomNav />
                <AIChatbot />
              </div>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <div className="max-w-[480px] mx-auto min-h-screen bg-white shadow-2xl relative pb-20">
                <Navbar />
                <MapEnhanced />
                <BottomNav />
                <AIChatbot />
              </div>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <div className="max-w-[480px] mx-auto min-h-screen bg-white shadow-2xl relative pb-20">
                <Navbar />
                <Favorites />
                <BottomNav />
                <AIChatbot />
              </div>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/schools"
          element={
            <ProtectedRoute>
              <div className="max-w-[480px] mx-auto min-h-screen bg-white shadow-2xl relative pb-20">
                <Navbar />
                <SchoolSearch />
                <BottomNav />
                <AIChatbot />
              </div>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/privacy"
          element={
            <ProtectedRoute>
              <div className="max-w-[480px] mx-auto min-h-screen bg-white shadow-2xl relative pb-20">
                <Navbar />
                <Privacy />
                <BottomNav />
                <AIChatbot />
              </div>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/directions"
          element={
            <ProtectedRoute>
              <div className="max-w-[480px] mx-auto min-h-screen bg-white shadow-2xl relative pb-20">
                <Navbar />
                <Directions />
                <BottomNav />
                <AIChatbot />
              </div>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/add"
          element={
            <ProtectedRoute>
              <div className="max-w-[480px] mx-auto min-h-screen bg-white shadow-2xl relative pb-20">
                <Navbar />
                <AddApartment />
                <BottomNav />
                <AIChatbot />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to={isAuthenticated() ? "/home" : "/"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
