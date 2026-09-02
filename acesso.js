/* Tela de identificação das páginas de estudo — OLITEF · Arena.
 *
 * O aluno informa nome, série e turma antes de ver o material. Os dados são
 * gravados no aparelho dele (para não perguntar de novo a cada página) e
 * enviados para uma Planilha Google, que é o relatório do professor.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ PARA LIGAR O RELATÓRIO, cole abaixo o endereço do seu Apps Script.  │
 * │ O passo a passo está no arquivo COMO-LIGAR-O-RELATORIO.md.          │
 * │ Enquanto estiver vazio, a tela funciona e guarda só no aparelho.    │
 * └─────────────────────────────────────────────────────────────────────┘
 */
var PLANILHA_URL = "https://script.google.com/macros/s/AKfycbwhMFOO1dKhirV7SfkQQuSZYWphdl2K3FvvvFqebcDHp3flpZF6A2JZLdEzRsHcXYj-/exec";

/* Trocar este texto obriga todo mundo a se identificar de novo — útil no
 * começo de um bimestre ou quando entra turma nova. */
var TEMPORADA = "2026";

(function () {
  var CHAVE = "olitef-aluno-" + TEMPORADA;

  if (window.__olitefIdent) return;
  window.__olitefIdent = true;

  var SERIES = ["6º ano", "7º ano", "8º ano", "9º ano", "1º ano do EM", "2º ano do EM", "3º ano do EM"];

  var CSS = {
    capa: "position:fixed;inset:0;z-index:99999;background:#f3f2f2;color:#201e1d;" +
      "font-family:Archivo,system-ui,sans-serif;display:flex;align-items:flex-start;" +
      "justify-content:center;overflow:auto;padding:32px 20px",
    caixa: "width:100%;max-width:460px;margin:auto 0;display:flex;flex-direction:column;gap:22px",
    kicker: "font-size:13px;letter-spacing:0.1em;text-transform:uppercase;color:#1f6a6b;font-weight:600",
    titulo: "font-weight:800;font-size:clamp(32px,9vw,46px);line-height:0.98;letter-spacing:-0.03em;margin:0",
    texto: "margin:0;font-size:17px;line-height:1.5",
    campo: "display:flex;flex-direction:column;gap:8px",
    rotulo: "font-size:13px;letter-spacing:0.1em;text-transform:uppercase;color:#5c5856;font-weight:600",
    input: "font-family:inherit;font-size:18px;padding:14px 16px;border:2px solid #201e1d;" +
      "border-radius:0;background:#fff;color:#201e1d;min-height:52px;width:100%;box-sizing:border-box",
    botao: "font-family:inherit;font-weight:800;font-size:18px;padding:0 24px;min-height:56px;" +
      "border:0;border-radius:0;background:#309898;color:#f3f2f2;cursor:pointer;text-align:left",
    erro: "margin:0;font-size:16px;font-weight:600;color:#0f3737;background:#e6f2f2;padding:14px 16px",
    rodape: "margin:0;font-size:13px;line-height:1.5;color:#5c5856;border-top:2px solid #cdcac9;padding-top:16px"
  };

  function revelar() {
    document.documentElement.style.visibility = "";
    if (window.__olitefRevelar) window.__olitefRevelar();
  }

  /* O envio usa no-cors: o Apps Script recebe o registro, mas o navegador não
   * lê a resposta. É o suficiente aqui — e evita erro de CORS bloqueando a
   * navegação do aluno. Falha de rede nunca impede o acesso ao material. */
  function registrar(aluno, evento) {
    if (!PLANILHA_URL) return;
    try {
      var corpo = {
        nome: aluno.nome, serie: aluno.serie, turma: aluno.turma,
        evento: evento, pagina: document.title || location.pathname,
        url: location.href, momento: new Date().toISOString()
      };
      fetch(PLANILHA_URL, {
        method: "POST", mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(corpo)
      }).catch(function () { /* sem rede: o aluno segue estudando */ });
    } catch (e) { /* idem */ }
  }

  var salvo = null;
  try { salvo = JSON.parse(window.localStorage.getItem(CHAVE) || "null"); } catch (e) { salvo = null; }

  if (salvo && salvo.nome) {
    registrar(salvo, "abriu a página");
    revelar();
    return;
  }

  function montar() {
    var capa = document.createElement("div");
    capa.setAttribute("style", CSS.capa);
    capa.setAttribute("data-olitef-capa", "");

    var form = document.createElement("form");
    form.setAttribute("style", CSS.caixa);
    form.setAttribute("novalidate", "novalidate");

    var kicker = document.createElement("div");
    kicker.setAttribute("style", CSS.kicker);
    kicker.textContent = "Arena · Preparação OLITEF";

    var titulo = document.createElement("h1");
    titulo.setAttribute("style", CSS.titulo);
    titulo.textContent = "Quem está estudando?";

    var texto = document.createElement("p");
    texto.setAttribute("style", CSS.texto);
    texto.textContent = "Preencha para abrir o material. Você só faz isso uma vez neste aparelho.";

    var erro = document.createElement("p");
    erro.setAttribute("style", CSS.erro);
    erro.style.display = "none";
    erro.setAttribute("role", "alert");

    function campoTexto(id, rotulo, placeholder, autocomplete) {
      var bloco = document.createElement("div");
      bloco.setAttribute("style", CSS.campo);
      var lab = document.createElement("label");
      lab.setAttribute("style", CSS.rotulo);
      lab.setAttribute("for", id);
      lab.textContent = rotulo;
      var inp = document.createElement("input");
      inp.setAttribute("style", CSS.input);
      inp.id = id; inp.type = "text";
      inp.placeholder = placeholder || "";
      inp.autocomplete = autocomplete || "off";
      bloco.appendChild(lab); bloco.appendChild(inp);
      return { bloco: bloco, input: inp };
    }

    var cNome = campoTexto("aluno-nome", "Nome completo", "como está na chamada", "name");
    var cTurma = campoTexto("aluno-turma", "Turma", "ex.: A, B, Manhã");

    var blocoSerie = document.createElement("div");
    blocoSerie.setAttribute("style", CSS.campo);
    var labSerie = document.createElement("label");
    labSerie.setAttribute("style", CSS.rotulo);
    labSerie.setAttribute("for", "aluno-serie");
    labSerie.textContent = "Série";
    var selSerie = document.createElement("select");
    selSerie.setAttribute("style", CSS.input);
    selSerie.id = "aluno-serie";
    var vazia = document.createElement("option");
    vazia.value = ""; vazia.textContent = "escolha a sua série";
    selSerie.appendChild(vazia);
    SERIES.forEach(function (s) {
      var o = document.createElement("option");
      o.value = s; o.textContent = s;
      selSerie.appendChild(o);
    });
    blocoSerie.appendChild(labSerie); blocoSerie.appendChild(selSerie);

    var botao = document.createElement("button");
    botao.setAttribute("style", CSS.botao);
    botao.type = "submit";
    botao.textContent = "Entrar no material";

    var rodape = document.createElement("p");
    rodape.setAttribute("style", CSS.rodape);
    rodape.textContent = "Estes dados são usados apenas pelo professor para acompanhar quem está estudando. Material do Prof. Rodolfo C Pinheiro — Arena.";

    form.appendChild(kicker); form.appendChild(titulo); form.appendChild(texto);
    form.appendChild(erro);
    form.appendChild(cNome.bloco); form.appendChild(blocoSerie); form.appendChild(cTurma.bloco);
    form.appendChild(botao); form.appendChild(rodape);
    capa.appendChild(form);

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      /* Capitaliza o nome para a planilha sair legível, respeitando as
       * partículas que ficam em minúscula em nomes brasileiros. */
      var minusculas = ["de", "da", "do", "das", "dos", "e"];
      var nome = cNome.input.value.trim().replace(/\s+/g, " ").toLowerCase()
        .split(" ")
        .map(function (p, i) {
          if (i > 0 && minusculas.indexOf(p) >= 0) return p;
          return p.charAt(0).toUpperCase() + p.slice(1);
        })
        .join(" ");
      var serie = selSerie.value;
      var turma = cTurma.input.value.trim().toUpperCase();

      if (nome.split(" ").length < 2) {
        erro.textContent = "Escreva seu nome e sobrenome.";
        erro.style.display = "block"; cNome.input.focus(); return;
      }
      if (!serie) {
        erro.textContent = "Escolha a sua série.";
        erro.style.display = "block"; selSerie.focus(); return;
      }
      if (!turma) {
        erro.textContent = "Informe a sua turma.";
        erro.style.display = "block"; cTurma.input.focus(); return;
      }

      var aluno = { nome: nome, serie: serie, turma: turma, desde: new Date().toISOString() };
      try { window.localStorage.setItem(CHAVE, JSON.stringify(aluno)); } catch (e) { /* segue sem lembrar */ }
      registrar(aluno, "primeiro acesso");

      document.querySelectorAll("[data-olitef-capa]").forEach(function (el) { el.remove(); });
      document.documentElement.style.overflow = "";
    });

    document.documentElement.style.overflow = "hidden";
    document.body.appendChild(capa);
    revelar();
    cNome.input.focus();
  }

  if (document.body) montar();
  else document.addEventListener("DOMContentLoaded", montar);
})();
