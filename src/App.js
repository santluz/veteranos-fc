/* eslint-disable no-restricted-globals */
import { useState } from "react";

const INITIAL_PLAYERS = [
  { id: 1, nome: "Carlos Silva", email: "carlos@email.com", telefone: "(11) 99999-1111", tipo: "mensalista", status: "ativo", pagamentos: [{ mes: "2026-01", valor: 80, pago: true }, { mes: "2026-02", valor: 80, pago: false }] },
  { id: 2, nome: "João Pereira", email: "joao@email.com", telefone: "(11) 99999-2222", tipo: "avulso", status: "ativo", pagamentos: [{ mes: "2026-02", valor: 30, pago: true }] },
  { id: 3, nome: "Roberto Alves", email: "roberto@email.com", telefone: "(11) 99999-3333", tipo: "mensalista", status: "ativo", pagamentos: [{ mes: "2026-01", valor: 80, pago: true }, { mes: "2026-02", valor: 80, pago: true }] },
];

const INITIAL_DESPESAS = [
  { id: 1, descricao: "Aluguel do campo", valor: 400, data: "2026-02-10", categoria: "Infraestrutura" },
  { id: 2, descricao: "Coletes e bolas", valor: 150, data: "2026-02-05", categoria: "Equipamentos" },
];

