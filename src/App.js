/* eslint-disable no-restricted-globals */
import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAPtdoXi5q5xf6KG0ltApdr6kHHbk4jJRQ",
  authDomain: "veteranosfc-fd317.firebaseapp.com",
  projectId: "veteranosfc-fd317",
  storageBucket: "veteranosfc-fd317.firebasestorage.app",
  messagingSenderId: "729812514430",
  appId: "1:729812514430:web:7e4702516891cbeb4a4a2f",
  measurementId: "G-7CCRKBG35N"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);


class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: false }; }
  componentDidCatch(error, info) { console.error("App error:", error, info); }
  render() { return this.props.children; }
}

function maskTelefone(v) {
  v = v.replace(/\D/g, "").slice(0, 11);
  if (v.length <= 2) return v.length ? `(${v}` : "";
  if (v.length <= 6) return `(${v.slice(0,2)}) ${v.slice(2)}`;
  if (v.length <= 10) return `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`;
  return `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
}
function maskDinheiro(v) {
  v = v.replace(/\D/g, "");
  if (!v) return "";
  return (parseInt(v, 10) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function parseDinheiro(v) { return parseFloat(String(v).replace(/\./g, "").replace(",", ".")) || 0; }
function nomeMes(mesStr) {
  const [ano, mes] = mesStr.split("-");
  const nomes = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  return `${nomes[parseInt(mes)-1]} ${ano}`;
}

export default function App() {
  const [grupoId, setGrupoId] = useState("");
  const [grupoIdInput, setGrupoIdInput] = useState("");
  const [senhaInput, setSenhaInput] = useState("");
  const [tipoAcesso, setTipoAcesso] = useState("visitante");
  const [erroLoginGrupo, setErroLoginGrupo] = useState("");
  const [telaLanding, setTelaLanding] = useState(true);
  const [telaLogin, setTelaLogin] = useState(false);
  const [telaCadastro, setTelaCadastro] = useState(false);
  const [telaGruposMaster, setTelaGruposMaster] = useState(false);
  const [gruposLista, setGruposLista] = useState([]);
  const [carregandoGrupos, setCarregandoGrupos] = useState(false);
  const [cadastroForm, setCadastroForm] = useState({ nomeGrupo: "", responsavel: "", telefone: "", email: "", codigo: "" });
  const [erroCadastro, setErroCadastro] = useState("");
  const [okCadastro, setOkCadastro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMaster, setIsMaster] = useState(false);
  const [senha, setSenha] = useState("");

  // Dados do Firebase
  const [senhaAdmin, setSenhaAdmin] = useState("admin123");
  const [nomeGrupo, setNomeGrupoState] = useState("VETERANOS FC");
  const [configValores, setConfigValoresState] = useState({ mensalista: "80,00", avulso: "30,00" });
  const [metaMensal, setMetaMensalState] = useState("");
  const [jogadores, setJogadoresState] = useState([]);
  const [despesas, setDespesasState] = useState([]);
  const [presencas, setPresencasState] = useState({});
  const [avisos, setAvisosState] = useState([]);

  // Modais
  const [modalNome, setModalNome] = useState(false);
  const [nomeEdit, setNomeEdit] = useState("");
  const [modalConfig, setModalConfig] = useState(false);
  const [configEdit, setConfigEdit] = useState({ mensalista: "80,00", avulso: "30,00" });
  const [modalSenha, setModalSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [senhaConfirm, setSenhaConfirm] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [okSenha, setOkSenha] = useState("");
  const [modalMeta, setModalMeta] = useState(false);
  const [metaEdit, setMetaEdit] = useState("");
  const [modalJogador, setModalJogador] = useState(false);
  const [modalDespesa, setModalDespesa] = useState(false);
  const [modalHistorico, setModalHistorico] = useState(null);
  const [modalWhatsapp, setModalWhatsapp] = useState(false);
  const [modalAviso, setModalAviso] = useState(false);
  const [avisoTexto, setAvisoTexto] = useState("");
  const [avisoUrgente, setAvisoUrgente] = useState(false);
  const [jogadorEdit, setJogadorEdit] = useState(null);
  const [novoJogador, setNovoJogador] = useState({ nome: "", email: "", telefone: "", nascimento: "", tipo: "mensalista", status: "ativo" });
  const [diaAniv, setDiaAniv] = useState("");
  const [mesAniv, setMesAniv] = useState("");
  const [anoAniv, setAnoAniv] = useState("");
  const [novaDespesa, setNovaDespesa] = useState({ descricao: "", valor: "", data: "", categoria: "Infraestrutura" });
  const [aba, setAba] = useState("dashboard");
  const [mesFiltro, setMesFiltro] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  });
  const [dataPresenca, setDataPresenca] = useState(() => new Date().toISOString().split("T")[0]);
  const [salvando, setSalvando] = useState(false);
  const [plano, setPlanoState] = useState("degustacao");
  const [dataExpiracao, setDataExpiracaoState] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showSenhaLogin, setShowSenhaLogin] = useState(false);
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showSenhaNova, setShowSenhaNova] = useState(false);
  const [showSenhaConfirm, setShowSenhaConfirm] = useState(false);

  // Carregar dados do Firebase em tempo real quando grupoId mudar
  useEffect(() => {
    if (!grupoId) return;
    setCarregando(true);
    const unsub = onSnapshot(doc(db, "grupos", grupoId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        // Grupos sem status são considerados ativos (grupos antigos)
        const status = data.status || "ativo";
        // Bloquear grupos não aprovados (exceto master)
        if (status === "pendente" && !isMaster) {
          setCarregando(false);
          setGrupoId("");
          setTelaLogin(true);
          setErroLoginGrupo("⏳ Seu cadastro está aguardando aprovação. Aguarde o contato do administrador.");
          return;
        }
        if (status === "bloqueado" && !isMaster) {
          setCarregando(false);
          setGrupoId("");
          setTelaLogin(true);
          setErroLoginGrupo("🚫 Este grupo está bloqueado. Entre em contato com o administrador.");
          return;
        }
        if (data.senhaAdmin) setSenhaAdmin(data.senhaAdmin);
        if (data.nomeGrupo) setNomeGrupoState(data.nomeGrupo);
        if (data.configValores) setConfigValoresState(data.configValores);
        if (data.metaMensal !== undefined) setMetaMensalState(data.metaMensal);
        if (data.jogadores) setJogadoresState(data.jogadores);
        if (data.despesas) setDespesasState(data.despesas);
        if (data.presencas) setPresencasState(data.presencas);
        if (data.avisos) setAvisosState(data.avisos || []);
        setPlanoState(data.plano || "degustacao");
        setDataExpiracaoState(data.dataExpiracao || null);
        setLimiteJogadoresCustom(data.limiteJogadores || 10);
      } else {
        // Grupo não existe — bloquear entrada direta
        setCarregando(false);
        setGrupoId("");
        setTelaLogin(true);
        setErroLoginGrupo("❌ Grupo não encontrado. Solicite o cadastro primeiro.");
        return;
      }
      setCarregando(false);
    });
    return () => unsub();
  // eslint-disable-next-line
  }, [grupoId, isMaster]);
  // Bloquear navegação do browser entre telas internas
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePop = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  // PWA install prompt
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); setShowInstall(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const instalarApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowInstall(false);
    setDeferredPrompt(null);
  };

  // Salvar no Firebase
  const salvarFirebase = async (campo, valor) => {
    setSalvando(true);
    try {
      await setDoc(doc(db, "grupos", grupoId), { [campo]: valor }, { merge: true });
    } catch (e) { console.error(e); }
    setSalvando(false);
  };

  const setNomeGrupo = (v) => { setNomeGrupoState(v); salvarFirebase("nomeGrupo", v); };
  const setConfigValores = (v) => { setConfigValoresState(v); salvarFirebase("configValores", v); };
  const setMetaMensal = (v) => { setMetaMensalState(v); salvarFirebase("metaMensal", v); };
  const setJogadores = (val) => {
    const next = typeof val === "function" ? val(jogadores) : val;
    setJogadoresState(next); salvarFirebase("jogadores", next);
  };
  const setDespesas = (val) => {
    const next = typeof val === "function" ? val(despesas) : val;
    setDespesasState(next); salvarFirebase("despesas", next);
  };
  const setAvisos = (val) => {
    const next = typeof val === "function" ? val(avisos) : val;
    setAvisosState(next); salvarFirebase("avisos", next);
  };

  const setPresencas = (val) => {
    const next = typeof val === "function" ? val(presencas) : val;
    const safe = next && typeof next === "object" ? next : {};
    setPresencasState(safe); salvarFirebase("presencas", safe);
  };

  const valorMensalista = parseDinheiro(configValores.mensalista);
  const valorAvulso = parseDinheiro(configValores.avulso);

  const isFull = plano === "full" || isMaster;
  const diasRestantes = dataExpiracao ? Math.max(0, Math.ceil((new Date(dataExpiracao) - new Date()) / (1000 * 60 * 60 * 24))) : null;
  const expirado = dataExpiracao ? new Date() > new Date(dataExpiracao) : false;
  const [limiteJogadoresCustom, setLimiteJogadoresCustom] = useState(10);
  // Will be updated from Firebase
  const limiteJogadores = isFull ? Infinity : limiteJogadoresCustom;

  const SENHA_MASTER = "SantluzMaster@2025";

  const carregarGrupos = async () => {
    setCarregandoGrupos(true);
    try {
      const { collection, getDocs } = await import("firebase/firestore");
      const snap = await getDocs(collection(db, "grupos"));
      const lista = [];
      snap.forEach(d => lista.push({ id: d.id, ...d.data() }));
      lista.sort((a, b) => (a.nomeGrupo || a.id).localeCompare(b.nomeGrupo || b.id));
      setGruposLista(lista);
    } catch(e) { console.error(e); }
    setCarregandoGrupos(false);
  };

  const entrarNoGrupo = () => {
    const id = grupoIdInput.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
    if (!id) { setErroLoginGrupo("Digite o código do grupo."); return; }
    if (tipoAcesso === "admin" && !senhaInput) { setErroLoginGrupo("Digite a senha."); return; }
    // Verificar senha master — mostrar lista de grupos
    if (tipoAcesso === "admin" && senhaInput === SENHA_MASTER) {
      setIsMaster(true);
      setIsAdmin(true);
      setSenha(senhaInput);
      setTelaLogin(false);
      setTelaGruposMaster(true);
      carregarGrupos();
      return;
    }
    setIsMaster(false);
    setGrupoId(id);
    setIsAdmin(tipoAcesso === "admin");
    setTelaLogin(false);
    setSenha(senhaInput);
  };

  const entrarGrupoMaster = (id) => {
    setGrupoId(id);
    setTelaGruposMaster(false);
  };

  const validarSenhaAdmin = () => {
    if (isAdmin && !isMaster && senhaAdmin && senha !== senhaAdmin) {
      setIsAdmin(false);
      setTelaLogin(true);
      setGrupoId("");
      setErroLoginGrupo("Senha incorreta. Tente novamente.");
    }
  };

  useEffect(() => {
    if (grupoId && !carregando && isAdmin && senhaAdmin) {
      validarSenhaAdmin();
    }
  // eslint-disable-next-line
  }, [carregando, senhaAdmin, isMaster]);



  const solicitarCadastro = async () => {
    const { nomeGrupo: ng, responsavel, telefone, email, codigo } = cadastroForm;
    if (!ng || !responsavel || !telefone || !email || !codigo) { setErroCadastro("Preencha todos os campos."); return; }
    if (!email.includes("@")) { setErroCadastro("Digite um email válido."); return; }
    const id = codigo.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
    if (!id) { setErroCadastro("Código inválido. Use letras, números e underline."); return; }
    try {
      const snap = await new Promise(resolve => {
        const unsub = onSnapshot(doc(db, "grupos", id), s => { unsub(); resolve(s); });
      });
      if (snap.exists()) { setErroCadastro("Este código já está em uso. Escolha outro."); return; }
      await setDoc(doc(db, "grupos", id), {
        nomeGrupo: ng.toUpperCase(),
        responsavel,
        telefone: maskTelefone(telefone),
        emailResponsavel: email,
        senhaAdmin: "admin123",
        status: "pendente",
        dataCadastro: new Date().toISOString(),
        configValores: { mensalista: "80,00", avulso: "30,00" },
        metaMensal: "",
        jogadores: [],
        despesas: [],
        presencas: {}
      });
      // Enviar email via EmailJS
      try {
        await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: "service_veteranos",
            template_id: "template_cadastro",
            user_id: "qmhFlMvfDr9Xfy_Hz",
            template_params: {
              to_email: "esantluz@gmail.com",
              grupo_nome: ng,
              grupo_codigo: id,
              responsavel: responsavel,
              telefone: maskTelefone(telefone),
              email_solicitante: email,
              data: new Date().toLocaleDateString("pt-BR")
            }
          })
        });
      } catch(emailErr) { console.log("Email não enviado:", emailErr); }
      setOkCadastro("✅ Cadastro enviado com sucesso! Aguarde a aprovação do administrador.");
      setErroCadastro("");
      setCadastroForm({ nomeGrupo: "", responsavel: "", telefone: "", email: "", codigo: "" });
    } catch(e) { setErroCadastro("Erro ao enviar cadastro. Tente novamente."); }
  };

  const trocarSenha = () => {
    if (senhaAtual !== senhaAdmin) { setErroSenha("Senha atual incorreta."); setOkSenha(""); return; }
    if (senhaNova.length < 4) { setErroSenha("Mínimo 4 caracteres."); setOkSenha(""); return; }
    if (senhaNova !== senhaConfirm) { setErroSenha("As senhas não coincidem."); setOkSenha(""); return; }
    setSenhaAdmin(senhaNova); salvarFirebase("senhaAdmin", senhaNova);
    setErroSenha(""); setOkSenha("✅ Senha alterada com sucesso!");
    setSenhaAtual(""); setSenhaNova(""); setSenhaConfirm("");
  };

  const receitaMes = jogadores.reduce((acc, j) => acc + j.pagamentos.filter(p => p.mes === mesFiltro && p.pago).reduce((a, p) => a + p.valor, 0), 0);
  const despesasMes = despesas.reduce((acc, d) => d.data.startsWith(mesFiltro) ? acc + parseFloat(d.valor) : acc, 0);
  const saldo = receitaMes - despesasMes;
  const totalMensalistas = jogadores.filter(j => j.tipo === "mensalista" && j.status === "ativo").length;
  const totalAvulsos = jogadores.filter(j => j.tipo === "avulso" && j.status === "ativo").length;
  const inadimplentes = jogadores.filter(j => { if (j.tipo !== "mensalista") return false; const p = j.pagamentos.find(p => p.mes === mesFiltro); return !p || !p.pago; });
  const mesAtual = parseInt(mesFiltro.split("-")[1]);
  const aniversariantes = jogadores.filter(j => j.nascimento && parseInt(j.nascimento.split("-")[1]) === mesAtual);
  const metaValor = parseDinheiro(metaMensal);
  const metaPct = metaValor > 0 ? Math.min((receitaMes / metaValor) * 100, 100) : 0;

  const salvarJogador = () => {
    if (!jogadorEdit && !isFull && jogadores.filter(j => j.status === "ativo").length >= limiteJogadores) {
      setShowUpgrade(true); return;
    }
    if (!novoJogador.nome) return;
    const nascFormatado = (anoAniv && mesAniv && diaAniv) ? `${anoAniv}-${mesAniv.padStart(2,"0")}-${diaAniv.padStart(2,"0")}` : "";
    const jogadorFinal = { ...novoJogador, nascimento: nascFormatado };
    if (jogadorEdit !== null) {
      setJogadores(jogadores.map(j => j.id === jogadorEdit ? { ...j, ...jogadorFinal } : j));
    } else {
      setJogadores([...jogadores, { ...jogadorFinal, id: Date.now(), pagamentos: [] }]);
    }
    setModalJogador(false);
    setNovoJogador({ nome: "", email: "", telefone: "", nascimento: "", tipo: "mensalista", status: "ativo" });
    setDiaAniv(""); setMesAniv(""); setAnoAniv("");
    setJogadorEdit(null);
  };

  const salvarDespesa = () => {
    if (!novaDespesa.descricao || !novaDespesa.valor) return;
    setDespesas([...despesas, { ...novaDespesa, id: Date.now(), valor: parseDinheiro(novaDespesa.valor) }]);
    setModalDespesa(false);
    setNovaDespesa({ descricao: "", valor: "", data: "", categoria: "Infraestrutura" });
  };

  const editarJogador = (j) => {
    setNovoJogador({ nome: j.nome, email: j.email, telefone: j.telefone, nascimento: j.nascimento||"", tipo: j.tipo, status: j.status });
    if (j.nascimento) {
      const parts = j.nascimento.split("-");
      setAnoAniv(parts[0]); setMesAniv(parts[1]); setDiaAniv(parts[2]);
    } else { setAnoAniv(""); setMesAniv(""); setDiaAniv(""); }
    setJogadorEdit(j.id); setModalJogador(true);
  };

  const removerJogador = (id) => { if (confirm("Remover jogador?")) setJogadores(jogadores.filter(j => j.id !== id)); };

  const togglePagamento = (jogadorId) => {
    setJogadores(jogadores.map(j => {
      if (j.id !== jogadorId) return j;
      const pags = [...j.pagamentos];
      const idx = pags.findIndex(p => p.mes === mesFiltro);
      if (idx >= 0) { pags[idx] = { ...pags[idx], pago: !pags[idx].pago }; }
      else { pags.push({ mes: mesFiltro, valor: j.tipo === "mensalista" ? valorMensalista : valorAvulso, pago: true }); }
      return { ...j, pagamentos: pags };
    }));
  };

  const getPagamento = (j) => j.pagamentos.find(p => p.mes === mesFiltro);

  const togglePresenca = (jogadorId) => {
    const presencasAtual = presencas && typeof presencas === "object" ? { ...presencas } : {};
    const lista = Array.isArray(presencasAtual[dataPresenca]) ? [...presencasAtual[dataPresenca]] : [];
    const nova = lista.includes(jogadorId) ? lista.filter(id => id !== jogadorId) : [...lista, jogadorId];
    setPresencas({ ...presencasAtual, [dataPresenca]: nova });
  };
  const presencasData = (presencas && Array.isArray(presencas[dataPresenca])) ? presencas[dataPresenca] : [];

  const gerarTextoAviso = () => {
    const emoji = avisoUrgente ? "🚨" : "📢";
    const urgencia = avisoUrgente ? "*URGENTE* " : "";
    return `${emoji} *${nomeGrupo}* — ${urgencia}Comunicado

${avisoTexto}

_Enviado pela gestão do grupo_ ⚽`;
  };

  const publicarAviso = () => {
    if (!avisoTexto.trim()) return;
    const novo = {
      id: Date.now(),
      texto: avisoTexto,
      urgente: avisoUrgente,
      data: new Date().toISOString(),
      lidos: []
    };
    const novosAvisos = [novo, ...(avisos || [])];
    setModalAviso(false);
    setAvisoTexto("");
    setAvisoUrgente(false);
    setTimeout(() => setAvisos(novosAvisos), 100);
  };

  const gerarTextoWhatsapp = () => {
    if (inadimplentes.length === 0) return `✅ *${nomeGrupo}* - ${nomeMes(mesFiltro)}\n\nTodos os mensalistas estão em dia! 👏`;
    const lista = inadimplentes.map(j => `• ${j.nome}${j.telefone ? ` (${j.telefone})` : ""}`).join("\n");
    return `⚠️ *${nomeGrupo}* - ${nomeMes(mesFiltro)}\n\nPessoal, os jogadores abaixo ainda não pagaram a mensalidade de R$ ${configValores.mensalista}:\n\n${lista}\n\nPor favor, regularizem o pagamento. Obrigado! ⚽`;
  };

  const gerarPDF = () => {
    const jogosDoMes = Object.keys(presencas || {}).filter(d => d.startsWith(mesFiltro)).sort();
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; padding: 32px; color: #1a1a2e; font-size: 13px; }
  .header { text-align: center; border-bottom: 3px solid #1d4ed8; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { font-size: 26px; color: #1d4ed8; font-weight: 900; letter-spacing: 1px; }
  .header p { color: #64748b; font-size: 13px; margin-top: 4px; }
  .secao { margin-bottom: 24px; }
  .secao h2 { font-size: 15px; font-weight: 700; padding: 8px 12px; border-radius: 6px; margin-bottom: 10px; }
  .secao-verde h2 { background: #dcfce7; color: #166534; }
  .secao-vermelha h2 { background: #fee2e2; color: #991b1b; }
  .secao-azul h2 { background: #dbeafe; color: #1e40af; }
  .secao-amarela h2 { background: #fef9c3; color: #854d0e; }
  .secao-cinza h2 { background: #f1f5f9; color: #334155; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-weight: 700; border-bottom: 2px solid #e2e8f0; }
  td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; }
  tr:last-child td { border-bottom: none; }
  .valor-verde { color: #16a34a; font-weight: 700; }
  .valor-vermelho { color: #dc2626; font-weight: 700; }
  .resumo { display: flex; gap: 16px; margin-bottom: 24px; }
  .resumo-card { flex: 1; border-radius: 8px; padding: 14px 16px; }
  .resumo-card p { font-size: 11px; font-weight: 700; margin-bottom: 4px; }
  .resumo-card span { font-size: 22px; font-weight: 900; }
  .card-verde { background: #dcfce7; }
  .card-verde p { color: #166534; }
  .card-verde span { color: #16a34a; }
  .card-vermelho { background: #fee2e2; }
  .card-vermelho p { color: #991b1b; }
  .card-vermelho span { color: #dc2626; }
  .card-azul { background: #dbeafe; }
  .card-azul p { color: #1e40af; }
  .card-azul span { color: #1d4ed8; }
  .tag { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; }
  .tag-verde { background: #dcfce7; color: #166534; }
  .tag-vermelho { background: #fee2e2; color: #dc2626; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; }
  .bar-bg { background: #e2e8f0; border-radius: 4px; height: 8px; margin-top: 4px; }
  .bar-fill { height: 8px; border-radius: 4px; }
</style>
</head>
<body>
<div class="header">
  <h1>⚽ ${nomeGrupo}</h1>
  <p>Relatório Mensal — ${nomeMes(mesFiltro)}</p>
  <p style="font-size:11px;margin-top:2px;">Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", {hour:"2-digit",minute:"2-digit"})}</p>
</div>

<div class="resumo">
  <div class="resumo-card card-verde">
    <p>RECEITA DO MÊS</p>
    <span>R$ ${receitaMes.toFixed(2)}</span>
  </div>
  <div class="resumo-card card-vermelho">
    <p>DESPESAS DO MÊS</p>
    <span>R$ ${despesasMes.toFixed(2)}</span>
  </div>
  <div class="resumo-card card-azul">
    <p>SALDO</p>
    <span style="color:${saldo>=0?"#1d4ed8":"#dc2626"}">R$ ${saldo.toFixed(2)}</span>
  </div>
</div>

<div class="secao secao-verde">
  <h2>💚 RECEITAS (${jogadores.filter(j=>{const p=j.pagamentos.find(p=>p.mes===mesFiltro&&p.pago);return!!p;}).length} pagamentos)</h2>
  <table>
    <tr><th>Jogador</th><th>Tipo</th><th>Valor</th></tr>
    ${jogadores.filter(j=>{const p=j.pagamentos.find(p=>p.mes===mesFiltro&&p.pago);return!!p;}).map(j=>{
      const pag=j.pagamentos.find(p=>p.mes===mesFiltro&&p.pago);
      return `<tr><td>${j.nome}</td><td>${j.tipo==="mensalista"?"Mensalista":"Avulso"}</td><td class="valor-verde">R$ ${pag.valor.toFixed(2)}</td></tr>`;
    }).join("")}
    <tr style="background:#f8fafc;font-weight:700"><td colspan="2">TOTAL</td><td class="valor-verde">R$ ${receitaMes.toFixed(2)}</td></tr>
  </table>
</div>

<div class="secao secao-vermelha">
  <h2>🔴 DESPESAS (${despesas.filter(d=>d.data.startsWith(mesFiltro)).length} lançamentos)</h2>
  <table>
    <tr><th>Descrição</th><th>Categoria</th><th>Data</th><th>Valor</th></tr>
    ${despesas.filter(d=>d.data.startsWith(mesFiltro)).map(d=>`
      <tr><td>${d.descricao}</td><td>${d.categoria}</td><td>${d.data.split("-").reverse().join("/")}</td><td class="valor-vermelho">R$ ${d.valor.toFixed(2)}</td></tr>
    `).join("")}
    <tr style="background:#f8fafc;font-weight:700"><td colspan="3">TOTAL</td><td class="valor-vermelho">R$ ${despesasMes.toFixed(2)}</td></tr>
  </table>
</div>

${inadimplentes.length > 0 ? `
<div class="secao secao-amarela">
  <h2>⚠️ INADIMPLENTES (${inadimplentes.length})</h2>
  <table>
    <tr><th>Jogador</th><th>Telefone</th><th>Valor em Aberto</th></tr>
    ${inadimplentes.map(j=>`<tr><td>${j.nome}</td><td>${j.telefone||"—"}</td><td class="valor-vermelho">R$ ${valorMensalista.toFixed(2)}</td></tr>`).join("")}
  </table>
</div>` : `
<div class="secao secao-verde">
  <h2>✅ INADIMPLENTES</h2>
  <p style="padding:8px 12px;color:#16a34a;font-weight:700">Todos os mensalistas estão em dia! 👏</p>
</div>`}

${jogosDoMes.length > 0 ? `
<div class="secao secao-azul">
  <h2>📅 FREQUÊNCIA (${jogosDoMes.length} jogos)</h2>
  <table>
    <tr><th>Jogador</th><th>Presenças</th><th>%</th><th>Frequência</th></tr>
    ${jogadores.filter(j=>j.status==="ativo").sort((a,b)=>{
      const fa=jogosDoMes.filter(d=>((presencas||{})[d]||[]).includes(a.id)).length;
      const fb=jogosDoMes.filter(d=>((presencas||{})[d]||[]).includes(b.id)).length;
      return fb-fa;
    }).map(j=>{
      const presentes=jogosDoMes.filter(d=>((presencas||{})[d]||[]).includes(j.id)).length;
      const pct=jogosDoMes.length?(presentes/jogosDoMes.length)*100:0;
      const cor=pct>=75?"#16a34a":pct>=50?"#d97706":"#dc2626";
      return `<tr>
        <td>${j.nome}</td>
        <td>${presentes}/${jogosDoMes.length}</td>
        <td style="color:${cor};font-weight:700">${pct.toFixed(0)}%</td>
        <td><div class="bar-bg"><div class="bar-fill" style="width:${pct}%;background:${cor}"></div></div></td>
      </tr>`;
    }).join("")}
  </table>
</div>` : ""}

<div class="secao secao-cinza">
  <h2>👥 JOGADORES ATIVOS (${jogadores.filter(j=>j.status==="ativo").length})</h2>
  <table>
    <tr><th>Nome</th><th>Tipo</th><th>Status Pagamento</th></tr>
    ${jogadores.filter(j=>j.status==="ativo").map(j=>{
      const pag=j.pagamentos.find(p=>p.mes===mesFiltro);
      const pago=pag&&pag.pago;
      return `<tr><td>${j.nome}</td><td>${j.tipo==="mensalista"?"Mensalista":"Avulso"}</td><td><span class="tag ${pago?"tag-verde":"tag-vermelho"}">${pago?"✅ Pago":"⚠️ Pendente"}</span></td></tr>`;
    }).join("")}
  </table>
</div>

<div class="footer">
  <p>⚽ ${nomeGrupo} · Sistema de Gestão · ${nomeMes(mesFiltro)}</p>
</div>
</body>
</html>`;

    const janela = window.open("", "_blank");
    janela.document.write(html);
    janela.document.close();
    janela.focus();
    setTimeout(() => janela.print(), 500);
  };

  const css = `
    html, body { overscroll-behavior-y: none; }
    @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;600;700;900&family=Barlow+Condensed:wght@700;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0a0f1e; } ::-webkit-scrollbar-thumb { background: #2a3a5c; border-radius: 3px; }
    .btn { cursor: pointer; border: none; border-radius: 8px; font-family: 'Barlow', sans-serif; font-weight: 700; transition: all 0.2s; }
    .btn:hover { transform: translateY(-1px); }
    .btn-green { background: linear-gradient(135deg, #00d97e, #00b865); color: #fff; padding: 10px 20px; }
    .btn-red { background: linear-gradient(135deg, #ff4757, #cc2030); color: #fff; padding: 8px 14px; font-size: 13px; }
    .btn-blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #fff; padding: 8px 14px; font-size: 13px; }
    .btn-gray { background: #1e2a45; color: #94a3b8; padding: 8px 14px; font-size: 13px; }
    .btn-orange { background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; padding: 8px 14px; font-size: 13px; }
    .card { background: linear-gradient(135deg, #111827, #1a2540); border: 1px solid #1e2e50; border-radius: 16px; padding: 24px; }
    .input { background: #0d1525; border: 1px solid #1e2e50; border-radius: 8px; color: #e8ecf3; padding: 10px 14px; font-family: 'Barlow', sans-serif; font-size: 14px; width: 100%; outline: none; }
    .input:focus { border-color: #3b82f6; }
    select.input option { background: #0d1525; }
    .tag { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .tag-green { background: rgba(0,217,126,0.15); color: #00d97e; }
    .tag-yellow { background: rgba(255,186,0,0.15); color: #ffba00; }
    .tag-red { background: rgba(255,71,87,0.15); color: #ff4757; }
    .tag-blue { background: rgba(59,130,246,0.15); color: #3b82f6; }
    .tag-purple { background: rgba(168,85,247,0.15); color: #a855f7; }
    .overlay { position: fixed; inset: 0; background: rgba(0,0,10,0.85); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); overflow-y: auto; padding: 20px; }
    .modal { background: #111827; border: 1px solid #1e2e50; border-radius: 20px; padding: 32px; width: 90%; max-width: 480px; }
    .nav-tab { padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 14px; transition: all 0.2s; border: none; font-family: 'Barlow', sans-serif; }
    .nav-tab.active { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #fff; }
    .nav-tab:not(.active) { background: transparent; color: #64748b; }
    .nav-tab:not(.active):hover { color: #94a3b8; background: #1a2540; }
    .table-row { display: grid; align-items: center; padding: 14px 16px; border-radius: 10px; transition: background 0.15s; }
    .table-row:hover { background: #1a2540; }
    .stat-card { background: linear-gradient(135deg, #111827, #1a2540); border-radius: 16px; padding: 22px; border-left: 4px solid; }
    .progress-bar { height: 8px; background: #1e2e50; border-radius: 4px; overflow: hidden; margin-top: 8px; }
    .progress-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
    textarea.input { resize: vertical; min-height: 120px; }
  `;

  if (carregando) return (
    <ErrorBoundary>
      <div style={{ minHeight: "100vh", background: "#0a0f1e", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <style>{css}</style>
        <span style={{ fontSize: 48 }}>⚽</span>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 900, color: "#3b82f6" }}>Carregando...</p>
      </div>
    </ErrorBoundary>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "'Barlow', sans-serif", color: "#e8ecf3" }}>
      <style>{css}</style>

      {/* LANDING PAGE */}
      {telaLanding && (
        <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "'Barlow', sans-serif", color: "#e8ecf3", overflowX: "hidden" }}>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;600;700;900&family=Barlow+Condensed:wght@700;900&display=swap');
            .land-btn { cursor: pointer; border: none; border-radius: 10px; font-family: 'Barlow', sans-serif; font-weight: 700; transition: all 0.2s; }
            .land-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
            .feature-card { background: linear-gradient(135deg, #111827, #1a2540); border: 1px solid #1e2e50; border-radius: 20px; padding: 28px; transition: all 0.3s; }
            .feature-card:hover { border-color: #3b82f6; transform: translateY(-4px); }
            @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
            .float { animation: float 3s ease-in-out infinite; }
            @keyframes fadein { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
            .fadein { animation: fadein 0.8s ease forwards; }
          `}</style>

          {/* HEADER */}
          <header style={{ padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e2e50", background: "rgba(10,15,30,0.95)", position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(10px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 28 }}>⚽</span>
              <div>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 900, background: "linear-gradient(135deg, #3b82f6, #00d97e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>GESTÃO DE GRUPOS</p>
                <p style={{ fontSize: 10, color: "#64748b", fontWeight: 600, letterSpacing: 1 }}>VETERANOS FC</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="land-btn" style={{ padding: "10px 24px", background: "transparent", border: "2px solid #3b82f6", color: "#3b82f6", fontSize: 14 }} onClick={() => { setTelaLanding(false); setTelaLogin(true); }}>Entrar</button>
              <button className="land-btn" style={{ padding: "10px 24px", background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", color: "#fff", fontSize: 14 }} onClick={() => { setTelaLanding(false); setTelaCadastro(true); }}>Cadastrar Grupo</button>
            </div>
          </header>

          {/* HERO */}
          <section style={{ textAlign: "center", padding: "80px 24px 60px", maxWidth: 800, margin: "0 auto" }}>
            <div className="float" style={{ fontSize: 72, marginBottom: 24 }}>⚽</div>
            <h1 className="fadein" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(36px, 7vw, 72px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 20 }}>
              <span style={{ background: "linear-gradient(135deg, #3b82f6, #00d97e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>GESTÃO COMPLETA</span>
              <br />
              <span style={{ color: "#e8ecf3" }}>DO SEU GRUPO</span>
              <br />
              <span style={{ color: "#ffba00" }}>VETERANOS FC</span>
            </h1>
            <p style={{ fontSize: "clamp(15px, 2.5vw, 18px)", color: "#94a3b8", lineHeight: 1.7, marginBottom: 36, maxWidth: 560, margin: "0 auto 36px" }}>
              Controle financeiro, lista de presença, inadimplentes e muito mais — tudo no celular, para qualquer grupo de futebol veterano.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="land-btn" style={{ padding: "16px 40px", background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", color: "#fff", fontSize: 16 }} onClick={() => { setTelaLanding(false); setTelaLogin(false); setTelaCadastro(true); }}>
                🚀 Cadastrar Meu Grupo
              </button>
              <button className="land-btn" style={{ padding: "16px 40px", background: "transparent", border: "2px solid #1e2e50", color: "#94a3b8", fontSize: 16 }} onClick={() => { setTelaLanding(false); setTelaLogin(true); }}>
                👁 Ver Demonstração
              </button>
            </div>
            <p style={{ color: "#475569", fontSize: 13, marginTop: 16 }}>✅ Gratuito para começar · Sem cartão de crédito</p>
          </section>

          {/* FUNCIONA NO CELULAR */}
          <section style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(0,217,126,0.05))", border: "1px solid #1e2e50", margin: "0 24px 60px", borderRadius: 24, padding: "40px 32px", maxWidth: 900, marginLeft: "auto", marginRight: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
              <div style={{ fontSize: 80 }}>📱</div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 900, marginBottom: 12, color: "#3b82f6" }}>FUNCIONA NO CELULAR</h2>
                <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>Acesse de qualquer dispositivo — celular, tablet ou computador. Instale como app na tela inicial do seu celular e use sem internet.</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {["📱 Android", "🍎 iPhone", "💻 Computador", "📲 Instalar como App"].map(item => (
                    <span key={item} style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6", padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* MULTI-GRUPOS */}
          <section style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.08), rgba(0,217,126,0.05))", border: "1px solid #1e2e50", margin: "0 24px 60px", borderRadius: 24, padding: "40px 32px", maxWidth: 900, marginLeft: "auto", marginRight: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
              <div style={{ fontSize: 80 }}>👥</div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 900, marginBottom: 12, color: "#a855f7" }}>MULTI-GRUPOS</h2>
                <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>Um único sistema para vários grupos. Cada grupo tem seus próprios dados, jogadores, financeiro e senha — completamente isolados.</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {["🔒 Dados isolados", "🔑 Senha própria", "📊 Dashboard individual", "♾️ Grupos ilimitados"].map(item => (
                    <span key={item} style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7", padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* FEATURES GRID */}
          <section style={{ maxWidth: 960, margin: "0 auto 60px", padding: "0 24px" }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 900, textAlign: "center", marginBottom: 32 }}>TUDO QUE SEU GRUPO PRECISA</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
              {[
                { icon: "💰", title: "Controle Financeiro", desc: "Receitas, despesas e saldo mensal. Saiba exatamente quanto entrou e saiu.", color: "#00d97e" },
                { icon: "📅", title: "Lista de Presença", desc: "Registre quem jogou em cada partida e veja a frequência de cada jogador.", color: "#3b82f6" },
                { icon: "⚠️", title: "Inadimplentes", desc: "Veja quem está em débito e gere mensagem automática para o WhatsApp do grupo.", color: "#ffba00" },
                { icon: "🎂", title: "Aniversariantes", desc: "Nunca mais esqueça o aniversário dos jogadores. Alertas automáticos no mês.", color: "#a855f7" },
                { icon: "📄", title: "Relatório PDF", desc: "Exporte o relatório completo do mês em PDF com um clique.", color: "#ff4757" },
                { icon: "📢", title: "Comunicados", desc: "Envie avisos para todos os membros e gere mensagem pronta para o WhatsApp.", color: "#00d97e" },
              ].map(f => (
                <div key={f.title} className="feature-card">
                  <div style={{ fontSize: 40, marginBottom: 14 }}>{f.icon}</div>
                  <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 900, marginBottom: 8, color: f.color }}>{f.title}</h3>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA FINAL */}
          <section style={{ textAlign: "center", padding: "60px 24px 80px", background: "linear-gradient(135deg, rgba(59,130,246,0.06), rgba(0,217,126,0.04))", borderTop: "1px solid #1e2e50" }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, marginBottom: 16 }}>PRONTO PARA ORGANIZAR SEU GRUPO?</h2>
            <p style={{ color: "#94a3b8", fontSize: 16, marginBottom: 32 }}>Cadastre seu grupo agora e comece a usar em minutos.</p>
            <button className="land-btn" style={{ padding: "18px 48px", background: "linear-gradient(135deg, #00d97e, #00b865)", color: "#000", fontSize: 18, fontWeight: 900 }} onClick={() => { setTelaLanding(false); setTelaCadastro(true); }}>
              ⚽ CADASTRAR MEU GRUPO GRÁTIS
            </button>
            <p style={{ color: "#475569", fontSize: 13, marginTop: 16 }}>Já tem cadastro? <span style={{ color: "#3b82f6", cursor: "pointer", fontWeight: 700 }} onClick={() => { setTelaLanding(false); setTelaLogin(true); }}>Entrar no sistema →</span></p>
          </section>

          {/* FOOTER */}
          <footer style={{ textAlign: "center", padding: "24px", borderTop: "1px solid #1e2e50", color: "#475569", fontSize: 12 }}>
            <p>⚽ Gestão de Grupos Veteranos FC · Todos os direitos reservados</p>
          </footer>
        </div>
      )}

      {/* TELA MASTER — selecionar grupo */}
      {!telaLanding && telaGruposMaster && (
        <div className="overlay">
          <div className="modal" style={{ maxWidth: 560 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 900 }}>🔑 SELECIONAR GRUPO</h2>
                <p style={{ color: "#64748b", fontSize: 13 }}>Acesso Master — escolha o grupo</p>
              </div>
              <span className="tag tag-purple">MASTER</span>
            </div>
            {carregandoGrupos ? (
              <p style={{ color: "#64748b", textAlign: "center", padding: 20 }}>Carregando grupos...</p>
            ) : (
              <div style={{ maxHeight: 420, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {gruposLista.map(g => {
                  const statusColor = g.status === "pendente" ? "#ffba00" : g.status === "bloqueado" ? "#ff4757" : "#00d97e";
                  const statusLabel = g.status === "pendente" ? "⏳ Pendente" : g.status === "bloqueado" ? "🚫 Bloqueado" : "✅ Ativo";
                  return (
                    <div key={g.id} onClick={() => entrarGrupoMaster(g.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderRadius: 12, cursor: "pointer", background: "#0d1525", border: "1px solid #1e2e50", transition: "all 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "#3b82f6"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2e50"}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 15 }}>{g.nomeGrupo || g.id}</p>
                        <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                          <span style={{ fontSize: 12, color: "#64748b" }}>@{g.id}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: statusColor }}>· {statusLabel}</span>
                          <span style={{ fontSize: 11, color: "#475569" }}>· {g.jogadores?.length || 0} jogadores</span>
                        </div>
                        {g.responsavel && <p style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{g.responsavel} {g.telefone ? `· ${g.telefone}` : ""}</p>}
                      </div>
                      <span style={{ color: "#3b82f6", fontSize: 20 }}>›</span>
                    </div>
                  );
                })}
                {gruposLista.length === 0 && <p style={{ color: "#64748b", textAlign: "center", padding: 20 }}>Nenhum grupo encontrado.</p>}
              </div>
            )}
            <button className="btn btn-gray" style={{ width: "100%", marginTop: 16 }} onClick={() => { setTelaGruposMaster(false); setTelaLogin(true); setIsMaster(false); setIsAdmin(false); setSenhaInput(""); setGrupoIdInput(""); }}>← Voltar ao Login</button>
          </div>
        </div>
      )}

      {/* TELA INICIAL — escolha do grupo */}
      {!telaLanding && telaLogin && !telaCadastro && (
        <div className="overlay">
          <div className="modal" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>⚽</div>
            <button onClick={() => { setTelaLogin(false); setTelaLanding(true); }} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 6, fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>← Voltar</button>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 900, marginBottom: 4, background: "linear-gradient(135deg, #3b82f6, #00d97e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>GESTÃO DE GRUPOS</h1>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>Futebol Veterano</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6, fontWeight: 600, textAlign: "left" }}>CÓDIGO DO GRUPO</p>
                <input className="input" placeholder="Ex: veteranos_fc, masters_fc..." value={grupoIdInput} onChange={e => { setGrupoIdInput(e.target.value); setErroLoginGrupo(""); }} onKeyDown={e => e.key === "Enter" && entrarNoGrupo()} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setTipoAcesso("visitante")} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `2px solid ${tipoAcesso === "visitante" ? "#3b82f6" : "#1e2e50"}`, background: tipoAcesso === "visitante" ? "rgba(59,130,246,0.1)" : "#0d1525", color: tipoAcesso === "visitante" ? "#3b82f6" : "#64748b", cursor: "pointer", fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 13 }}>
                  👁 Visitante
                </button>
                <button onClick={() => setTipoAcesso("admin")} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `2px solid ${tipoAcesso === "admin" ? "#00d97e" : "#1e2e50"}`, background: tipoAcesso === "admin" ? "rgba(0,217,126,0.1)" : "#0d1525", color: tipoAcesso === "admin" ? "#00d97e" : "#64748b", cursor: "pointer", fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 13 }}>
                  👑 Admin
                </button>
              </div>
              {tipoAcesso === "admin" && (
                <div style={{ position: "relative" }}>
                  <input className="input" type={showSenhaLogin ? "text" : "password"} placeholder="Senha do administrador" value={senhaInput} onChange={e => { setSenhaInput(e.target.value); setErroLoginGrupo(""); }} onKeyDown={e => e.key === "Enter" && entrarNoGrupo()} style={{ paddingRight: 44 }} />
                  <button onClick={() => setShowSenhaLogin(!showSenhaLogin)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "#64748b", fontSize: 18 }}>{showSenhaLogin ? "🙈" : "👁"}</button>
                </div>
              )}
              {erroLoginGrupo && <p style={{ color: "#ff4757", fontSize: 13 }}>{erroLoginGrupo}</p>}
            </div>
            <button className="btn btn-blue" style={{ width: "100%", padding: "14px", marginBottom: 12 }} onClick={entrarNoGrupo}>Entrar</button>
            <div style={{ borderTop: "1px solid #1e2e50", paddingTop: 16, marginTop: 4 }}>
              <p style={{ color: "#64748b", fontSize: 12, marginBottom: 10 }}>Ainda não tem um grupo cadastrado?</p>
              <button className="btn btn-gray" style={{ width: "100%", padding: "12px" }} onClick={() => { setTelaLogin(false); setTelaCadastro(true); setOkCadastro(""); setErroCadastro(""); }}>📋 Solicitar Cadastro de Novo Grupo</button>
            </div>
          </div>
        </div>
      )}

      {/* TELA DE CADASTRO */}
      {!telaLanding && telaCadastro && (
        <div className="overlay">
          <div className="modal">
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 900, marginBottom: 4 }}>📋 SOLICITAR CADASTRO</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Preencha os dados do seu grupo. Após análise você receberá o acesso.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, fontWeight: 600 }}>NOME DO GRUPO</p>
                <input className="input" placeholder="Ex: Veteranos FC, Masters do Bairro..." value={cadastroForm.nomeGrupo} onChange={e => setCadastroForm({ ...cadastroForm, nomeGrupo: e.target.value })} />
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, fontWeight: 600 }}>NOME DO RESPONSÁVEL</p>
                <input className="input" placeholder="Seu nome completo" value={cadastroForm.responsavel} onChange={e => setCadastroForm({ ...cadastroForm, responsavel: e.target.value })} />
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, fontWeight: 600 }}>EMAIL</p>
                <input className="input" type="email" placeholder="seu@email.com" value={cadastroForm.email} onChange={e => setCadastroForm({ ...cadastroForm, email: e.target.value })} />
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, fontWeight: 600 }}>TELEFONE / WHATSAPP</p>
                <input className="input" placeholder="(21) 99999-9999" value={cadastroForm.telefone} onChange={e => setCadastroForm({ ...cadastroForm, telefone: maskTelefone(e.target.value) })} />
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, fontWeight: 600 }}>USUÁRIO DE ACESSO</p>
                <input className="input" placeholder="Ex: veteranos_rj" value={cadastroForm.codigo} onChange={e => setCadastroForm({ ...cadastroForm, codigo: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })} />
                <p style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>Este será o usuário de acesso ao sistema. Ex: veteranos_rj</p>
              </div>
              {erroCadastro && <p style={{ color: "#ff4757", fontSize: 13 }}>{erroCadastro}</p>}
              {okCadastro && <p style={{ color: "#00d97e", fontSize: 13 }}>{okCadastro}</p>}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="btn btn-green" style={{ flex: 1 }} onClick={solicitarCadastro}>Enviar Solicitação</button>
              <button className="btn btn-gray" style={{ flex: 1 }} onClick={() => { setTelaCadastro(false); setTelaLanding(true); setOkCadastro(""); setErroCadastro(""); }}>Voltar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL JOGADOR */}
      {modalJogador && (
        <div className="overlay">
          <div className="modal">
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 900, marginBottom: 20 }}>{jogadorEdit ? "EDITAR JOGADOR" : "NOVO JOGADOR"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input className="input" placeholder="Nome completo" value={novoJogador.nome} onChange={e => setNovoJogador({ ...novoJogador, nome: e.target.value })} />
              <input className="input" placeholder="E-mail" value={novoJogador.email} onChange={e => setNovoJogador({ ...novoJogador, email: e.target.value })} />
              <input className="input" placeholder="(21) 99999-9999" value={novoJogador.telefone} onChange={e => setNovoJogador({ ...novoJogador, telefone: maskTelefone(e.target.value) })} />
              <div>
                <p style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>DATA DE NASCIMENTO</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 8 }}>
                  <input className="input" placeholder="Dia" type="number" min="1" max="31" value={diaAniv} onChange={e => setDiaAniv(e.target.value)} />
                  <input className="input" placeholder="Mês" type="number" min="1" max="12" value={mesAniv} onChange={e => setMesAniv(e.target.value)} />
                  <input className="input" placeholder="Ano (ex: 1985)" type="number" min="1900" max="2099" value={anoAniv} onChange={e => setAnoAniv(e.target.value)} />
                </div>
              </div>
              <select className="input" value={novoJogador.tipo} onChange={e => setNovoJogador({ ...novoJogador, tipo: e.target.value })}>
                <option value="mensalista">Mensalista (R$ {configValores.mensalista})</option>
                <option value="avulso">Avulso (R$ {configValores.avulso})</option>
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

      {/* MODAL DESPESA */}
      {modalDespesa && (
        <div className="overlay">
          <div className="modal">
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 900, marginBottom: 20 }}>NOVA DESPESA</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input className="input" placeholder="Descrição" value={novaDespesa.descricao} onChange={e => setNovaDespesa({ ...novaDespesa, descricao: e.target.value })} />
              <input className="input" placeholder="Ex: 150,00" inputMode="numeric" value={novaDespesa.valor} onChange={e => setNovaDespesa({ ...novaDespesa, valor: maskDinheiro(e.target.value) })} />
              <input className="input" type="date" value={novaDespesa.data} onChange={e => setNovaDespesa({ ...novaDespesa, data: e.target.value })} />
              <select className="input" value={novaDespesa.categoria} onChange={e => setNovaDespesa({ ...novaDespesa, categoria: e.target.value })}>
                <option>Infraestrutura</option><option>Equipamentos</option><option>Administrativo</option><option>Outros</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="btn btn-green" style={{ flex: 1 }} onClick={salvarDespesa}>Salvar</button>
              <button className="btn btn-gray" style={{ flex: 1 }} onClick={() => setModalDespesa(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HISTÓRICO */}
      {modalHistorico && (
        <div className="overlay">
          <div className="modal">
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 900, marginBottom: 4 }}>📋 HISTÓRICO</h2>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>{modalHistorico.nome}</p>
            {modalHistorico.pagamentos.length === 0 ? <p style={{ color: "#64748b" }}>Nenhum pagamento registrado.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" }}>
                {[...modalHistorico.pagamentos].sort((a,b) => b.mes.localeCompare(a.mes)).map((p, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#0d1525", borderRadius: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{nomeMes(p.mes)}</span>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontWeight: 700 }}>R$ {p.valor.toFixed(2)}</span>
                      <span className={`tag ${p.pago ? "tag-green" : "tag-red"}`}>{p.pago ? "Pago" : "Pendente"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="btn btn-gray" style={{ width: "100%", marginTop: 20 }} onClick={() => setModalHistorico(null)}>Fechar</button>
          </div>
        </div>
      )}

      {/* MODAL PRESENÇA */}
      {/* MODAL WHATSAPP */}
      {modalWhatsapp && (
        <div className="overlay">
          <div className="modal">
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 900, marginBottom: 8 }}>💬 MENSAGEM WHATSAPP</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>Copie e cole no grupo!</p>
            <textarea className="input" readOnly value={gerarTextoWhatsapp()} style={{ minHeight: 180, fontSize: 13, lineHeight: 1.6 }} />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button className="btn btn-green" style={{ flex: 1 }} onClick={() => { navigator.clipboard.writeText(gerarTextoWhatsapp()); alert("Copiado!"); }}>📋 Copiar</button>
              <button className="btn btn-gray" style={{ flex: 1 }} onClick={() => setModalWhatsapp(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AVISO */}
      {modalAviso && (
        <div className="overlay">
          <div className="modal">
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 900, marginBottom: 8 }}>📢 NOVO COMUNICADO</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>O comunicado ficará visível para todos ao entrar no sistema e você pode gerar o texto para o WhatsApp.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <textarea className="input" placeholder="Digite o comunicado aqui..." value={avisoTexto} onChange={e => setAvisoTexto(e.target.value)} style={{ minHeight: 120 }} />
              <div onClick={() => setAvisoUrgente(!avisoUrgente)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, cursor: "pointer", background: avisoUrgente ? "rgba(255,71,87,0.08)" : "#0d1525", border: `2px solid ${avisoUrgente ? "#ff4757" : "#1e2e50"}` }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${avisoUrgente ? "#ff4757" : "#2a3a5c"}`, background: avisoUrgente ? "#ff4757" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {avisoUrgente && <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span>}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>🚨 Marcar como URGENTE</p>
                  <p style={{ fontSize: 12, color: "#64748b" }}>Aparece em destaque vermelho para todos</p>
                </div>
              </div>
              {avisoTexto && (
                <div style={{ background: "#0d1525", borderRadius: 10, padding: 14 }}>
                  <p style={{ fontSize: 11, color: "#64748b", marginBottom: 8, fontWeight: 600 }}>PRÉVIA DO WHATSAPP:</p>
                  <p style={{ fontSize: 13, color: "#94a3b8", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{gerarTextoAviso()}</p>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="btn btn-green" style={{ flex: 1 }} onClick={publicarAviso}>📌 Publicar</button>
              <button className="btn btn-green" style={{ flex: 1, background: "linear-gradient(135deg, #25d366, #128c7e)" }} onClick={() => { if(avisoTexto.trim()) { navigator.clipboard.writeText(gerarTextoAviso()); alert("Copiado para WhatsApp!"); } }}>💬 Copiar WhatsApp</button>
              <button className="btn btn-gray" onClick={() => setModalAviso(false)}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL UPGRADE */}
      {showUpgrade && (
        <div className="overlay">
          <div className="modal" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>⭐</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, marginBottom: 8, color: "#ffba00" }}>PLANO FULL</h2>
            <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              {expirado ? "Seu período de degustação encerrou." : `Você está no plano Degustação.`} Faça upgrade para desbloquear todos os recursos!
            </p>
            <div style={{ background: "#0d1525", borderRadius: 16, padding: 20, marginBottom: 20, textAlign: "left" }}>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: "#ffba00" }}>✨ PLANO FULL INCLUI:</p>
              {[["👥","Jogadores ilimitados"],["📄","Exportar relatório PDF"],["📢","Comunicados e avisos"],["💬","Mensagens WhatsApp"],["📊","Dashboard completo"],["🎂","Aniversariantes"],["🔒","Sem limite de tempo"]].map(([ico, txt]) => (
                <div key={txt} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>{ico}</span>
                  <span style={{ fontSize: 14, color: "#e8ecf3" }}>{txt}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "linear-gradient(135deg, rgba(255,186,0,0.1), rgba(255,186,0,0.05))", border: "1px solid rgba(255,186,0,0.3)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>Entre em contato para fazer o upgrade:</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#ffba00" }}>📱 (21) 98988-5422</p>
              <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>WhatsApp ou ligue para Edson</p>
            </div>
            <button className="btn btn-gray" style={{ width: "100%" }} onClick={() => setShowUpgrade(false)}>Fechar</button>
          </div>
        </div>
      )}

      {/* MODAL NOME */}
      {modalNome && (
        <div className="overlay">
          <div className="modal">
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 900, marginBottom: 8 }}>✏️ NOME DO GRUPO</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Aparece no cabeçalho e na tela de login.</p>
            <input className="input" placeholder="Nome do grupo" value={nomeEdit} onChange={e => setNomeEdit(e.target.value.toUpperCase())} maxLength={30} />
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="btn btn-green" style={{ flex: 1 }} onClick={() => { if (nomeEdit.trim()) { setNomeGrupo(nomeEdit.trim()); setModalNome(false); } }}>Salvar</button>
              <button className="btn btn-gray" style={{ flex: 1 }} onClick={() => setModalNome(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIG */}
      {modalConfig && (
        <div className="overlay">
          <div className="modal">
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 900, marginBottom: 20 }}>⚙️ CONFIGURAR VALORES</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 6, fontWeight: 600 }}>MENSALIDADE (R$)</p>
                <input className="input" placeholder="Ex: 80,00" value={configEdit.mensalista} onChange={e => setConfigEdit({ ...configEdit, mensalista: maskDinheiro(e.target.value) })} />
              </div>
              <div>
                <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 6, fontWeight: 600 }}>VALOR AVULSO (R$)</p>
                <input className="input" placeholder="Ex: 30,00" value={configEdit.avulso} onChange={e => setConfigEdit({ ...configEdit, avulso: maskDinheiro(e.target.value) })} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="btn btn-green" style={{ flex: 1 }} onClick={() => { setConfigValores(configEdit); setModalConfig(false); }}>Salvar</button>
              <button className="btn btn-gray" style={{ flex: 1 }} onClick={() => setModalConfig(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL META */}
      {modalMeta && (
        <div className="overlay">
          <div className="modal">
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 900, marginBottom: 8 }}>🎯 META MENSAL</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Meta de arrecadação mensal do grupo.</p>
            <input className="input" placeholder="Ex: 500,00" value={metaEdit} onChange={e => setMetaEdit(maskDinheiro(e.target.value))} />
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="btn btn-green" style={{ flex: 1 }} onClick={() => { setMetaMensal(metaEdit); setModalMeta(false); }}>Salvar</button>
              <button className="btn btn-gray" style={{ flex: 1 }} onClick={() => setModalMeta(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SENHA */}
      {modalSenha && (
        <div className="overlay">
          <div className="modal">
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 900, marginBottom: 20 }}>🔐 TROCAR SENHA</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <input className="input" type={showSenhaAtual ? "text" : "password"} placeholder="Senha atual" value={senhaAtual} onChange={e => { setSenhaAtual(e.target.value); setErroSenha(""); setOkSenha(""); }} style={{ paddingRight: 44 }} />
                <button onClick={() => setShowSenhaAtual(!showSenhaAtual)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "#64748b", fontSize: 18 }}>{showSenhaAtual ? "🙈" : "👁"}</button>
              </div>
              <div style={{ position: "relative" }}>
                <input className="input" type={showSenhaNova ? "text" : "password"} placeholder="Nova senha" value={senhaNova} onChange={e => { setSenhaNova(e.target.value); setErroSenha(""); setOkSenha(""); }} style={{ paddingRight: 44 }} />
                <button onClick={() => setShowSenhaNova(!showSenhaNova)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "#64748b", fontSize: 18 }}>{showSenhaNova ? "🙈" : "👁"}</button>
              </div>
              <div style={{ position: "relative" }}>
                <input className="input" type={showSenhaConfirm ? "text" : "password"} placeholder="Confirmar nova senha" value={senhaConfirm} onChange={e => { setSenhaConfirm(e.target.value); setErroSenha(""); setOkSenha(""); }} style={{ paddingRight: 44 }} />
                <button onClick={() => setShowSenhaConfirm(!showSenhaConfirm)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "#64748b", fontSize: 18 }}>{showSenhaConfirm ? "🙈" : "👁"}</button>
              </div>
              {erroSenha && <p style={{ color: "#ff4757", fontSize: 13 }}>{erroSenha}</p>}
              {okSenha && <p style={{ color: "#00d97e", fontSize: 13 }}>{okSenha}</p>}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="btn btn-blue" style={{ flex: 1 }} onClick={trocarSenha}>Salvar Nova Senha</button>
              <button className="btn btn-gray" style={{ flex: 1 }} onClick={() => { setModalSenha(false); setSenhaAtual(""); setSenhaNova(""); setSenhaConfirm(""); setErroSenha(""); setOkSenha(""); }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ background: "linear-gradient(135deg, #0d1525, #111827)", borderBottom: "1px solid #1e2e50", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>⚽</span>
          <div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, letterSpacing: 1, background: "linear-gradient(135deg, #3b82f6, #00d97e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{nomeGrupo}</h1>
            <p style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>SISTEMA DE GESTÃO {salvando && "· salvando..."}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span className={`tag ${isMaster ? "tag-purple" : isAdmin ? "tag-green" : "tag-yellow"}`}>{isMaster ? "🔑 MASTER" : isAdmin ? "👑 ADMIN" : "👁 VISITANTE"}</span>
          {!isMaster && <span onClick={() => !isFull && setShowUpgrade(true)} style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, cursor: isFull ? "default" : "pointer", background: isFull ? "rgba(0,217,126,0.15)" : expirado ? "rgba(255,71,87,0.15)" : "rgba(255,186,0,0.15)", color: isFull ? "#00d97e" : expirado ? "#ff4757" : "#ffba00" }}>
            {isFull ? "⭐ FULL" : expirado ? "❌ Expirado" : `🕐 Degustação${diasRestantes !== null ? ` · ${diasRestantes}d` : ""}`}
          </span>}
          {isAdmin && <button className="btn btn-gray" style={{ fontSize: 12 }} onClick={() => { setNomeEdit(nomeGrupo); setModalNome(true); }}>✏️ Nome</button>}
          {isAdmin && <button className="btn btn-green" style={{ fontSize: 12 }} onClick={() => { setConfigEdit(configValores); setModalConfig(true); }}>⚙️ Valores</button>}
          {isAdmin && <button className="btn btn-orange" style={{ fontSize: 12 }} onClick={() => { setMetaEdit(metaMensal); setModalMeta(true); }}>🎯 Meta</button>}
          {isAdmin && (isFull ? <button className="btn btn-green" style={{ fontSize: 12, background: "linear-gradient(135deg, #25d366, #128c7e)" }} onClick={() => setModalAviso(true)}>📢 Aviso</button> : <button className="btn btn-gray" style={{ fontSize: 12, opacity: 0.5 }} onClick={() => setShowUpgrade(true)}>📢 Aviso ⭐</button>)}
          {isAdmin && <button className="btn btn-blue" style={{ fontSize: 12 }} onClick={() => setModalSenha(true)}>🔐 Senha</button>}
          {showInstall && <button className="btn btn-green" style={{ fontSize: 12 }} onClick={instalarApp}>📲 Instalar App</button>}
          <button className="btn btn-gray" style={{ fontSize: 12 }} onClick={() => {
            setNomeGrupoState("VETERANOS FC"); setJogadoresState([]); setDespesasState([]); setPresencasState({}); setGrupoId("");
            if (isMaster) { setTelaGruposMaster(true); carregarGrupos(); }
            else { setTelaLanding(true); setTelaLogin(false); setGrupoIdInput(""); setSenhaInput(""); setErroLoginGrupo(""); setIsAdmin(false); setIsMaster(false); }
          }}>{isMaster ? "🔄 Trocar Grupo" : "🚪 Sair"}</button>
        </div>
      </header>

      {/* NAV */}
      <nav style={{ padding: "16px 24px", display: "flex", gap: 8, borderBottom: "1px solid #1e2e50", background: "#0d1525", flexWrap: "wrap" }}>
        {["dashboard","jogadores","financeiro","presenca", ...(isMaster ? ["master"] : [])].map(a => (
          <button key={a} className={`nav-tab ${aba===a?"active":""}`} onClick={() => setAba(a)}>
            {a==="dashboard"?"📊 Dashboard":a==="jogadores"?"👥 Jogadores":a==="financeiro"?"💰 Financeiro":a==="presenca"?"📅 Presença":"🔑 Master"}
          </button>
        ))}
      </nav>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <span style={{ color: "#64748b", fontSize: 14, fontWeight: 600 }}>Mês de referência:</span>
          <input type="month" className="input" style={{ width: "auto" }} value={mesFiltro} onChange={e => setMesFiltro(e.target.value)} />
        </div>

        {/* DASHBOARD */}
        {aba === "dashboard" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900 }}>VISÃO GERAL — {nomeMes(mesFiltro)}</h2>
              {isAdmin && (isFull ? <button className="btn btn-blue" style={{ fontSize: 12 }} onClick={gerarPDF}>📄 Exportar PDF</button> : <button className="btn btn-blue" style={{ fontSize: 12, opacity: 0.5 }} onClick={() => setShowUpgrade(true)}>📄 Exportar PDF ⭐</button>)}
            </div>

            {/* Banner expiração/degustação */}
            {!isFull && !isMaster && isAdmin && (
              <div onClick={() => setShowUpgrade(true)} style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderRadius: 12, marginBottom: 16, background: expirado ? "rgba(255,71,87,0.08)" : "rgba(255,186,0,0.08)", border: `1px solid ${expirado ? "rgba(255,71,87,0.3)" : "rgba(255,186,0,0.3)"}` }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: expirado ? "#ff4757" : "#ffba00" }}>
                    {expirado ? "❌ Período de degustação encerrado" : `🕐 Degustação${diasRestantes !== null ? ` — ${diasRestantes} dias restantes` : ""}`}
                  </p>
                  <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    {expirado ? "Faça o upgrade para continuar usando o sistema." : `Limite: ${jogadores.filter(j=>j.status==="ativo").length}/${limiteJogadores} jogadores · Clique para ver o Plano Full`}
                  </p>
                </div>
                <span style={{ color: "#ffba00", fontSize: 20 }}>›</span>
              </div>
            )}

            {/* Avisos */}
            {avisos.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                {avisos.slice(0, 3).map(a => (
                  <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 20px", borderRadius: 12, marginBottom: 10, background: a.urgente ? "rgba(255,71,87,0.08)" : "rgba(59,130,246,0.08)", border: `1px solid ${a.urgente ? "rgba(255,71,87,0.3)" : "rgba(59,130,246,0.3)"}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 18 }}>{a.urgente ? "🚨" : "📢"}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: a.urgente ? "#ff4757" : "#3b82f6" }}>{a.urgente ? "URGENTE" : "COMUNICADO"}</span>
                        <span style={{ fontSize: 11, color: "#475569" }}>{new Date(a.data).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <p style={{ fontSize: 14, color: "#e8ecf3", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{a.texto}</p>
                    </div>
                    {isAdmin && (
                      <button onClick={() => setAvisos(avisos.filter(x => x.id !== a.id))} style={{ cursor: "pointer", border: "none", background: "transparent", color: "#475569", fontSize: 18, padding: "0 0 0 12px", lineHeight: 1 }}>✕</button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
              <div className="stat-card" style={{ borderLeftColor: "#00d97e" }}>
                <p style={{ color: "#64748b", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>RECEITA DO MÊS</p>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 34, fontWeight: 900, color: "#00d97e" }}>R$ {receitaMes.toFixed(2)}</p>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min((receitaMes/((totalMensalistas*valorMensalista+totalAvulsos*valorAvulso)||1))*100,100)}%`, background: "#00d97e" }} /></div>
              </div>
              <div className="stat-card" style={{ borderLeftColor: "#ff4757" }}>
                <p style={{ color: "#64748b", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>DESPESAS DO MÊS</p>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 34, fontWeight: 900, color: "#ff4757" }}>R$ {despesasMes.toFixed(2)}</p>
              </div>
              <div className="stat-card" style={{ borderLeftColor: saldo>=0?"#3b82f6":"#ff4757" }}>
                <p style={{ color: "#64748b", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SALDO</p>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 34, fontWeight: 900, color: saldo>=0?"#3b82f6":"#ff4757" }}>R$ {saldo.toFixed(2)}</p>
              </div>
              <div className="stat-card" style={{ borderLeftColor: "#ffba00" }}>
                <p style={{ color: "#64748b", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>JOGADORES ATIVOS</p>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 34, fontWeight: 900, color: "#ffba00" }}>{jogadores.filter(j=>j.status==="ativo").length}</p>
                <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{totalMensalistas} mensalistas · {totalAvulsos} avulsos</p>
              </div>
            </div>

            {metaValor > 0 && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 900 }}>🎯 META MENSAL</h3>
                  <span style={{ fontWeight: 700, color: metaPct>=100?"#00d97e":"#ffba00" }}>{metaPct.toFixed(0)}% — R$ {receitaMes.toFixed(2)} / R$ {metaValor.toFixed(2)}</span>
                </div>
                <div className="progress-bar" style={{ height: 14 }}>
                  <div className="progress-fill" style={{ width: `${metaPct}%`, background: metaPct>=100?"#00d97e":metaPct>=60?"#ffba00":"#ff4757" }} />
                </div>
                {metaPct >= 100 && <p style={{ color: "#00d97e", fontSize: 13, marginTop: 8, fontWeight: 700 }}>🎉 Meta atingida!</p>}
              </div>
            )}

            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 900, color: "#ff4757" }}>⚠️ INADIMPLENTES ({inadimplentes.length})</h3>
                {isAdmin && inadimplentes.length > 0 && <button className="btn btn-green" style={{ fontSize: 12, background: "linear-gradient(135deg, #25d366, #128c7e)" }} onClick={() => setModalWhatsapp(true)}>💬 Gerar WhatsApp</button>}
              </div>
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
                        <span style={{ fontWeight: 700, color: "#ff4757" }}>R$ {valorMensalista.toFixed(2)}</span>
                        {isAdmin && <button className="btn btn-green" style={{ fontSize: 12 }} onClick={() => togglePagamento(j.id)}>Marcar Pago</button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {aniversariantes.length > 0 && (
              <div className="card" style={{ marginBottom: 20, borderColor: "rgba(168,85,247,0.3)" }}>
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 900, marginBottom: 14, color: "#a855f7" }}>🎂 ANIVERSARIANTES</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {aniversariantes.map(j => (
                    <div key={j.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(168,85,247,0.07)", borderRadius: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 22 }}>🎂</span>
                        <div>
                          <p style={{ fontWeight: 700 }}>{j.nome}</p>
                          <p style={{ fontSize: 12, color: "#64748b" }}>Dia {j.nascimento.split("-")[2]}</p>
                        </div>
                      </div>
                      <span className="tag tag-purple">Parabéns! 🎉</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="card">
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 900, marginBottom: 14 }}>RECEITA POR TIPO</h3>
                {[{label:"Mensalistas",color:"#3b82f6",valor:jogadores.filter(j=>j.tipo==="mensalista").reduce((a,j)=>{const p=j.pagamentos.find(p=>p.mes===mesFiltro&&p.pago);return a+(p?p.valor:0);},0)},{label:"Avulsos",color:"#00d97e",valor:jogadores.filter(j=>j.tipo==="avulso").reduce((a,j)=>{const p=j.pagamentos.find(p=>p.mes===mesFiltro&&p.pago);return a+(p?p.valor:0);},0)}].map(item=>(
                  <div key={item.label} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, color: "#94a3b8" }}>{item.label}</span>
                      <span style={{ fontWeight: 700, color: item.color }}>R$ {item.valor.toFixed(2)}</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${receitaMes?(item.valor/receitaMes)*100:0}%`, background: item.color }} /></div>
                  </div>
                ))}
                {receitaMes===0&&<p style={{color:"#64748b",fontSize:14}}>Nenhuma receita neste mês.</p>}
              </div>
              <div className="card">
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 900, marginBottom: 14 }}>DESPESAS POR CATEGORIA</h3>
                {["Infraestrutura","Equipamentos","Administrativo","Outros"].map(cat=>{
                  const val=despesas.filter(d=>d.categoria===cat&&d.data.startsWith(mesFiltro)).reduce((a,d)=>a+d.valor,0);
                  if(!val)return null;
                  return(<div key={cat} style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:14,color:"#94a3b8"}}>{cat}</span><span style={{fontWeight:700,color:"#ff4757"}}>R$ {val.toFixed(2)}</span></div><div className="progress-bar"><div className="progress-fill" style={{width:`${despesasMes?(val/despesasMes)*100:0}%`,background:"#ff4757"}}/></div></div>);
                })}
                {despesasMes===0&&<p style={{color:"#64748b",fontSize:14}}>Nenhuma despesa neste mês.</p>}
              </div>
            </div>
          </div>
        )}

        {/* JOGADORES */}
        {aba === "jogadores" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900 }}>JOGADORES</h2>
              {isAdmin && <button className="btn btn-green" onClick={() => { setJogadorEdit(null); setNovoJogador({ nome:"",email:"",telefone:"",nascimento:"",tipo:"mensalista",status:"ativo" }); setModalJogador(true); }}>+ Novo Jogador</button>}
            </div>
            <div className="card">
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr 90px 100px 160px", gap: 8, padding: "8px 16px", marginBottom: 8 }}>
                {["NOME","EMAIL","TELEFONE","TIPO","STATUS",""].map(h=><span key={h} style={{fontSize:11,fontWeight:700,color:"#475569"}}>{h}</span>)}
              </div>
              {jogadores.map(j => {
                const pag = getPagamento(j);
                return (
                  <div key={j.id} className="table-row" style={{ gridTemplateColumns: "2fr 1.5fr 1.5fr 90px 100px 160px", gap: 8, borderBottom: "1px solid #1a2540" }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15 }}>{j.nome}</p>
                      {j.nascimento && <p style={{ fontSize: 11, color: "#64748b" }}>🎂 {j.nascimento.split("-").reverse().join("/")}</p>}
                    </div>
                    <p style={{ fontSize: 13, color: "#94a3b8" }}>{j.email||"—"}</p>
                    <p style={{ fontSize: 13, color: "#94a3b8" }}>{j.telefone||"—"}</p>
                    <span className={`tag ${j.tipo==="mensalista"?"tag-blue":"tag-yellow"}`}>{j.tipo==="mensalista"?"Mensal":"Avulso"}</span>
                    <span className={`tag ${j.status==="ativo"?"tag-green":"tag-red"}`}>{j.status}</span>
                    <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
                      {isAdmin && <button className={`btn ${pag?.pago?"btn-gray":"btn-green"}`} style={{ fontSize: 10, padding: "4px 8px" }} onClick={() => togglePagamento(j.id)}>{pag?.pago?"✅":"Pagar"}</button>}
                      {isAdmin && <button className="btn btn-blue" style={{ fontSize: 10, padding: "4px 8px" }} onClick={() => setModalHistorico(j)}>📋</button>}
                      {isAdmin && <button className="btn btn-blue" style={{ fontSize: 10, padding: "4px 8px" }} onClick={() => editarJogador(j)}>✏️</button>}
                      {isAdmin && <button className="btn btn-red" style={{ fontSize: 10, padding: "4px 8px" }} onClick={() => removerJogador(j.id)}>🗑</button>}
                    </div>
                  </div>
                );
              })}
              {jogadores.length===0&&(<div style={{textAlign:"center",padding:"40px 20px"}}><p style={{fontSize:40,marginBottom:12}}>👥</p><p style={{color:"#64748b",fontSize:15}}>Nenhum jogador cadastrado ainda.</p>{isAdmin&&<p style={{color:"#475569",fontSize:13,marginTop:6}}>Clique em "+ Novo Jogador" para começar!</p>}</div>)}
            </div>
          </div>
        )}

        {/* FINANCEIRO */}
        {aba === "financeiro" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900 }}>FINANCEIRO</h2>
              <div style={{ display: "flex", gap: 8 }}>
                {isAdmin && <button className="btn btn-green" style={{ fontSize: 12, background: "linear-gradient(135deg, #25d366, #128c7e)" }} onClick={() => setModalWhatsapp(true)}>💬 WhatsApp</button>}
                {isAdmin && <button className="btn btn-blue" style={{ fontSize: 12 }} onClick={gerarPDF}>📄 Exportar PDF</button>}
                {isAdmin && <button className="btn btn-red" onClick={() => setModalDespesa(true)}>+ Nova Despesa</button>}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="card">
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 900, marginBottom: 16, color: "#00d97e" }}>💚 RECEITAS — {nomeMes(mesFiltro)}</h3>
                {jogadores.filter(j=>{const p=j.pagamentos.find(p=>p.mes===mesFiltro&&p.pago);return!!p;}).map(j=>{
                  const pag=j.pagamentos.find(p=>p.mes===mesFiltro&&p.pago);
                  return(<div key={j.id} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #1a2540"}}><div><p style={{fontSize:14,fontWeight:600}}>{j.nome}</p><span className={`tag ${j.tipo==="mensalista"?"tag-blue":"tag-yellow"}`} style={{fontSize:11}}>{j.tipo}</span></div><p style={{fontWeight:700,color:"#00d97e"}}>+ R$ {pag.valor.toFixed(2)}</p></div>);
                })}
                {receitaMes===0&&<p style={{color:"#64748b",fontSize:14}}>Nenhuma receita neste mês.</p>}
                <div style={{display:"flex",justifyContent:"space-between",padding:"14px 0 0",marginTop:8}}><span style={{fontWeight:700}}>TOTAL</span><span style={{fontWeight:900,fontSize:18,color:"#00d97e"}}>R$ {receitaMes.toFixed(2)}</span></div>
              </div>
              <div className="card">
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 900, marginBottom: 16, color: "#ff4757" }}>🔴 DESPESAS — {nomeMes(mesFiltro)}</h3>
                {despesas.filter(d=>d.data.startsWith(mesFiltro)).map(d=>(
                  <div key={d.id} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #1a2540"}}>
                    <div><p style={{fontSize:14,fontWeight:600}}>{d.descricao}</p><div style={{display:"flex",gap:6,marginTop:4}}><span className="tag tag-red" style={{fontSize:11}}>{d.categoria}</span><span style={{fontSize:11,color:"#64748b"}}>{d.data.split("-").reverse().join("/")}</span></div></div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}><p style={{fontWeight:700,color:"#ff4757"}}>- R$ {d.valor.toFixed(2)}</p>{isAdmin&&<button className="btn btn-red" style={{fontSize:11,padding:"4px 8px"}} onClick={()=>setDespesas(despesas.filter(x=>x.id!==d.id))}>🗑</button>}</div>
                  </div>
                ))}
                {despesas.filter(d=>d.data.startsWith(mesFiltro)).length===0&&<p style={{color:"#64748b",fontSize:14}}>Nenhuma despesa registrada.</p>}
                <div style={{display:"flex",justifyContent:"space-between",padding:"14px 0 0",marginTop:8}}><span style={{fontWeight:700}}>TOTAL</span><span style={{fontWeight:900,fontSize:18,color:"#ff4757"}}>R$ {despesasMes.toFixed(2)}</span></div>
              </div>
            </div>
            <div style={{ marginTop: 20, padding: "24px 28px", borderRadius: 16, background: saldo>=0?"linear-gradient(135deg, rgba(0,217,126,0.1), rgba(0,217,126,0.05))":"linear-gradient(135deg, rgba(255,71,87,0.1), rgba(255,71,87,0.05))", border: `1px solid ${saldo>=0?"rgba(0,217,126,0.3)":"rgba(255,71,87,0.3)"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900 }}>BALANÇO DO MÊS</p>
                <p style={{ color: "#64748b", fontSize: 14 }}>Receita R$ {receitaMes.toFixed(2)} − Despesas R$ {despesasMes.toFixed(2)}</p>
              </div>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 42, fontWeight: 900, color: saldo>=0?"#00d97e":"#ff4757" }}>{saldo>=0?"+":""}R$ {saldo.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* PRESENÇA */}
        {aba === "presenca" && (
          <div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, marginBottom: 20 }}>📅 LISTA DE PRESENÇA</h2>

            {/* Seletor de data + lista inline */}
            {isAdmin && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
                  <div>
                    <p style={{ fontSize: 12, color: "#64748b", marginBottom: 4, fontWeight: 600 }}>DATA DO JOGO</p>
                    <input className="input" type="date" style={{ width: "auto" }} value={dataPresenca} onChange={e => setDataPresenca(e.target.value)} />
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <span className="tag tag-blue">{presencasData.length} / {jogadores.filter(j=>j.status==="ativo").length} presentes</span>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12, fontWeight: 600 }}>CLIQUE PARA MARCAR PRESENÇA:</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
                  {jogadores.filter(j => j.status === "ativo").map(j => {
                    const presente = presencasData.includes(j.id);
                    return (
                      <div
                        key={j.id}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, cursor: "pointer", background: presente ? "rgba(0,217,126,0.12)" : "#0d1525", border: `2px solid ${presente ? "#00d97e" : "#1e2e50"}`, transition: "all 0.2s", userSelect: "none" }}
                        onClick={() => togglePresenca(j.id)}
                      >
                        <span style={{ fontSize: 18 }}>{presente ? "✅" : "⬜"}</span>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: presente ? "#00d97e" : "#e8ecf3" }}>{j.nome}</p>
                          <span className={`tag ${j.tipo==="mensalista"?"tag-blue":"tag-yellow"}`} style={{ fontSize: 10 }}>{j.tipo==="mensalista"?"Mensal":"Avulso"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {jogadores.filter(j=>j.status==="ativo").length === 0 && <p style={{color:"#64748b",fontSize:14}}>Nenhum jogador ativo cadastrado.</p>}
              </div>
            )}

            {/* Frequência do mês */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 900, marginBottom: 16 }}>FREQUÊNCIA — {nomeMes(mesFiltro)}</h3>
              {(() => {
                const jogosDoMes = Object.keys(presencas || {}).filter(d=>d.startsWith(mesFiltro)).sort();
                if (jogosDoMes.length===0) return <p style={{color:"#64748b",fontSize:14}}>Nenhuma presença registrada neste mês.</p>;
                return (
                  <div>
                    <p style={{color:"#64748b",fontSize:13,marginBottom:14}}>{jogosDoMes.length} jogo(s) registrado(s)</p>
                    {jogadores.filter(j=>j.status==="ativo").sort((a,b)=>{
                      const fa=jogosDoMes.filter(d=>((presencas||{})[d]||[]).includes(a.id)).length;
                      const fb=jogosDoMes.filter(d=>((presencas||{})[d]||[]).includes(b.id)).length;
                      return fb-fa;
                    }).map(j=>{
                      const presentes=jogosDoMes.filter(d=>((presencas||{})[d]||[]).includes(j.id)).length;
                      const pct=jogosDoMes.length?(presentes/jogosDoMes.length)*100:0;
                      return(<div key={j.id} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:14,fontWeight:600}}>{j.nome}</span><span style={{fontSize:13,color:pct>=75?"#00d97e":pct>=50?"#ffba00":"#ff4757",fontWeight:700}}>{presentes}/{jogosDoMes.length} ({pct.toFixed(0)}%)</span></div><div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`,background:pct>=75?"#00d97e":pct>=50?"#ffba00":"#ff4757"}}/></div></div>);
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Histórico */}
            <div className="card">
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 900, marginBottom: 16 }}>HISTÓRICO DE JOGOS</h3>
              {Object.keys(presencas || {}).filter(d=>d.startsWith(mesFiltro)).sort().reverse().map(data=>{
                const lista=(presencas||{})[data]||[];
                return(<div key={data} style={{padding:"14px 0",borderBottom:"1px solid #1a2540"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><p style={{fontWeight:700}}>{data.split("-").reverse().join("/")}</p><div style={{display:"flex",gap:8,alignItems:"center"}}><span className="tag tag-blue">{lista.length} presentes</span>{isAdmin&&<button className="btn btn-red" style={{fontSize:11,padding:"3px 8px"}} onClick={()=>{if(confirm("Remover este jogo?")){const np={...(presencas||{})};delete np[data];setPresencas(np);}}}>🗑</button>}</div></div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{jogadores.filter(j=>lista.includes(j.id)).map(j=><span key={j.id} className="tag tag-green" style={{fontSize:11}}>{j.nome}</span>)}</div></div>);
              })}
              {Object.keys(presencas || {}).filter(d=>d.startsWith(mesFiltro)).length===0&&<p style={{color:"#64748b",fontSize:14}}>Nenhum jogo registrado neste mês.</p>}
            </div>
          </div>
        )}
        {/* PAINEL MASTER */}
        {aba === "master" && isMaster && (
          <MasterPanel db={db} grupoAtual={grupoId} />
        )}
      </main>
    </div>
  );
}

