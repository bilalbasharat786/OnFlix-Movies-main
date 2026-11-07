import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <GoogleOAuthProvider clientId="614223157880-3iv0ualg0plvd69q1e4e5lk6saqbvck1.apps.googleusercontent.com">
      <AuthProvider>
        <HelmetProvider>
        <App />
        </HelmetProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
