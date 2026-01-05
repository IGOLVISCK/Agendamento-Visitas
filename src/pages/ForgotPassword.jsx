import { useState } from "react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setErro("");
    setMensagem("");
    try {
      await sendPasswordResetEmail(auth, email);
      setMensagem("E-mail enviado! Verifique sua caixa de entrada.");
      setTimeout(() => navigate("/"), 5000);
    } catch (err) {
      setErro("E-mail não encontrado ou erro no servidor.");
    }
  };

  return (
    <div style={{ 
      height: "100vh", 
      width: "100vw",
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      background: "#020617",
      position: "fixed",
      top: 0,
      left: 0
    }}>
      <div style={{ 
        maxWidth: 380, 
        width: "90%",
        textAlign: 'center', 
        color: '#f8fafc', 
        background: '#0f172a', 
        padding: '40px', 
        borderRadius: '20px',
        border: '1px solid #1e293b',
        boxSizing: 'border-box',
        boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
      }}>
        <h2 style={{ marginBottom: 10 }}>Recuperar Senha</h2>
        <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 25 }}>
          Enviaremos um link seguro para o seu e-mail cadastrado.
        </p>

        <form onSubmit={handleReset}>
          <input
            type="email"
            placeholder="Seu e-mail cadastrado"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: '12px', marginBottom: 15, borderRadius: '8px', border: '1px solid #1e293b', background: '#020617', color: '#fff', boxSizing: 'border-box', outline: 'none' }}
          />

          {mensagem && <p style={{ color: '#10b981', fontSize: '14px', marginBottom: 10 }}>{mensagem}</p>}
          {erro && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: 10 }}>{erro}</p>}

          <button style={{ width: "100%", padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Enviar Link
          </button>
        </form>

        <div style={{ marginTop: 25 }}>
          <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>
            ← Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;