import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  // Check karo browser mein pass mojood hai ya nahi
  const isAuthenticated = localStorage.getItem('onflix_admin_auth') === 'true';

  // Agar pass hai toh andar jane do (<Outlet />), warna login par bhejo
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}