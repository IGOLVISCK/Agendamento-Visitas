import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import ForgotPassword from "./pages/ForgotPassword"; 

function RotaProtegida({ children, roleRequired }) {
  const { logado, userRole, carregando } = useContext(AuthContext);
  if (carregando) return <p>Carregando...</p>;
  if (!logado) return <Navigate to="/" />;
  if (roleRequired && userRole !== roleRequired) {
    return <Navigate to={userRole === 'admin' ? "/admin" : "/dashboard"} />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* NOVA ROTA ADICIONADA */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route path="/dashboard" element={
          <RotaProtegida roleRequired="colegio">
            <Dashboard />
          </RotaProtegida>
        } />

        <Route path="/admin" element={
          <RotaProtegida roleRequired="admin">
            <Admin />
          </RotaProtegida>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;