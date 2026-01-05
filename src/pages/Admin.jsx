import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query } from "firebase/firestore";
import { getApps, initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// --- CONFIGURAÇÃO DE SEGURANÇA PARA O FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCVqh2Lrvsh7C54w66zlhIdKumyUfchLl8",
  authDomain: "agendamento-de-visitas-1b504.firebaseapp.com",
  projectId: "agendamento-de-visitas-1b504",
  storageBucket: "agendamento-de-visitas-1b504.firebasestorage.app",
  messagingSenderId: "83809631398",
  appId: "1:83809631398:web:b488c47e27f6ef8293c867",
  measurementId: "G-179FQCXHN4"
};

const secondaryApp = getApps().find(app => app.name === "Secondary") 
  || initializeApp(firebaseConfig, "Secondary");

const secondaryAuth = getAuth(secondaryApp);

function Admin() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const theme = {
    bg: "#020617",
    card: "#0f172a",
    text: "#f8fafc",
    textMuted: "#94a3b8",
    border: "#1e293b",
    accent: "#2563eb",
    danger: "#ef4444",
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    carregarUsuarios();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function carregarUsuarios() {
    try {
      const q = query(collection(db, "usuarios"));
      const querySnapshot = await getDocs(q);
      const lista = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsuarios(lista);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  }

  async function handleCriar(e) {
    e.preventDefault();
    if (!email || !senha) return alert("Preencha todos os campos");

    try {
      await createUserWithEmailAndPassword(secondaryAuth, email, senha);
      await addDoc(collection(db, "usuarios"), { email, senha });
      
      alert("Colégio cadastrado com sucesso!");
      setEmail(""); 
      setSenha("");
      carregarUsuarios();
    } catch (err) {
      alert("Erro ao cadastrar: " + err.message);
    }
  }

  async function handleExcluir(id) {
    if (window.confirm("Deseja remover este acesso?")) {
      try {
        await deleteDoc(doc(db, "usuarios", id));
        carregarUsuarios();
      } catch (err) {
        alert("Erro ao excluir.");
      }
    }
  }

  const inputStyle = {
    flex: isMobile ? "1 1 100%" : "1",
    padding: "12px",
    borderRadius: "8px",
    border: `1px solid ${theme.border}`,
    background: theme.bg,
    color: theme.text,
    outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "sans-serif" }}>
      
      <header style={{
        padding: "15px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: theme.card,
        borderBottom: `1px solid ${theme.border}`,
      }}>
        <h2 style={{ margin: 0 }}>Painel Master</h2>
        <button 
          onClick={() => { logout(); navigate("/"); }}
          style={{ padding: "8px 16px", background: theme.danger, color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
        >
          Sair
        </button>
      </header>

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
        
        <section style={{ 
          background: theme.card, padding: "25px", borderRadius: "16px", 
          border: `1px solid ${theme.border}`, marginBottom: "30px" 
        }}>
          <h3>Cadastrar Colégio</h3>
          <form onSubmit={handleCriar} style={{ display: 'flex', gap: "10px", flexDirection: isMobile ? "column" : "row" }}>
            <input placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
            <input placeholder="Senha" type="text" value={senha} onChange={e => setSenha(e.target.value)} style={inputStyle} />
            <button type="submit" style={{ padding: "12px 20px", background: theme.accent, color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
              Criar Conta
            </button>
          </form>
        </section>

        <section style={{ 
          background: theme.card, padding: "25px", borderRadius: "16px", 
          border: `1px solid ${theme.border}` 
        }}>
          <h3 style={{ marginBottom: "20px" }}>Colégios Ativos</h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: "100%", borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: theme.textMuted }}>
                  <th style={{ padding: "12px 8px", borderBottom: `2px solid ${theme.border}` }}>E-mail</th>
                  <th style={{ padding: "12px 8px", borderBottom: `2px solid ${theme.border}` }}>Senha</th>
                  <th style={{ padding: "12px 8px", borderBottom: `2px solid ${theme.border}`, textAlign: 'center' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: "20px" }}>Nenhum colégio encontrado.</td>
                  </tr>
                ) : (
                  usuarios.map((u) => (
                    <tr key={u.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: "15px 8px" }}>{u.email}</td>
                      <td style={{ padding: "15px 8px" }}>
                        <code style={{ background: theme.bg, padding: "4px 8px", borderRadius: "4px", color: "#38bdf8" }}>
                          {u.senha}
                        </code>
                      </td>
                      <td style={{ padding: "15px 8px", textAlign: 'center' }}>
                        <button 
                          onClick={() => handleExcluir(u.id)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: "18px" }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Admin;