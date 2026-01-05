import { createContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [logado, setLogado] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const ADMIN_EMAIL = "igolvisck@admin.com"; // Deve ser igual ao do Login.jsx

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLogado(true);
        setUserRole(user.email === ADMIN_EMAIL ? "admin" : "colegio");
      } else {
        setLogado(false);
        setUserRole(null);
      }
      setCarregando(false);
    });
    return () => unsubscribe();
  }, []);

  const login = (email, senha) => signInWithEmailAndPassword(auth, email, senha);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ logado, userRole, carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}