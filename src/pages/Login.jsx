import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // Pega o e-mail do admin das variáveis de ambiente
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    try {
      const userCredential = await login(email, senha);
      const user = userCredential.user;

      // 1. Verificar se é o Igor (Admin Master)
      if (user.email === ADMIN_EMAIL) {
        navigate("/admin");
        return;
      }

      // 2. Se for colégio, verificar status no Firestore
      const userDoc = await getDoc(doc(db, "usuarios", user.uid)); 
      // Nota: Idealmente use o UID ou uma busca por email na coleção usuarios
      
      if (userDoc.exists() && userDoc.data().status === "suspenso") {
        setErro("Esta conta está suspensa. Contacte o administrador.");
        return;
      }

      localStorage.setItem("colegioLogado", email);
      navigate("/dashboard");

    } catch (err) {
      setErro("E-mail ou senha inválidos.");
    }
  }

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", alignItems: "center", justifyContent: "center", background: "#020617", position: "fixed", top: 0, left: 0 }}>
      <div style={{ maxWidth: 360, width: "90%", textAlign: 'center', color: '#f8fafc', background: '#0f172a', padding: '40px', borderRadius: '20px', border: '1px solid #1e293b', boxSizing: 'border-box' }}>
        <h2 style={{ marginBottom: "25px" }}>Login do Sistema</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: '12px', marginBottom: 12, borderRadius: '8px', border: '1px solid #1e293b', background: '#020617', color: '#fff', outline: 'none' }} />
          <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} style={{ width: "100%", padding: '12px', marginBottom: 12, borderRadius: '8px', border: '1px solid #1e293b', background: '#020617', color: '#fff', outline: 'none' }} />
          {erro && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: 10 }}>{erro}</p>}
          <button style={{ width: "100%", padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Entrar</button>
        </form>
        <div style={{ marginTop: 20 }}>
          <Link to="/forgot-password" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>Esqueci minha senha</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;