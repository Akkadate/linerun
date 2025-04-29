// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Loading from './components/common/Loading';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import RunningFormPage from './pages/RunningFormPage';
import StatsPage from './pages/StatsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <Loading />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route 
                path="/submit" 
                element={
                  <ProtectedRoute>
                    <RunningFormPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/stats" 
                element={
                  <ProtectedRoute>
                    <StatsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/leaderboard" 
                element={
                  <ProtectedRoute>
                    <LeaderboardPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