const VALOR_MENSALIDADE = 80;
const VALOR_AVULSO = 30;

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginModal, setLoginModal] = useState(true);
  const [senha, setSenha] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const [aba, setAba] = useState("dashboard");
  const [jogadores, setJogadores] = useState(INITIAL_PLAYERS);
  const [despesas, setDespesas] = useState(INITIAL_DESPESAS);
  const [modalJogador, setModalJogador] = useState(false);
  const [modalDespesa, setModalDespesa] = useState(false);
  const [jogadorEdit, setJogadorEdit] = useState(null);
  const [novoJogador, setNovoJogador] = useState({ nome: "", email: "", telefone: "", tipo: "mensalista", status: "ativo" });
  const [novaDespesa, setNovaDespesa] = useState({ descricao: "", valor: "", data: "", categoria: "Infraestrutura" });
  const [mesFiltro, setMesFiltro] = useState("2026-02");

  const entrar = (admin) => {
    if (admin) {
      if (senha === "admin123") {
        setIsAdmin(true);
        setLoginModal(false);
      } else {
        setErroLogin("Senha incorreta.");
      }
    } else {
      setIsAdmin(false);
      setLoginModal(false);
    }
  };

  const receitaMes = jogadores.reduce((acc, j) => {
    const pags = j.pagamentos.filter(p => p.mes === mesFiltro && p.pago);
    return acc + pags.reduce((a, p) => a + p.valor, 0);
  }, 0);

  const despesasMes = despesas.reduce((acc, d) => {
    if (d.data.startsWith(mesFiltro)) return acc + parseFloat(d.valor);
    return acc;
  }, 0);

  const saldo = receitaMes - despesasMes;

  const totalMensalistas = jogadores.filter(j => j.tipo === "mensalista" && j.status === "ativo").length;
  const totalAvulsos = jogadores.filter(j => j.tipo === "avulso" && j.status === "ativo").length;

  const inadimplentes = jogadores.filter(j => {
    if (j.tipo !== "mensalista") return false;
    const pag = j.pagamentos.find(p => p.mes === mesFiltro);
    return !pag || !pag.pago;
  });

  const salvarJogador = () => {
    if (!novoJogador.nome) return;
    if (jogadorEdit !== null) {
      setJogadores(jogadores.map(j => j.id === jogadorEdit ? { ...j, ...novoJogador } : j));
    } else {
      setJogadores([...jogadores, { ...novoJogador, id: Date.now(), pagamentos: [] }]);
    }
    setModalJogador(false);
    setNovoJogador({ nome: "", email: "", telefone: "", tipo: "mensalista", status: "ativo" });
    setJogadorEdit(null);
  };

  const salvarDespesa = () => {
    if (!novaDespesa.descricao || !novaDespesa.valor) return;
    setDespesas([...despesas, { ...novaDespesa, id: Date.now(), valor: parseFloat(novaDespesa.valor) }]);
    setModalDespesa(false);
    setNovaDespesa({ descricao: "", valor: "", data: "", categoria: "Infraestrutura" });
  };

  const editarJogador = (j) => {
    setNovoJogador({ nome: j.nome, email: j.email, telefone: j.telefone, tipo: j.tipo, status: j.status });
    setJogadorEdit(j.id);
    setModalJogador(true);
  };

  const removerJogador = (id) => {
    if (confirm("Remover jogador?")) setJogadores(jogadores.filter(j => j.id !== id));
  };

  const togglePagamento = (jogadorId) => {
    setJogadores(jogadores.map(j => {
      if (j.id !== jogadorId) return j;
      const pags = [...j.pagamentos];
      const idx = pags.findIndex(p => p.mes === mesFiltro);
      if (idx >= 0) {
        pags[idx] = { ...pags[idx], pago: !pags[idx].pago };
      } else {
        pags.push({ mes: mesFiltro, valor: j.tipo === "mensalista" ? VALOR_MENSALIDADE : VALOR_AVULSO, pago: true });
      }
      return { ...j, pagamentos: pags };
    }));
  };

  const getPagamento = (j) => j.pagamentos.find(p => p.mes === mesFiltro);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "'Barlow', sans-serif", color: "#e8ecf3" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;600;700;900&family=Barlow+Condensed:wght@700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0a0f1e; } ::-webkit-scrollbar-thumb { background: #2a3a5c; border-radius: 3px; }
        .btn { cursor: pointer; border: none; border-radius: 8px; font-family: 'Barlow', sans-serif; font-weight: 700; transition: all 0.2s; }
        .btn:hover { transform: translateY(-1px); }
        .btn-green { background: linear-gradient(135deg, #00d97e, #00b865); color: #fff; padding: 10px 20px; }
        .btn-red { background: linear-gradient(135deg, #ff4757, #cc2030); color: #fff; padding: 8px 14px; font-size: 13px; }
        .btn-blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #fff; padding: 8px 14px; font-size: 13px; }
        .btn-gray { background: #1e2a45; color: #94a3b8; padding: 8px 14px; font-size: 13px; }
        .card { background: linear-gradient(135deg, #111827, #1a2540); border: 1px solid #1e2e50; border-radius: 16px; padding: 24px; }
        .input { background: #0d1525; border: 1px solid #1e2e50; border-radius: 8px; color: #e8ecf3; padding: 10px 14px; font-family: 'Barlow', sans-serif; font-size: 14px; width: 100%; outline: none; }
        .input:focus { border-color: #3b82f6; }
        select.input option { background: #0d1525; }
        .tag { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        .tag-green { background: rgba(0,217,126,0.15); color: #00d97e; }
        .tag-yellow { background: rgba(255,186,0,0.15); color: #ffba00; }
        .tag-red { background: rgba(255,71,87,0.15); color: #ff4757; }
        .tag-blue { background: rgba(59,130,246,0.15); color: #3b82f6; }
        .overlay { position: fixed; inset: 0; background: rgba(0,0,10,0.85); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); }
        .modal { background: #111827; border: 1px solid #1e2e50; border-radius: 20px; padding: 32px; width: 90%; max-width: 440px; }
        .nav-tab { padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 14px; transition: all 0.2s; border: none; font-family: 'Barlow', sans-serif; }
        .nav-tab.active { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #fff; }
        .nav-tab:not(.active) { background: transparent; color: #64748b; }
        .nav-tab:not(.active):hover { color: #94a3b8; background: #1a2540; }
        .table-row { display: grid; align-items: center; padding: 14px 16px; border-radius: 10px; transition: background 0.15s; }
        .table-row:hover { background: #1a2540; }
        .stat-card { background: linear-gradient(135deg, #111827, #1a2540); border-radius: 16px; padding: 22px; border-left: 4px solid; position: relative; overflow: hidden; }
        .stat-card::after { content: ''; position: absolute; right: -20px; top: -20px; width: 80px; height: 80px; border-radius: 50%; opacity: 0.06; }
        .progress-bar { height: 6px; background: #1e2e50; border-radius: 3px; overflow: hidden; margin-top: 8px; }
        .progress-fill { height: 100%; border-radius: 3px; transition: width 0.5s; }
      `}</style>

      {/* Login Modal */}
      {loginModal && (
        <div className="overlay">
          <div className="modal" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>⚽</div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 900, marginBottom: 4, background: "linear-gradient(135deg, #3b82f6, #00d97e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>VETERANOS FC</h1>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>Gestão do Grupo</p>

            <div style={{ background: "#0d1525", border: "1px solid #1e2e50", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12, fontWeight: 600 }}>ACESSO ADMINISTRADOR</p>
              <input className="input" type="password" placeholder="Senha do administrador" value={senha} onChange={e => { setSenha(e.target.value); setErroLogin(""); }} onKeyDown={e => e.key === "Enter" && entrar(true)} style={{ marginBottom: 10 }} />
              {erroLogin && <p style={{ color: "#ff4757", fontSize: 12, marginBottom: 8 }}>{erroLogin}</p>}
              <button className="btn btn-blue" style={{ width: "100%" }} onClick={() => entrar(true)}>Entrar como Admin</button>
            </div>

            <button className="btn btn-gray" style={{ width: "100%", padding: "12px" }} onClick={() => entrar(false)}>Entrar como Visitante (só visualização)</button>
          </div>
        </div>
      )}

      {/* Modal Jogador */}
      {modalJogador && (
        <div className="overlay">
          <div className="modal">
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 900, marginBottom: 20 }}>{jogadorEdit ? "EDITAR JOGADOR" : "NOVO JOGADOR"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input className="input" placeholder="Nome completo" value={novoJogador.nome} onChange={e => setNovoJogador({ ...novoJogador, nome: e.target.value })} />
              <input className="input" placeholder="E-mail" value={novoJogador.email} onChange={e => setNovoJogador({ ...novoJogador, email: e.target.value })} />
              <input className="input" placeholder="Telefone" value={novoJogador.telefone} onChange={e => setNovoJogador({ ...novoJogador, telefone: e.target.value })} />
              <select className="input" value={novoJogador.tipo} onChange={e => setNovoJogador({ ...novoJogador, tipo: e.target.value })}>
                <option value="mensalista">Mensalista (R$ {VALOR_MENSALIDADE})</option>
                <option value="avulso">Avulso (R$ {VALOR_AVULSO})</option>
              </select>
              <select className="input" value={novoJogador.status} onChange={e => setNovoJogador({ ...novoJogador, status: e.target.value })}>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="btn btn-green" style={{ flex: 1 }} onClick={salvarJogador}>Salvar</button>
              <button className="btn btn-gray" style={{ flex: 1 }} onClick={() => { setModalJogador(false); setJogadorEdit(null); }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Despesa */}
      {modalDespesa && (
        <div className="overlay">
          <div className="modal">
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 900, marginBottom: 20 }}>NOVA DESPESA</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input className="input" placeholder="Descrição" value={novaDespesa.descricao} onChange={e => setNovaDespesa({ ...novaDespesa, descricao: e.target.value })} />
              <input className="input" placeholder="Valor (R$)" type="number" value={novaDespesa.valor} onChange={e => setNovaDespesa({ ...novaDespesa, valor: e.target.value })} />
              <input className="input" type="date" value={novaDespesa.data} onChange={e => setNovaDespesa({ ...novaDespesa, data: e.target.value })} />
              <select className="input" value={novaDespesa.categoria} onChange={e => setNovaDespesa({ ...novaDespesa, categoria: e.target.value })}>
                <option>Infraestrutura</option>
                <option>Equipamentos</option>
                <option>Administrativo</option>
                <option>Outros</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="btn btn-green" style={{ flex: 1 }} onClick={salvarDespesa}>Salvar</button>
              <button className="btn btn-gray" style={{ flex: 1 }} onClick={() => setModalDespesa(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #0d1525, #111827)", borderBottom: "1px solid #1e2e50", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>⚽</span>
          <div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, letterSpacing: 1, background: "linear-gradient(135deg, #3b82f6, #00d97e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>VETERANOS FC</h1>
            <p style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>SISTEMA DE GESTÃO</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className={`tag ${isAdmin ? "tag-green" : "tag-yellow"}`}>{isAdmin ? "👑 ADMINISTRADOR" : "👁 VISITANTE"}</span>
          <button className="btn btn-gray" style={{ fontSize: 12 }} onClick={() => { setLoginModal(true); setSenha(""); setErroLogin(""); }}>Trocar Acesso</button>
        </div>
      </header>

      {/* Nav */}
      <nav style={{ padding: "16px 24px", display: "flex", gap: 8, borderBottom: "1px solid #1e2e50", background: "#0d1525" }}>
        {["dashboard", "jogadores", "financeiro"].map(a => (
          <button key={a} className={`nav-tab ${aba === a ? "active" : ""}`} onClick={() => setAba(a)}>
            {a === "dashboard" ? "📊 Dashboard" : a === "jogadores" ? "👥 Jogadores" : "💰 Financeiro"}
          </button>
        ))}
      </nav>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>

        {/* Filtro de mês */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <span style={{ color: "#64748b", fontSize: 14, fontWeight: 600 }}>Mês de referência:</span>
          <input type="month" className="input" style={{ width: "auto" }} value={mesFiltro} onChange={e => setMesFiltro(e.target.value)} />
        </div>

        {/* DASHBOARD */}
        {aba === "dashboard" && (
          <div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, marginBottom: 20 }}>VISÃO GERAL</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
              <div className="stat-card" style={{ borderLeftColor: "#00d97e" }}>
                <p style={{ color: "#64748b", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>RECEITA DO MÊS</p>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 900, color: "#00d97e" }}>R$ {receitaMes.toFixed(2)}</p>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min((receitaMes / (totalMensalistas * VALOR_MENSALIDADE + totalAvulsos * VALOR_AVULSO || 1)) * 100, 100)}%`, background: "#00d97e" }} /></div>
              </div>
              <div className="stat-card" style={{ borderLeftColor: "#ff4757" }}>
                <p style={{ color: "#64748b", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>DESPESAS DO MÊS</p>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 900, color: "#ff4757" }}>R$ {despesasMes.toFixed(2)}</p>
              </div>
              <div className="stat-card" style={{ borderLeftColor: saldo >= 0 ? "#3b82f6" : "#ff4757" }}>
                <p style={{ color: "#64748b", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SALDO</p>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 900, color: saldo >= 0 ? "#3b82f6" : "#ff4757" }}>R$ {saldo.toFixed(2)}</p>
              </div>
              <div className="stat-card" style={{ borderLeftColor: "#ffba00" }}>
                <p style={{ color: "#64748b", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>JOGADORES ATIVOS</p>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 900, color: "#ffba00" }}>{jogadores.filter(j => j.status === "ativo").length}</p>
                <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{totalMensalistas} mensalistas · {totalAvulsos} avulsos</p>
              </div>
            </div>

            {/* Inadimplentes */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 900, marginBottom: 16, color: "#ff4757" }}>
                ⚠️ INADIMPLENTES — {mesFiltro} ({inadimplentes.length})
              </h3>
              {inadimplentes.length === 0 ? (
                <p style={{ color: "#00d97e", fontWeight: 700 }}>✅ Todos os mensalistas pagaram neste mês!</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {inadimplentes.map(j => (
                    <div key={j.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(255,71,87,0.07)", borderRadius: 10, border: "1px solid rgba(255,71,87,0.2)" }}>
                      <div>
                        <p style={{ fontWeight: 700 }}>{j.nome}</p>
                        <p style={{ fontSize: 12, color: "#64748b" }}>{j.telefone} · {j.email}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontWeight: 700, color: "#ff4757" }}>R$ {VALOR_MENSALIDADE},00 pendente</span>
                        {isAdmin && <button className="btn btn-green" style={{ fontSize: 12 }} onClick={() => togglePagamento(j.id)}>Marcar Pago</button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resumo receita por tipo */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="card">
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 900, marginBottom: 14 }}>RECEITA POR TIPO</h3>
                {[{ label: "Mensalistas", color: "#3b82f6", valor: jogadores.filter(j => j.tipo === "mensalista").reduce((a, j) => { const p = j.pagamentos.find(p => p.mes === mesFiltro && p.pago); return a + (p ? p.valor : 0); }, 0) }, { label: "Avulsos", color: "#00d97e", valor: jogadores.filter(j => j.tipo === "avulso").reduce((a, j) => { const p = j.pagamentos.find(p => p.mes === mesFiltro && p.pago); return a + (p ? p.valor : 0); }, 0) }].map(item => (
                  <div key={item.label} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, color: "#94a3b8" }}>{item.label}</span>
                      <span style={{ fontWeight: 700, color: item.color }}>R$ {item.valor.toFixed(2)}</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${receitaMes ? (item.valor / receitaMes) * 100 : 0}%`, background: item.color }} /></div>
                  </div>
                ))}
              </div>
              <div className="card">
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 900, marginBottom: 14 }}>DESPESAS POR CATEGORIA</h3>
                {["Infraestrutura", "Equipamentos", "Administrativo", "Outros"].map(cat => {
                  const val = despesas.filter(d => d.categoria === cat && d.data.startsWith(mesFiltro)).reduce((a, d) => a + d.valor, 0);
                  if (!val) return null;
                  return (
                    <div key={cat} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 14, color: "#94a3b8" }}>{cat}</span>
                        <span style={{ fontWeight: 700, color: "#ff4757" }}>R$ {val.toFixed(2)}</span>
                      </div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${despesasMes ? (val / despesasMes) * 100 : 0}%`, background: "#ff4757" }} /></div>
                    </div>
                  );
                })}
                {despesasMes === 0 && <p style={{ color: "#64748b", fontSize: 14 }}>Nenhuma despesa neste mês.</p>}
              </div>
            </div>
          </div>
        )}

        {/* JOGADORES */}
        {aba === "jogadores" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900 }}>JOGADORES</h2>
              {isAdmin && <button className="btn btn-green" onClick={() => { setJogadorEdit(null); setNovoJogador({ nome: "", email: "", telefone: "", tipo: "mensalista", status: "ativo" }); setModalJogador(true); }}>+ Novo Jogador</button>}
            </div>

            <div className="card">
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr 100px 120px" + (isAdmin ? " 180px" : ""), gap: 8, padding: "8px 16px", marginBottom: 8 }}>
                {["NOME", "EMAIL", "TELEFONE", "TIPO", "STATUS", ...(isAdmin ? ["PAGAMENTO / AÇÕES"] : [])].map(h => (
                  <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>{h}</span>
                ))}
              </div>

              {jogadores.map(j => {
                const pag = getPagamento(j);
                return (
                  <div key={j.id} className="table-row" style={{ gridTemplateColumns: "2fr 1.5fr 1.5fr 100px 120px" + (isAdmin ? " 180px" : ""), gap: 8, borderBottom: "1px solid #1a2540" }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15 }}>{j.nome}</p>
                    </div>
                    <p style={{ fontSize: 13, color: "#94a3b8" }}>{j.email || "—"}</p>
                    <p style={{ fontSize: 13, color: "#94a3b8" }}>{j.telefone || "—"}</p>
                    <span className={`tag ${j.tipo === "mensalista" ? "tag-blue" : "tag-yellow"}`}>{j.tipo === "mensalista" ? "Mensal" : "Avulso"}</span>
                    <span className={`tag ${j.status === "ativo" ? "tag-green" : "tag-red"}`}>{j.status}</span>
                    {isAdmin && (
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                        <button className={`btn ${pag?.pago ? "btn-gray" : "btn-green"}`} style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => togglePagamento(j.id)}>
                          {pag?.pago ? "✅ Pago" : "Marcar Pago"}
                        </button>
                        <button className="btn btn-blue" onClick={() => editarJogador(j)}>✏️</button>
                        <button className="btn btn-red" onClick={() => removerJogador(j.id)}>🗑</button>
                      </div>
                    )}
                    {!isAdmin && pag && (
                      <span className={`tag ${pag.pago ? "tag-green" : "tag-red"}`}>{pag.pago ? "Pago" : "Pendente"}</span>
                    )}
                  </div>
                );
              })}

              {jogadores.length === 0 && <p style={{ color: "#64748b", padding: 20, textAlign: "center" }}>Nenhum jogador cadastrado.</p>}
            </div>
          </div>
        )}

        {/* FINANCEIRO */}
        {aba === "financeiro" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900 }}>FINANCEIRO</h2>
              {isAdmin && <button className="btn btn-red" onClick={() => setModalDespesa(true)}>+ Nova Despesa</button>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Receitas */}
              <div className="card">
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 900, marginBottom: 16, color: "#00d97e" }}>💚 RECEITAS — {mesFiltro}</h3>
                {jogadores.filter(j => { const p = j.pagamentos.find(p => p.mes === mesFiltro && p.pago); return !!p; }).map(j => {
                  const pag = j.pagamentos.find(p => p.mes === mesFiltro && p.pago);
                  return (
                    <div key={j.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1a2540" }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600 }}>{j.nome}</p>
                        <span className={`tag ${j.tipo === "mensalista" ? "tag-blue" : "tag-yellow"}`} style={{ fontSize: 11 }}>{j.tipo}</span>
                      </div>
                      <p style={{ fontWeight: 700, color: "#00d97e" }}>+ R$ {pag.valor.toFixed(2)}</p>
                    </div>
                  );
                })}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0", marginTop: 8 }}>
                  <span style={{ fontWeight: 700 }}>TOTAL</span>
                  <span style={{ fontWeight: 900, fontSize: 18, color: "#00d97e" }}>R$ {receitaMes.toFixed(2)}</span>
                </div>
              </div>

              {/* Despesas */}
              <div className="card">
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 900, marginBottom: 16, color: "#ff4757" }}>🔴 DESPESAS — {mesFiltro}</h3>
                {despesas.filter(d => d.data.startsWith(mesFiltro)).map(d => (
                  <div key={d.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1a2540" }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>{d.descricao}</p>
                      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                        <span className="tag tag-red" style={{ fontSize: 11 }}>{d.categoria}</span>
                        <span style={{ fontSize: 11, color: "#64748b" }}>{d.data}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <p style={{ fontWeight: 700, color: "#ff4757" }}>- R$ {d.valor.toFixed(2)}</p>
                      {isAdmin && <button className="btn btn-red" style={{ fontSize: 11, padding: "4px 8px" }} onClick={() => setDespesas(despesas.filter(x => x.id !== d.id))}>🗑</button>}
                    </div>
                  </div>
                ))}
                {despesas.filter(d => d.data.startsWith(mesFiltro)).length === 0 && <p style={{ color: "#64748b", fontSize: 14 }}>Nenhuma despesa registrada.</p>}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0", marginTop: 8 }}>
                  <span style={{ fontWeight: 700 }}>TOTAL</span>
                  <span style={{ fontWeight: 900, fontSize: 18, color: "#ff4757" }}>R$ {despesasMes.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Balanço final */}
            <div style={{ marginTop: 20, padding: "24px 28px", borderRadius: 16, background: saldo >= 0 ? "linear-gradient(135deg, rgba(0,217,126,0.1), rgba(0,217,126,0.05))" : "linear-gradient(135deg, rgba(255,71,87,0.1), rgba(255,71,87,0.05))", border: `1px solid ${saldo >= 0 ? "rgba(0,217,126,0.3)" : "rgba(255,71,87,0.3)"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900 }}>BALANÇO DO MÊS</p>
                <p style={{ color: "#64748b", fontSize: 14 }}>Receita R$ {receitaMes.toFixed(2)} − Despesas R$ {despesasMes.toFixed(2)}</p>
              </div>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 42, fontWeight: 900, color: saldo >= 0 ? "#00d97e" : "#ff4757" }}>
                {saldo >= 0 ? "+" : ""}R$ {saldo.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}