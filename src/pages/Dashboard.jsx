import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  doc, 
  deleteDoc, 
  updateDoc
} from "firebase/firestore";

function Dashboard() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [dark, setDark] = useState(true);

  const [hora, setHora] = useState("");
  const [nomeVisitante, setNomeVisitante] = useState("");
  const [funcionario, setFuncionario] = useState("");
  const [anoVisita, setAnoVisita] = useState("");
  const [observacao, setObservacao] = useState("");
  const [agendamentos, setAgendamentos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  const [funcionarios, setFuncionarios] = useState([]);
  const [novoFuncionario, setNovoFuncionario] = useState("");

  const [series, setSeries] = useState([]);
  const [novaSerie, setNovaSerie] = useState("");

  const [dataSelecionada, setDataSelecionada] = useState("");
  const [mesAtual, setMesAtual] = useState(new Date());
  const [abaVisitas, setAbaVisitas] = useState("proximas"); 

  const [relatorioInicio, setRelatorioInicio] = useState("");
  const [relatorioFim, setRelatorioFim] = useState("");

  const colegioEmail = localStorage.getItem("colegioLogado");

  useEffect(() => {
    if (!colegioEmail) return;

    const qAgendamentos = query(
      collection(db, "agendamentos"),
      where("colegioEmail", "==", colegioEmail)
    );
    
    const unsubAgendamentos = onSnapshot(qAgendamentos, (snapshot) => {
      const lista = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const ordenada = lista.sort((a, b) => new Date(a.data + 'T' + a.hora) - new Date(b.data + 'T' + b.hora));
      setAgendamentos(ordenada);
    });

    const qFuncionarios = query(
      collection(db, "funcionarios"),
      where("colegioEmail", "==", colegioEmail)
    );
    const unsubFuncionarios = onSnapshot(qFuncionarios, (snapshot) => {
      setFuncionarios(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qSeries = query(
      collection(db, "series"),
      where("colegioEmail", "==", colegioEmail)
    );
    const unsubSeries = onSnapshot(qSeries, (snapshot) => {
      setSeries(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubAgendamentos();
      unsubFuncionarios();
      unsubSeries();
    };
  }, [colegioEmail]);

  // NOVO: Função para limpar todos os filtros ativos
  function limparTodosFiltros() {
    setDataSelecionada("");
    setRelatorioInicio("");
    setRelatorioFim("");
    setAbaVisitas("proximas");
  }

  async function salvarAgendamento(e) {
    e.preventDefault();
    if (!dataSelecionada || !hora || !nomeVisitante || !funcionario || !anoVisita) {
      alert("Selecione um dia e preencha todos os campos");
      return;
    }

    const dados = {
      data: dataSelecionada,
      hora,
      visitante: nomeVisitante,
      funcionario,
      anoVisita,
      observacao,
      colegioEmail: colegioEmail 
    };

    try {
      if (editandoId) {
        await updateDoc(doc(db, "agendamentos", editandoId), dados);
        setEditandoId(null);
      } else {
        await addDoc(collection(db, "agendamentos"), dados);
      }
      setHora(""); setNomeVisitante(""); setFuncionario(""); setAnoVisita(""); setObservacao("");
    } catch (err) {
      alert("Erro ao salvar no banco.");
    }
  }

  async function adicionarFuncionario(e) {
    e.preventDefault();
    if (!novoFuncionario.trim()) return;
    await addDoc(collection(db, "funcionarios"), { nome: novoFuncionario.trim(), colegioEmail });
    setNovoFuncionario("");
  }

  async function excluirFuncionario(id) {
    if (window.confirm("Remover funcionário?")) await deleteDoc(doc(db, "funcionarios", id));
  }

  async function adicionarSerie(e) {
    e.preventDefault();
    if (!novaSerie.trim()) return;
    await addDoc(collection(db, "series"), { nome: novaSerie.trim(), colegioEmail });
    setNovaSerie("");
  }

  async function excluirSerie(id) {
    if (window.confirm("Remover esta opção de Série/Ano?")) await deleteDoc(doc(db, "series", id));
  }

  function prepararEdicao(item) {
    setDataSelecionada(item.data);
    setHora(item.hora);
    setNomeVisitante(item.visitante);
    setFuncionario(item.funcionario);
    setAnoVisita(item.anoVisita);
    setObservacao(item.observacao || "");
    setEditandoId(item.id);
  }

  async function excluirAgendamento(id) {
    if (window.confirm("Excluir esta visita?")) await deleteDoc(doc(db, "agendamentos", id));
  }

  const hoje = new Date().toISOString().split('T')[0];
  const listaFiltrada = agendamentos.filter(a => {
    if (dataSelecionada) return a.data === dataSelecionada;
    if (abaVisitas === "proximas") return a.data >= hoje;
    return true; 
  });

  const agendamentosRelatorio = agendamentos.filter(a => {
    if (!relatorioInicio || !relatorioFim) return false;
    return a.data >= relatorioInicio && a.data <= relatorioFim;
  });

  const visitasPorFuncionario = agendamentosRelatorio.reduce((acc, curr) => {
    acc[curr.funcionario] = (acc[curr.funcionario] || 0) + 1;
    return acc;
  }, {});

  const theme = {
    bg: dark ? "#020617" : "#f1f5f9",
    card: dark ? "#0f172a" : "#ffffff",
    text: dark ? "#f8fafc" : "#020617",
    border: dark ? "#1e293b" : "#e2e8f0",
    accent: "#2563eb",
    inputBg: dark ? "#020617" : "#f8fafc",
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${theme.border}`,
    background: theme.inputBg, color: theme.text, marginBottom: 10, outline: "none", boxSizing: "border-box"
  };

  const cardStyle = {
    background: theme.card, borderRadius: 14, padding: 20, border: `1px solid ${theme.border}`,
    height: "100%", overflowY: "auto", boxSizing: "border-box"
  };

  const btnLimparStyle = {
    fontSize: 11, padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
    background: 'transparent', color: theme.text, border: `1px solid ${theme.border}`,
    opacity: 0.7
  };

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", color: theme.text, transition: '0.3s' }}>
      <header style={{ padding: "15px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}` }}>
        <h1 style={{ fontSize: isMobile ? "1.2rem" : "1.8rem", margin: 0 }}>Gestão de Visitas</h1>
        <div>
          <button onClick={() => setDark(!dark)} style={{ padding: "8px 12px", borderRadius: 8, cursor: "pointer", background: theme.card, color: theme.text, border: `1px solid ${theme.border}` }}>
            {dark ? "🌞" : "🌙"}
          </button>
          <button onClick={() => { logout(); navigate("/"); }} style={{ marginLeft: 10, padding: "8px 12px", borderRadius: 8, background: "#ef4444", color: "#fff", border: "none", cursor: "pointer" }}>
            Sair
          </button>
        </div>
      </header>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: isMobile ? "1fr" : "1.2fr 2fr 1.8fr", 
        gap: 24, padding: isMobile ? 16 : 24, 
        minHeight: "calc(100vh - 80px)",
        boxSizing: "border-box" 
      }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>Equipe</h3>
            <form onSubmit={adicionarFuncionario}>
              <input style={inputStyle} placeholder="Add funcionário..." value={novoFuncionario} onChange={e => setNovoFuncionario(e.target.value)} />
            </form>
            {funcionarios.map((f) => (
              <div key={f.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${theme.border}`, fontSize: 14 }}>
                <span>{f.nome}</span>
                <button onClick={() => excluirFuncionario(f.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑</button>
              </div>
            ))}
          </div>

          <div style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>Séries / Anos</h3>
            <form onSubmit={adicionarSerie}>
              <input style={inputStyle} placeholder="Add série (ex: 1º Ano)..." value={novaSerie} onChange={e => setNovaSerie(e.target.value)} />
            </form>
            {series.map((s) => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${theme.border}`, fontSize: 14 }}>
                <span>{s.nome}</span>
                <button onClick={() => excluirSerie(s.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑</button>
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1))}>◀</button>
            <h3 style={{ margin: 0, textTransform: 'capitalize' }}>{mesAtual.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</h3>
            <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1))}>▶</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 20 }}>
            {Array.from({ length: new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1).getDay() }).map((_, i) => <div key={i} />)}
            {Array.from({ length: new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate() }).map((_, i) => {
              const dia = i + 1;
              const dataStr = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
              const isSelected = dataSelecionada === dataStr;
              return (
                <div key={dia} onClick={() => setDataSelecionada(isSelected ? "" : dataStr)} style={{
                  padding: "10px 0", textAlign: "center", borderRadius: 8, cursor: "pointer",
                  background: isSelected ? theme.accent : "transparent",
                  color: isSelected ? "#fff" : theme.text,
                  border: `1px solid ${isSelected ? theme.accent : theme.border}`
                }}>{dia}</div>
              );
            })}
          </div>

          <form onSubmit={salvarAgendamento}>
            <div style={{ display: 'flex', gap: 10 }}>
              <input type="time" style={{...inputStyle, flex: 1}} value={hora} onChange={e => setHora(e.target.value)} />
              <input placeholder="Visitante" style={{...inputStyle, flex: 2}} value={nomeVisitante} onChange={e => setNomeVisitante(e.target.value)} />
            </div>
            <select style={inputStyle} value={anoVisita} onChange={e => setAnoVisita(e.target.value)}>
              <option value="">Série/Ano...</option>
              {series.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
            </select>
            <select style={inputStyle} value={funcionario} onChange={e => setFuncionario(e.target.value)}>
              <option value="">Responsável...</option>
              {funcionarios.map(f => <option key={f.id} value={f.nome}>{f.nome}</option>)}
            </select>
            <textarea style={inputStyle} rows={2} placeholder="Observações..." value={observacao} onChange={e => setObservacao(e.target.value)} />
            <button style={{ width: '100%', padding: 12, borderRadius: 8, background: theme.accent, color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
              {editandoId ? "Atualizar Registro" : "Confirmar Agendamento"}
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button 
                onClick={() => { setAbaVisitas("proximas"); setDataSelecionada(""); }}
                style={{ flex: 1, padding: 8, borderRadius: 8, cursor: 'pointer', background: abaVisitas === "proximas" ? theme.accent : theme.inputBg, color: theme.text, border: `1px solid ${theme.border}` }}
              >Próximas</button>
              <button 
                onClick={() => { setAbaVisitas("historico"); setDataSelecionada(""); }}
                style={{ flex: 1, padding: 8, borderRadius: 8, cursor: 'pointer', background: abaVisitas === "historico" ? theme.accent : theme.inputBg, color: theme.text, border: `1px solid ${theme.border}` }}
              >Histórico</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>
                {dataSelecionada ? `Filtrando: ${dataSelecionada.split('-').reverse().join('/')}` : abaVisitas === "proximas" ? "Próximas Visitas" : "Histórico"}
              </h3>
              {/* BOTÃO LIMPAR FILTRO (VISÍVEL SE HOUVER DATA SELECIONADA) */}
              {dataSelecionada && (
                <button onClick={() => setDataSelecionada("")} style={btnLimparStyle}>Limpar Data</button>
              )}
            </div>
            
            {listaFiltrada.length === 0 && <p style={{ fontSize: 14, opacity: 0.6 }}>Nenhuma visita encontrada.</p>}
            
            {listaFiltrada.map((a) => (
              <div key={a.id} style={{ background: theme.bg, padding: 12, borderRadius: 10, marginBottom: 12, border: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: theme.accent, fontWeight: 'bold' }}>
                  <span>📅 {a.data.split('-').reverse().join('/')}</span>
                  <span>🕒 {a.hora}</span>
                </div>
                <div style={{ margin: '4px 0', fontWeight: 'bold', fontSize: 14 }}>{a.visitante}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{a.funcionario} • {a.anoVisita}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={() => prepararEdicao(a)} style={{ flex: 1, fontSize: 11, padding: '4px', borderRadius: 4, cursor: 'pointer', background: theme.card, color: theme.text, border: `1px solid ${theme.border}` }}>Editar</button>
                  <button onClick={() => excluirAgendamento(a.id)} style={{ flex: 1, fontSize: 11, padding: '4px', borderRadius: 4, cursor: 'pointer', background: '#fee2e2', color: '#ef4444', border: 'none' }}>Excluir</button>
                </div>
              </div>
            ))}
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <h3 style={{ margin: 0 }}>📊 Relatórios</h3>
              {/* BOTÃO LIMPAR RELATÓRIO */}
              {(relatorioInicio || relatorioFim) && (
                <button onClick={() => { setRelatorioInicio(""); setRelatorioFim(""); }} style={btnLimparStyle}>Limpar</button>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: 5, marginBottom: 15 }}>
              <input type="date" style={{...inputStyle, fontSize: 11}} value={relatorioInicio} onChange={e => setRelatorioInicio(e.target.value)} />
              <input type="date" style={{...inputStyle, fontSize: 11}} value={relatorioFim} onChange={e => setRelatorioFim(e.target.value)} />
            </div>
            
            {relatorioInicio && relatorioFim ? (
              <div style={{ fontSize: 14 }}>
                <p><strong>Total no período:</strong> {agendamentosRelatorio.length}</p>
                <div style={{ marginTop: 10 }}>
                  <p style={{ fontWeight: 'bold', marginBottom: 5 }}>Por Funcionário:</p>
                  {Object.entries(visitasPorFuncionario).map(([nome, qtd]) => (
                    <div key={nome} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${theme.border}` }}>
                      <span>{nome}</span>
                      <span>{qtd}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 12, opacity: 0.6 }}>Selecione um período para gerar estatísticas.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;