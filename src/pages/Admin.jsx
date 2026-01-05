import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { db, auth } from "../firebase";
import { collection, addDoc, doc, updateDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const secondaryApp = getApps().find(app => app.name === "Secondary") || initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = getAuth(secondaryApp);

function Admin() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [totalVisitas, setTotalVisitas] = useState(0);
  const [novoAviso, setNovoAviso] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const theme = { bg: "#020617", card: "#0f172a", text: "#f8fafc", border: "#1e293b", accent: "#2563eb", danger: "#ef4444", success: "#10b981" };

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "usuarios"), (snap) => setUsuarios(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubVisitas = onSnapshot(collection(db, "agendamentos"), (snap) => setTotalVisitas(snap.size));
    return () => { unsubUsers(); unsubVisitas(); };
  }, []);

  async function handleCriar(e) {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(secondaryAuth, email, senha);
      await addDoc(collection(db, "usuarios"), { email, senha, status: "ativo", dataCriacao: serverTimestamp() });
      alert("Colégio criado!");
      setEmail(""); setSenha("");
    } catch (err) { alert("Erro: " + err.message); }
  }

  async function alternarStatus(id, statusAtual) {
    const novoStatus = statusAtual === "ativo" ? "suspenso" : "ativo";
    await updateDoc(doc(db, "usuarios", id), { status: novoStatus });
  }

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, padding: "20px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
        <h2>Painel Master - Igor</h2>
        <button onClick={() => { logout(); navigate("/"); }} style={{ background: theme.danger, border: "none", color: "#fff", padding: "8px 16px", borderRadius: "8px" }}>Sair</button>
      </header>

      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <div style={{ background: theme.card, padding: "20px", borderRadius: "12px", flex: 1, border: `1px solid ${theme.border}` }}>
          <p>Colégios Ativos</p>
          <h3>{usuarios.length}</h3>
        </div>
        <div style={{ background: theme.card, padding: "20px", borderRadius: "12px", flex: 1, border: `1px solid ${theme.border}` }}>
          <p>Total de Visitas Global</p>
          <h3>{totalVisitas}</h3>
        </div>
      </div>

      <section style={{ background: theme.card, padding: "20px", borderRadius: "12px", border: `1px solid ${theme.border}` }}>
        <h3>Gestão de Colégios</h3>
        {usuarios.map(u => (
          <div key={u.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${theme.border}` }}>
            <span>{u.email} ({u.status || "ativo"})</span>
            <div>
              <button onClick={() => alternarStatus(u.id, u.status)} style={{ background: u.status === "suspenso" ? theme.success : theme.danger, color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}>
                {u.status === "suspenso" ? "Ativar" : "Suspender"}
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Admin;