function MasterPanel({ db, grupoAtual }) {
  const [grupos, setGrupos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [editandoPlano, setEditandoPlano] = useState(null);
  const [planoEdit, setPlanoEdit] = useState({ tipo: "degustacao", dias: 30, limiteJogadores: 10 });

  useEffect(() => {
    import("firebase/firestore").then(({ collection, onSnapshot: snapFn, query }) => {
      const q = query(collection(db, "grupos"));
      const unsub = snapFn(q, (qs) => {
        const lista = [];
        qs.forEach(d => lista.push({ id: d.id, ...d.data() }));
        setGrupos(lista.sort((a,b) => (a.dataCadastro||"").localeCompare(b.dataCadastro||"")));
        setCarregando(false);
      });
      return () => unsub();
    });
  }, [db]);

  const definirPlano = async (id, novoPlano, dias, limiteJog) => {
    const { doc: docFn, setDoc: setDocFn } = await import("firebase/firestore");
    const expiracao = dias ? new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString() : null;
    await setDocFn(docFn(db, "grupos", id), {
      plano: novoPlano,
      dataExpiracao: expiracao,
      limiteJogadores: novoPlano === "full" ? 9999 : (limiteJog || 10)
    }, { merge: true });
    setEditandoPlano(null);
  };

  const aprovar = async (id, grupo) => {
    const { doc: docFn, setDoc: setDocFn } = await import("firebase/firestore");
    // Aprova com degustação de 30 dias por padrão
    const expiracao = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await setDocFn(docFn(db, "grupos", id), { status: "ativo", plano: "degustacao", dataExpiracao: expiracao }, { merge: true });
    // Enviar email de boas-vindas para o solicitante
    if (grupo.emailResponsavel) {
      try {
        await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: "service_veteranos",
            template_id: "template_aprovacao",
            user_id: "qmhFlMvfDr9Xfy_Hz",
            template_params: {
              to_email: grupo.emailResponsavel,
              responsavel: grupo.responsavel || "Responsável",
              grupo_nome: grupo.nomeGrupo || id,
              grupo_usuario: id,
              senha_inicial: "admin123",
              link_sistema: "https://veteranos-fc.vercel.app"
            }
          })
        });
      } catch(e) { console.log("Erro ao enviar email aprovação:", e); }
    }
  };
  const bloquear = async (id) => {
    const { doc: docFn, setDoc: setDocFn } = await import("firebase/firestore");
    await setDocFn(docFn(db, "grupos", id), { status: "bloqueado" }, { merge: true });
  };
  const excluir = async (id) => {
    if (!confirm(`Excluir grupo ${id}? Esta ação não pode ser desfeita!`)) return;
    const { doc: docFn, deleteDoc } = await import("firebase/firestore");
    await deleteDoc(docFn(db, "grupos", id));
  };

  const statusTag = (s) => {
    if (s === "pendente") return <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:700, background:"rgba(255,186,0,0.15)", color:"#ffba00" }}>⏳ Pendente</span>;
    if (s === "bloqueado") return <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:700, background:"rgba(255,71,87,0.15)", color:"#ff4757" }}>🚫 Bloqueado</span>;
    return <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:700, background:"rgba(0,217,126,0.15)", color:"#00d97e" }}>✅ Ativo</span>;
  };

  if (carregando) return <p style={{ color:"#64748b" }}>Carregando grupos...</p>;

  const pendentes = grupos.filter(g => g.status === "pendente");
  const ativos = grupos.filter(g => g.status !== "pendente");

  return (
    <div>
      <h2 style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:28, fontWeight:900, marginBottom:8 }}>🔑 PAINEL MASTER</h2>
      <p style={{ color:"#64748b", fontSize:13, marginBottom:24 }}>Grupo atual: <strong style={{color:"#3b82f6"}}>{grupoAtual}</strong> · Total de grupos: {grupos.length}</p>

      {pendentes.length > 0 && (
        <div style={{ background:"rgba(255,186,0,0.07)", border:"1px solid rgba(255,186,0,0.3)", borderRadius:16, padding:20, marginBottom:20 }}>
          <h3 style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:20, fontWeight:900, marginBottom:16, color:"#ffba00" }}>⏳ AGUARDANDO APROVAÇÃO ({pendentes.length})</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {pendentes.map(g => (
              <div key={g.id} style={{ background:"#0d1525", borderRadius:12, padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
                <div>
                  <p style={{ fontWeight:700, fontSize:16 }}>{g.nomeGrupo || g.id}</p>
                  <p style={{ fontSize:12, color:"#94a3b8" }}>Código: <strong>{g.id}</strong></p>
                  {g.responsavel && <p style={{ fontSize:12, color:"#94a3b8" }}>Responsável: {g.responsavel}</p>}
                  {g.telefone && <p style={{ fontSize:12, color:"#94a3b8" }}>📱 {g.telefone}</p>}
                  {g.dataCadastro && <p style={{ fontSize:11, color:"#475569" }}>Solicitado em: {new Date(g.dataCadastro).toLocaleDateString("pt-BR")}</p>}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => aprovar(g.id, g)} style={{ cursor:"pointer", border:"none", borderRadius:8, background:"linear-gradient(135deg, #00d97e, #00b865)", color:"#fff", padding:"8px 16px", fontFamily:"'Barlow', sans-serif", fontWeight:700, fontSize:13 }}>✅ Aprovar</button>
                  <button onClick={() => excluir(g.id)} style={{ cursor:"pointer", border:"none", borderRadius:8, background:"linear-gradient(135deg, #ff4757, #cc2030)", color:"#fff", padding:"8px 16px", fontFamily:"'Barlow', sans-serif", fontWeight:700, fontSize:13 }}>🗑 Recusar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ background:"linear-gradient(135deg, #111827, #1a2540)", border:"1px solid #1e2e50", borderRadius:16, padding:20 }}>
        <h3 style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:20, fontWeight:900, marginBottom:16 }}>TODOS OS GRUPOS ({ativos.length})</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {ativos.map(g => (
            <div key={g.id} style={{ background:"#0d1525", borderRadius:12, padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                  <p style={{ fontWeight:700 }}>{g.nomeGrupo || g.id}</p>
                  {statusTag(g.status)}
                </div>
                <p style={{ fontSize:12, color:"#94a3b8" }}>Código: <strong>{g.id}</strong> · {g.jogadores?.length || 0} jogadores</p>
                {g.responsavel && <p style={{ fontSize:12, color:"#64748b" }}>{g.responsavel} {g.telefone ? `· ${g.telefone}` : ""}</p>}
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                <button onClick={() => { setEditandoPlano(g.id); setPlanoEdit({ tipo: g.plano||"degustacao", dias: 30, limiteJogadores: g.limiteJogadores||10 }); }} style={{ cursor:"pointer", border:"none", borderRadius:8, background:"rgba(59,130,246,0.15)", color:"#3b82f6", padding:"6px 12px", fontFamily:"'Barlow', sans-serif", fontWeight:700, fontSize:12 }}>⚙️ Plano</button>
                {g.status !== "ativo" && <button onClick={() => aprovar(g.id, g)} style={{ cursor:"pointer", border:"none", borderRadius:8, background:"linear-gradient(135deg, #00d97e, #00b865)", color:"#fff", padding:"6px 12px", fontFamily:"'Barlow', sans-serif", fontWeight:700, fontSize:12 }}>✅ Ativar</button>}
                {g.status !== "bloqueado" && <button onClick={() => bloquear(g.id)} style={{ cursor:"pointer", border:"none", borderRadius:8, background:"linear-gradient(135deg, #f59e0b, #d97706)", color:"#fff", padding:"6px 12px", fontFamily:"'Barlow', sans-serif", fontWeight:700, fontSize:12 }}>🚫 Bloquear</button>}
                <button onClick={() => excluir(g.id)} style={{ cursor:"pointer", border:"none", borderRadius:8, background:"linear-gradient(135deg, #ff4757, #cc2030)", color:"#fff", padding:"6px 12px", fontFamily:"'Barlow', sans-serif", fontWeight:700, fontSize:12 }}>🗑</button>
              </div>
              {editandoPlano === g.id && (
                <div style={{ marginTop:12, background:"#0a0f1e", border:"1px solid #1e2e50", borderRadius:12, padding:16, display:"flex", flexDirection:"column", gap:10 }}>
                  <p style={{ fontWeight:700, fontSize:13, color:"#94a3b8" }}>⚙️ CONFIGURAR PLANO</p>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={() => setPlanoEdit({...planoEdit, tipo:"degustacao"})} style={{ flex:1, cursor:"pointer", border:`2px solid ${planoEdit.tipo==="degustacao"?"#ffba00":"#1e2e50"}`, borderRadius:8, background: planoEdit.tipo==="degustacao"?"rgba(255,186,0,0.1)":"transparent", color: planoEdit.tipo==="degustacao"?"#ffba00":"#64748b", padding:"8px", fontFamily:"'Barlow', sans-serif", fontWeight:700, fontSize:13 }}>🕐 Degustação</button>
                    <button onClick={() => setPlanoEdit({...planoEdit, tipo:"full"})} style={{ flex:1, cursor:"pointer", border:`2px solid ${planoEdit.tipo==="full"?"#00d97e":"#1e2e50"}`, borderRadius:8, background: planoEdit.tipo==="full"?"rgba(0,217,126,0.1)":"transparent", color: planoEdit.tipo==="full"?"#00d97e":"#64748b", padding:"8px", fontFamily:"'Barlow', sans-serif", fontWeight:700, fontSize:13 }}>⭐ Full</button>
                  </div>
                  {planoEdit.tipo === "degustacao" && (
                    <div style={{ display:"flex", gap:10 }}>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:11, color:"#64748b", marginBottom:4 }}>DIAS DE ACESSO</p>
                        <input type="number" min="1" max="365" value={planoEdit.dias} onChange={e => setPlanoEdit({...planoEdit, dias: parseInt(e.target.value)||30})} style={{ width:"100%", padding:"8px 12px", borderRadius:8, background:"#0d1525", border:"1px solid #1e2e50", color:"#e8ecf3", fontFamily:"'Barlow', sans-serif", fontSize:14 }} />
                      </div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:11, color:"#64748b", marginBottom:4 }}>LIMITE JOGADORES</p>
                        <input type="number" min="1" max="100" value={planoEdit.limiteJogadores} onChange={e => setPlanoEdit({...planoEdit, limiteJogadores: parseInt(e.target.value)||10})} style={{ width:"100%", padding:"8px 12px", borderRadius:8, background:"#0d1525", border:"1px solid #1e2e50", color:"#e8ecf3", fontFamily:"'Barlow', sans-serif", fontSize:14 }} />
                      </div>
                    </div>
                  )}
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={() => definirPlano(g.id, planoEdit.tipo, planoEdit.tipo==="full"?null:planoEdit.dias, planoEdit.limiteJogadores)} style={{ flex:1, cursor:"pointer", border:"none", borderRadius:8, background:"linear-gradient(135deg, #3b82f6, #1d4ed8)", color:"#fff", padding:"10px", fontFamily:"'Barlow', sans-serif", fontWeight:700, fontSize:13 }}>✅ Salvar</button>
                    <button onClick={() => setEditandoPlano(null)} style={{ cursor:"pointer", border:"none", borderRadius:8, background:"#1e2e50", color:"#94a3b8", padding:"10px 16px", fontFamily:"'Barlow', sans-serif", fontWeight:700, fontSize:13 }}>✕</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {ativos.length === 0 && <p style={{ color:"#64748b", fontSize:14 }}>Nenhum grupo ativo ainda.</p>}
        </div>
      </div>
    </div>
  );
}
