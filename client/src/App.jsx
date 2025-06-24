import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import EngineerDashboard from './components/EngineerDashboard';
import ProtectedRoute from './components/ProtectedRoute'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

       
        <Route
          path="/StudentDashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
       <Route
          path="/AdminDashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
            
          }
        />
        <Route
          path="/EngineerDashboard"
          element={
            <ProtectedRoute>
              <EngineerDashboard />
            </ProtectedRoute>
              
          }
        />
        
      </Routes>
    </Router>
  );
}

export default App;
