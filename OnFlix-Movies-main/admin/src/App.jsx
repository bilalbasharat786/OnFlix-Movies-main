import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components & Pages
import AdminNavbar from './components/Navbar';
import ProtectedRoute from "./components/ProtectedRoute";
import Login from './pages/Login';

// Movie Pages
import AddMovie from './pages/AddMovie';
import ManageMovies from './pages/ManageMovies';

// Series Pages 🔥
import AddSeries from './pages/AddSeries';
import ManageSeries from './pages/ManageSeries';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white font-sans">
        <ToastContainer theme="dark" />
        
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>             
              <Route path="/" element={<Navigate to="/admin/add-movie" />} />
              <Route path="/admin" element={<Navigate to="/admin/add-movie" />} />

              {/* ======================= */}
              {/* === MOVIES ROUTES === */}
              {/* ======================= */}
              <Route path="/admin/add-movie" element={
                <>
                  <AdminNavbar />
                  <AddMovie />
                </>
              } />
              
              <Route path="/admin/manage-bollywood" element={
                <>
                  <AdminNavbar />
                  <ManageMovies categoryTitle="Bollywood" />
                </>
              } />
              
              <Route path="/admin/manage-hollywood" element={
                <>
                  <AdminNavbar />
                  <ManageMovies categoryTitle="Hollywood" />
                </>
              } />
                
              <Route path="/admin/manage-tollywood" element={
                <>
                  <AdminNavbar />
                  <ManageMovies categoryTitle="Tollywood" />
                </>
              } />

              {/* ======================= */}
              {/* === SERIES ROUTES 🔥 === */}
              {/* ======================= */}
              <Route path="/admin/add-series" element={
                <>
                  <AdminNavbar />
                  <AddSeries />
                </>
              } />

              <Route path="/admin/manage-series" element={
                <>
                  <AdminNavbar />
                  <ManageSeries categoryTitle="Web Series" />
                </>
              } />

              <Route path="/admin/manage-kdrama" element={
                <>
                  <AdminNavbar />
                  <ManageSeries categoryTitle="K-Drama" />
                </>
              } />

              <Route path="/admin/manage-anime" element={
                <>
                  <AdminNavbar />
                  <ManageSeries categoryTitle="Anime" />
                </>
              } />

            </Route>

            {/* Agar koi ajeeb URL likhe toh wapis login par bhej do */}
            <Route path="*" element={<Navigate to="/login" replace />} />

          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
