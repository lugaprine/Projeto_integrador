/* ============================================================
   PROJETO INTEGRADOR CEP — 3º TRI 2026
   Lucas Felipe (20) • Marco Antônio (23) • Mateus Tessari (25)
   ============================================================ */

/* ============ ACESSIBILIDADE ============ */
function toggleContraste() {
  document.body.classList.toggle('alto-contraste');
  if (document.body.classList.contains('alto-contraste')) {
    document.body.classList.remove('dark-mode');
  }
  mostrarToast('Alto contraste ' + (document.body.classList.contains('alto-contraste') ? 'ativado' : 'desativado'));
}

function toggleDislexia() {
  document.body.classList.toggle('dislexia');
  event.target.classList.toggle('ativo');
  mostrarToast('Fonte para dislexia ' + (document.body.classList.contains('dislexia') ? 'ativada' : 'desativada'));
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const btn = document.getElementById('btnDark');
  const ativo = document.body.classList.contains('dark-mode');
  btn.textContent = ativo ? '☀️ Claro' : '🌙 Escuro';
  btn.classList.toggle('ativo', ativo);
  if (ativo) document.body.classList.remove('alto-contraste');
  localStorage.setItem('darkMode', ativo ? '1' : '0');
  mostrarToast('Modo ' + (ativo ? 'escuro' : 'claro') + ' ativado');
}

if (localStorage.getItem('darkMode') === '1') {
  document.body.classList.add('dark-mode');
  window.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btnDark');
    if (btn) { btn.textContent = '☀️ Claro'; btn.classList.add('ativo'); }
  });
}

let tamanhoFonte = 16;
function aumentarFonte() {
  if (tamanhoFonte < 24) {
    tamanhoFonte += 2;
    document.documentElement.style.setProperty('--tamanho-base', tamanhoFonte + 'px');
    mostrarToast('Fonte: ' + tamanhoFonte + 'px');
  }
}
function diminuirFonte() {
  if (tamanhoFonte > 12) {
    tamanhoFonte -= 2;
    document.documentElement.style.setProperty('--tamanho-base', tamanhoFonte + 'px');
    mostrarToast('Fonte: ' + tamanhoFonte + 'px');
  }
}

/* ============ NARRAÇÃO ============ */
let narracaoAtiva = false;
let utteranceAtual = null;

function toggleNarracao() {
  if (!('speechSynthesis' in window)) {
    mostrarToast('⚠️ Seu navegador não suporta narração');
    return;
  }
  narracaoAtiva = !narracaoAtiva;
  const btn = document.getElementById('btnNarracao');
  btn.classList.toggle('ativo', narracaoAtiva);
  
  if (narracaoAtiva) {
    btn.textContent = '🔊 Narrando...';
    narrarProximaSecao();
    mostrarToast('🔊 Narração iniciada');
  } else {
    btn.textContent = '🔊 Narrar';
    window.speechSynthesis.cancel();
    mostrarToast('⏹️ Narração pausada');
  }
}

function pararNarracao() {
  narracaoAtiva = false;
  window.speechSynthesis.cancel();
  const btn = document.getElementById('btnNarracao');
  if (btn) { btn.textContent = '🔊 Narrar'; btn.classList.remove('ativo'); }
  mostrarToast('⏹️ Narração parada');
}

function narrarProximaSecao() {
  if (!narracaoAtiva) return;
  const secoes = document.querySelectorAll('.secao, .hero');
  const secoesArray = Array.from(secoes);
  const scrollY = window.scrollY + 200;
  let proxima = secoesArray.find(s => s.offsetTop > scrollY);
  
  if (!proxima) {
    proxima = secoesArray[0];
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  if (proxima) {
    const texto = proxima.innerText
      .replace(/🎮|🎨|🧮|📊|🔍|💡|🌞|🌱|🏊|🌈|🤖|💻|🎯|🗺️|📱|🔥|💰|🌳|📐|🔬|🌡️|🛰️|☀️|💧|📦|⚡|🕐|👥/g, '')
      .replace(/\s+/g, ' ').trim();
    
    if (texto.length > 10) {
      utteranceAtual = new SpeechSynthesisUtterance(texto.substring(0, 500));
      utteranceAtual.lang = 'pt-BR';
      utteranceAtual.rate = 0.95;
      
      const vozes = window.speechSynthesis.getVoices();
      const vozPt = vozes.find(v => v.lang.startsWith('pt'));
      if (vozPt) utteranceAtual.voice = vozPt;
      
      utteranceAtual.onend = () => {
        if (narracaoAtiva) {
          setTimeout(() => {
            window.scrollTo({ top: proxima.offsetTop - 100, behavior: 'smooth' });
            setTimeout(narrarProximaSecao, 1500);
          }, 500);
        }
      };
      window.speechSynthesis.speak(utteranceAtual);
    }
  }
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

/* ============ TOAST ============ */
function mostrarToast(mensagem) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = mensagem;
  toast.classList.add('visivel');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('visivel'), 2500);
}

/* ============ SCROLL REVEAL ============ */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visivel');
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});

/* ============ HEADER SCROLL ============ */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
});

/* ============ UTIL: λ -> cor RGB ============ */
function lambdaParaCor(lambda) {
  let r=0, g=0, b=0;
  if (lambda>=380 && lambda<440){ r=-(lambda-440)/(440-380); b=1; }
  else if (lambda<490){ g=(lambda-440)/(490-440); b=1; }
  else if (lambda<510){ g=1; b=-(lambda-510)/(510-490); }
  else if (lambda<580){ r=(lambda-510)/(580-510); g=1; }
  else if (lambda<645){ r=1; g=-(lambda-645)/(645-580); }
  else if (lambda<=750){ r=1; }
  return `rgb(${Math.round(r*255)},${Math.round(g*255)},${Math.round(b*255)})`;
}

/* ============ SIMULADOR 1: REFRAÇÃO ============ */
const canvasRef = document.getElementById('canvasRefracao');
const ctxRef = canvasRef.getContext('2d');
const anguloSlider = document.getElementById('angulo');
const meioSelect = document.getElementById('meio');
const valorAngulo = document.getElementById('valorAngulo');

function desenharRefracao() {
  const w = canvasRef.width, h = canvasRef.height;
  ctxRef.clearRect(0,0,w,h);
  
  const grad = ctxRef.createLinearGradient(0,0,0,h);
  grad.addColorStop(0, '#001a33');
  grad.addColorStop(0.5, '#003366');
  grad.addColorStop(1, '#001a33');
  ctxRef.fillStyle = grad;
  ctxRef.fillRect(0,0,w,h);
  
  const anguloInc = +anguloSlider.value;
  const n2 = +meioSelect.value;
  valorAngulo.textContent = anguloInc;
  
  const gradAgua = ctxRef.createLinearGradient(0, h/2, 0, h);
  gradAgua.addColorStop(0, 'rgba(0, 180, 216, 0.3)');
  gradAgua.addColorStop(1, 'rgba(0, 119, 182, 0.5)');
  ctxRef.fillStyle = gradAgua;
  ctxRef.fillRect(0, h/2, w, h/2);
  
  ctxRef.strokeStyle = 'rgba(255,255,255,0.8)';
  ctxRef.lineWidth = 2;
  ctxRef.beginPath();
  ctxRef.moveTo(0, h/2);
  ctxRef.lineTo(w, h/2);
  ctxRef.stroke();
  
  ctxRef.strokeStyle = 'rgba(255,255,255,0.4)';
  ctxRef.setLineDash([5, 5]);
  ctxRef.beginPath();
  ctxRef.moveTo(w/2, 0);
  ctxRef.lineTo(w/2, h);
  ctxRef.stroke();
  ctxRef.setLineDash([]);
  
  const theta1 = anguloInc * Math.PI / 180;
  const xInicio = w/2 - Math.sin(theta1) * h/2;
  
  ctxRef.shadowBlur = 15;
  ctxRef.shadowColor = '#fff';
  ctxRef.strokeStyle = '#fff';
  ctxRef.lineWidth = 4;
  ctxRef.beginPath();
  ctxRef.moveTo(xInicio, 0);
  ctxRef.lineTo(w/2, h/2);
  ctxRef.stroke();
  ctxRef.shadowBlur = 0;
  
  const cores = [
    {nome: 'Vermelho', lambda: 700, n: n2 - 0.012},
    {nome: 'Laranja', lambda: 620, n: n2 - 0.008},
    {nome: 'Amarelo', lambda: 580, n: n2 - 0.005},
    {nome: 'Verde', lambda: 530, n: n2 - 0.002},
    {nome: 'Azul', lambda: 470, n: n2 + 0.004},
    {nome: 'Violeta', lambda: 400, n: n2 + 0.010}
  ];
  
  cores.forEach(cor => {
    const sinTheta2 = Math.sin(theta1) / cor.n;
    if (sinTheta2 <= 1) {
      const theta2 = Math.asin(sinTheta2);
      const xFinal = w/2 + Math.sin(theta2) * h/2;
      
      ctxRef.shadowBlur = 10;
      ctxRef.shadowColor = lambdaParaCor(cor.lambda);
      ctxRef.strokeStyle = lambdaParaCor(cor.lambda);
      ctxRef.lineWidth = 3;
      ctxRef.beginPath();
      ctxRef.moveTo(w/2, h/2);
      ctxRef.lineTo(xFinal, h);
      ctxRef.stroke();
      ctxRef.shadowBlur = 0;
      
      ctxRef.fillStyle = lambdaParaCor(cor.lambda);
      ctxRef.font = 'bold 11px Poppins';
      ctxRef.fillText(`${cor.nome}: ${(theta2 * 180 / Math.PI).toFixed(1)}°`, xFinal - 40, h - 10);
    }
  });
  
  ctxRef.fillStyle = '#fff';
  ctxRef.font = 'bold 14px Poppins';
  ctxRef.fillText(`Ângulo: ${anguloInc}°`, 15, 25);
  ctxRef.fillText(`n₂ = ${n2.toFixed(3)}`, 15, 45);
}
anguloSlider.addEventListener('input', desenharRefracao);
meioSelect.addEventListener('change', desenharRefracao);
desenharRefracao();

/* ============ SIMULADOR 2: PRISMA ============ */
const canvasP = document.getElementById('canvasPrisma');
const ctxP = canvasP.getContext('2d');
const intSlider = document.getElementById('intensidade');
const valorInt = document.getElementById('valorIntensidade');

function desenharPrisma() {
  const w = canvasP.width, h = canvasP.height;
  ctxP.clearRect(0,0,w,h);
  
  const grad = ctxP.createLinearGradient(0,0,w,h);
  grad.addColorStop(0, '#001a33');
  grad.addColorStop(1, '#003366');
  ctxP.fillStyle = grad;
  ctxP.fillRect(0,0,w,h);
  
  const intens = +intSlider.value / 100;
  valorInt.textContent = intSlider.value;
  
  ctxP.shadowBlur = 20;
  ctxP.shadowColor = '#fff';
  ctxP.strokeStyle = `rgba(255,255,255,${intens})`;
  ctxP.lineWidth = 5;
  ctxP.beginPath();
  ctxP.moveTo(30, h/2);
  ctxP.lineTo(200, h/2);
  ctxP.stroke();
  ctxP.shadowBlur = 0;
  
  const gradPrisma = ctxP.createLinearGradient(200, h/2-60, 300, h/2+60);
  gradPrisma.addColorStop(0, 'rgba(200,230,255,0.6)');
  gradPrisma.addColorStop(1, 'rgba(100,180,220,0.4)');
  ctxP.fillStyle = gradPrisma;
  ctxP.strokeStyle = 'rgba(255,255,255,0.8)';
  ctxP.lineWidth = 2;
  ctxP.beginPath();
  ctxP.moveTo(200, h/2 - 60);
  ctxP.lineTo(300, h/2 + 60);
  ctxP.lineTo(200, h/2 + 60);
  ctxP.closePath();
  ctxP.fill();
  ctxP.stroke();
  
  const cores = [{l:400},{l:450},{l:500},{l:550},{l:600},{l:650},{l:700}];
  cores.forEach((c,i) => {
    const ang = (i - 3) * 4;
    const cor = lambdaParaCor(c.l);
    ctxP.shadowBlur = 15;
    ctxP.shadowColor = cor;
    ctxP.strokeStyle = cor;
    ctxP.globalAlpha = intens;
    ctxP.lineWidth = 3;
    ctxP.beginPath();
    ctxP.moveTo(260, h/2);
    ctxP.lineTo(w - 20, h/2 + ang*6);
    ctxP.stroke();
  });
  ctxP.shadowBlur = 0;
  ctxP.globalAlpha = 1;
  
  ctxP.fillStyle = '#fff';
  ctxP.font = 'bold 14px Poppins';
  ctxP.fillText('Dispersão cromática', 10, 25);
}
intSlider.addEventListener('input', desenharPrisma);
desenharPrisma();

/* ============ SIMULADOR 3: PLANCK ============ */
const canvasB = document.getElementById('canvasPlanck');
const ctxB = canvasB.getContext('2d');
const tempSlider = document.getElementById('temp');
const valorTemp = document.getElementById('valorTemp');
const corPico = document.getElementById('corPico');

const h_const = 6.626e-34, c_const = 3e8, k_const = 1.38e-23;

function planck(lambda, T) {
  const exp = Math.exp(h_const*c_const/(lambda*k_const*T));
  return (2*h_const*c_const*c_const/Math.pow(lambda,5)) / (exp - 1);
}

function desenharPlanck() {
  const w = canvasB.width, ht = canvasB.height;
  ctxB.clearRect(0,0,w,ht);
  
  const grad = ctxB.createLinearGradient(0,0,0,ht);
  grad.addColorStop(0, '#001a33');
  grad.addColorStop(1, '#003366');
  ctxB.fillStyle = grad;
  ctxB.fillRect(0,0,w,ht);
  
  const T = +tempSlider.value;
  valorTemp.textContent = T;
  
  const lambdaMax = 2.898e-3 / T;
  const lambdaMaxNm = lambdaMax * 1e9;
  
  ctxB.strokeStyle = 'rgba(255,255,255,0.6)';
  ctxB.lineWidth = 1;
  ctxB.beginPath();
  ctxB.moveTo(50, ht-30);
  ctxB.lineTo(w-20, ht-30);
  ctxB.moveTo(50, ht-30);
  ctxB.lineTo(50, 20);
  ctxB.stroke();
  
  ctxB.fillStyle = 'rgba(255,255,255,0.8)';
  ctxB.font = '12px Poppins';
  ctxB.fillText('λ (nm)', w-60, ht-10);
  ctxB.fillText('B(λ,T)', 5, 15);
  
  const lambdaMin = 100e-9, lambdaMaxR = 3000e-9;
  let Bmax = 0;
  const pontos = [];
  for (let i = 0; i < 300; i++) {
    const lam = lambdaMin + (lambdaMaxR - lambdaMin) * i/299;
    const B = planck(lam, T);
    if (B > Bmax) Bmax = B;
    pontos.push({lam, B});
  }
  
  const corCurva = lambdaParaCor(Math.max(380, Math.min(750, lambdaMaxNm)));
  ctxB.shadowBlur = 15;
  ctxB.shadowColor = corCurva;
  ctxB.strokeStyle = corCurva;
  ctxB.lineWidth = 3;
  ctxB.beginPath();
  pontos.forEach((p,i) => {
    const x = 50 + (w-70) * (p.lam - lambdaMin)/(lambdaMaxR - lambdaMin);
    const y = ht - 30 - (ht-50) * (p.B / Bmax);
    if (i===0) ctxB.moveTo(x,y); else ctxB.lineTo(x,y);
  });
  ctxB.stroke();
  ctxB.shadowBlur = 0;
  
  const xPico = 50 + (w-70) * (lambdaMax - lambdaMin)/(lambdaMaxR - lambdaMin);
  ctxB.shadowBlur = 15;
  ctxB.shadowColor = '#ff0';
  ctxB.fillStyle = '#ff0';
  ctxB.beginPath();
  ctxB.arc(xPico, ht-30 - (ht-50), 6, 0, 2*Math.PI);
  ctxB.fill();
  ctxB.shadowBlur = 0;
  
  for (let l = 500; l <= 2500; l += 500) {
    const x = 50 + (w-70) * (l*1e-9 - lambdaMin)/(lambdaMaxR - lambdaMin);
    ctxB.fillStyle = 'rgba(255,255,255,0.7)';
    ctxB.fillText(l, x-10, ht-15);
  }
  
  corPico.innerHTML = `λ<sub>máx</sub> ≈ ${Math.round(lambdaMaxNm)} nm | Cor: <span style="color:${corCurva}; font-size:1.3rem">●</span>`;
}
tempSlider.addEventListener('input', desenharPlanck);
desenharPlanck();

/* ============ SIMULADOR 4: COMPARATIVO ============ */
const canvasComp = document.getElementById('canvasComparativo');
const ctxComp = canvasComp.getContext('2d');
const chkLampada = document.getElementById('chkLampada');
const chkSol = document.getElementById('chkSol');
const chkEstrela = document.getElementById('chkEstrela');

function desenharComparativo() {
  const w = canvasComp.width, ht = canvasComp.height;
  ctxComp.clearRect(0,0,w,ht);
  
  const grad = ctxComp.createLinearGradient(0,0,0,ht);
  grad.addColorStop(0, '#001a33');
  grad.addColorStop(1, '#003366');
  ctxComp.fillStyle = grad;
  ctxComp.fillRect(0,0,w,ht);
  
  const corpos = [];
  if (chkLampada.checked) corpos.push({T:2800, cor:'#ff6b35', nome:'Lâmpada 2800K'});
  if (chkSol.checked)     corpos.push({T:5800, cor:'#ffd60a', nome:'Sol 5800K'});
  if (chkEstrela.checked) corpos.push({T:10000, cor:'#4da6ff', nome:'Estrela 10000K'});
  
  ctxComp.strokeStyle = 'rgba(255,255,255,0.6)';
  ctxComp.lineWidth = 1;
  ctxComp.beginPath();
  ctxComp.moveTo(50, ht-40);
  ctxComp.lineTo(w-20, ht-40);
  ctxComp.moveTo(50, ht-40);
  ctxComp.lineTo(50, 20);
  ctxComp.stroke();
  
  ctxComp.fillStyle = 'rgba(255,255,255,0.8)';
  ctxComp.font = '12px Poppins';
  ctxComp.fillText('λ (nm)', w-60, ht-20);
  ctxComp.fillText('B(λ,T)', 5, 15);
  
  const lambdaMin = 100e-9, lambdaMaxR = 3000e-9;
  for (let l = 500; l <= 2500; l += 500) {
    const x = 50 + (w-70) * (l*1e-9 - lambdaMin)/(lambdaMaxR - lambdaMin);
    ctxComp.fillStyle = 'rgba(255,255,255,0.7)';
    ctxComp.fillText(l, x-10, ht-25);
  }
  
  const xVis1 = 50 + (w-70) * (380e-9 - lambdaMin)/(lambdaMaxR - lambdaMin);
  const xVis2 = 50 + (w-70) * (750e-9 - lambdaMin)/(lambdaMaxR - lambdaMin);
  const gradVis = ctxComp.createLinearGradient(xVis1, 0, xVis2, 0);
  gradVis.addColorStop(0, 'rgba(138,43,226,0.15)');
  gradVis.addColorStop(0.5, 'rgba(0,255,0,0.15)');
  gradVis.addColorStop(1, 'rgba(255,0,0,0.15)');
  ctxComp.fillStyle = gradVis;
  ctxComp.fillRect(xVis1, 20, xVis2-xVis1, ht-60);
  ctxComp.fillStyle = 'rgba(255,255,255,0.8)';
  ctxComp.font = 'bold 11px Poppins';
  ctxComp.fillText('VISÍVEL', (xVis1+xVis2)/2 - 25, 35);
  
  let BglobalMax = 0;
  const curvas = [];
  
  corpos.forEach(c => {
    let Bmax = 0;
    const pontos = [];
    for (let i = 0; i < 300; i++) {
      const lam = lambdaMin + (lambdaMaxR - lambdaMin) * i/299;
      const B = planck(lam, c.T);
      if (B > Bmax) Bmax = B;
      pontos.push({lam, B});
    }
    if (Bmax > BglobalMax) BglobalMax = Bmax;
    curvas.push({...c, pontos, Bmax});
  });
  
  curvas.forEach(c => {
    ctxComp.shadowBlur = 12;
    ctxComp.shadowColor = c.cor;
    ctxComp.strokeStyle = c.cor;
    ctxComp.lineWidth = 3;
    ctxComp.beginPath();
    c.pontos.forEach((p,i) => {
      const x = 50 + (w-70) * (p.lam - lambdaMin)/(lambdaMaxR - lambdaMin);
      const y = ht - 40 - (ht-60) * (p.B / BglobalMax);
      if (i===0) ctxComp.moveTo(x,y); else ctxComp.lineTo(x,y);
    });
    ctxComp.stroke();
    ctxComp.shadowBlur = 0;
    
    const lambdaMax = 2.898e-3 / c.T;
    const xPico = 50 + (w-70) * (lambdaMax - lambdaMin)/(lambdaMaxR - lambdaMin);
    const yPico = ht - 40 - (ht-60) * (c.Bmax / BglobalMax);
    ctxComp.shadowBlur = 10;
    ctxComp.shadowColor = c.cor;
    ctxComp.fillStyle = c.cor;
    ctxComp.beginPath();
    ctxComp.arc(xPico, yPico, 6, 0, 2*Math.PI);
    ctxComp.fill();
    ctxComp.shadowBlur = 0;
    
    ctxComp.fillStyle = c.cor;
    ctxComp.font = 'bold 12px Poppins';
    ctxComp.fillText(c.nome, xPico + 10, yPico - 5);
  });
}
chkLampada.addEventListener('change', desenharComparativo);
chkSol.addEventListener('change', desenharComparativo);
chkEstrela.addEventListener('change', desenharComparativo);
desenharComparativo();

/* ============ SIMULADOR 5: PISCINA ============ */
const canvasPis = document.getElementById('canvasPiscina');
const ctxPis = canvasPis.getContext('2d');
const irradSlider = document.getElementById('irrad');
const horaSlider = document.getElementById('hora');
const valorIrrad = document.getElementById('valorIrrad');
const valorHora = document.getElementById('valorHora');
const infoPiscina = document.getElementById('infoPiscina');

function desenharPiscina() {
  const w = canvasPis.width, ht = canvasPis.height;
  const irrad = +irradSlider.value;
  const hora = +horaSlider.value;
  valorIrrad.textContent = irrad;
  valorHora.textContent = hora;
  
  const grad = ctxPis.createLinearGradient(0,0,0,ht/2);
  if (hora < 7 || hora > 18) {
    grad.addColorStop(0,'#001a33'); grad.addColorStop(1,'#003366');
  } else if (hora < 9 || hora > 16) {
    grad.addColorStop(0,'#ff9e00'); grad.addColorStop(1,'#87ceeb');
  } else {
    grad.addColorStop(0,'#4da6ff'); grad.addColorStop(1,'#87ceeb');
  }
  ctxPis.fillStyle = grad;
  ctxPis.fillRect(0,0,w,ht/2);
  
  const xSol = w * (hora-6)/12;
  const ySol = ht/2 - Math.sin((hora-6)/12 * Math.PI) * ht/3;
  ctxPis.shadowBlur = 30;
  ctxPis.shadowColor = '#ffd60a';
  ctxPis.fillStyle = '#ffd60a';
  ctxPis.beginPath();
  ctxPis.arc(xSol, ySol, 25, 0, 2*Math.PI);
  ctxPis.fill();
  ctxPis.shadowBlur = 0;
  
  const gradPisc = ctxPis.createLinearGradient(0, ht/2, 0, ht);
  gradPisc.addColorStop(0, '#00b4d8');
  gradPisc.addColorStop(1, '#0077b6');
  ctxPis.fillStyle = gradPisc;
  ctxPis.fillRect(50, ht/2, w-100, ht/2 - 20);
  
  ctxPis.strokeStyle = 'rgba(255,255,255,0.6)';
  ctxPis.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctxPis.beginPath();
    for (let x = 60; x < w-60; x += 5) {
      const y = ht/2 + 10 + i*15 + Math.sin(x/20 + Date.now()/500)*3;
      if (x===60) ctxPis.moveTo(x,y); else ctxPis.lineTo(x,y);
    }
    ctxPis.stroke();
  }
  
  const Tbase = 20;
  const ganho = (irrad / 1000) * Math.sin((hora-6)/12 * Math.PI) * 12;
  const Tfinal = (Tbase + ganho).toFixed(1);
  
  ctxPis.fillStyle = '#fff';
  ctxPis.font = 'bold 16px Poppins';
  ctxPis.shadowBlur = 5;
  ctxPis.shadowColor = 'rgba(0,0,0,0.5)';
  ctxPis.fillText(`T: ${Tfinal}°C`, 70, ht - 30);
  ctxPis.fillText(`${hora}h | ${irrad} W/m²`, 70, ht - 50);
  ctxPis.shadowBlur = 0;
  
  infoPiscina.innerHTML = `🌡️ Temperatura estimada: <strong>${Tfinal}°C</strong> | Ideal: 26–28°C`;
}
irradSlider.addEventListener('input', desenharPiscina);
horaSlider.addEventListener('input', desenharPiscina);
setInterval(desenharPiscina, 500);
desenharPiscina();

/* ============ CALCULADORA ============ */
const btnCalcular = document.getElementById('btnCalcular');
const resultadoCalc = document.getElementById('resultadoCalc');
const calcResultados = document.querySelector('.calc-resultados');

btnCalcular.addEventListener('click', calcularEconomia);

function calcularEconomia() {
  const V = parseFloat(document.getElementById('calcVolume').value);
  const T_atual = parseFloat(document.getElementById('calcTempAtual').value);
  const T_desejada = parseFloat(document.getElementById('calcTempDesejada').value);
  const area = parseFloat(document.getElementById('calcArea').value);
  const eficiencia = parseFloat(document.getElementById('calcEficiencia').value) / 100;
  const horasSol = parseFloat(document.getElementById('calcHorasSol').value);
  const irrad = parseFloat(document.getElementById('calcIrrad').value);
  const custoKwh = parseFloat(document.getElementById('calcCustoKwh').value);
  
  if (T_desejada <= T_atual) {
    mostrarToast('⚠️ Temperatura desejada deve ser maior que a atual!');
    return;
  }
  
  const rho = 1000, c = 4186;
  const deltaT = T_desejada - T_atual;
  const Q_joules = rho * V * c * deltaT;
  const Q_kwh = Q_joules / 3.6e6;
  
  const E_solar_diaria = (irrad * area * horasSol * eficiencia) / 1000;
  const dias_para_aquecer = Q_kwh / E_solar_diaria;
  
  const Q_perda_diaria = (rho * V * c * 1) / 3.6e6;
  const E_solar_mensal = E_solar_diaria * 30;
  const Q_perda_mensal = Q_perda_diaria * 30;
  
  const fracao_solar = Math.min(1, E_solar_mensal / Q_perda_mensal);
  const economia_mensal_kwh = Q_perda_mensal * fracao_solar;
  const economia_mensal_r$ = economia_mensal_kwh * custoKwh;
  const co2_evitado = economia_mensal_kwh * 0.1;
  
  resultadoCalc.hidden = false;
  calcResultados.innerHTML = `
    <div class="calc-card"><span class="unidade">Energia para aquecer</span><span class="numero">${Q_kwh.toFixed(1)}</span><span class="unidade">kWh (uma vez)</span></div>
    <div class="calc-card"><span class="unidade">Tempo com solar</span><span class="numero">${dias_para_aquecer.toFixed(1)}</span><span class="unidade">dias</span></div>
    <div class="calc-card"><span class="unidade">Solar captada/dia</span><span class="numero">${E_solar_diaria.toFixed(2)}</span><span class="unidade">kWh/dia</span></div>
    <div class="calc-card"><span class="unidade">Fração solar</span><span class="numero">${(fracao_solar*100).toFixed(0)}</span><span class="unidade">% do aquecimento</span></div>
    <div class="calc-card destaque"><span class="unidade">💰 Economia mensal</span><span class="numero">R$ ${economia_mensal_r$.toFixed(2)}</span><span class="unidade">${economia_mensal_kwh.toFixed(1)} kWh/mês</span></div>
    <div class="calc-card destaque"><span class="unidade">💰 Economia anual</span><span class="numero">R$ ${(economia_mensal_r$*12).toFixed(2)}</span><span class="unidade">${(economia_mensal_kwh*12).toFixed(1)} kWh/ano</span></div>
    <div class="calc-card"><span class="unidade">🌱 CO₂ evitado/ano</span><span class="numero">${(co2_evitado*12).toFixed(1)}</span><span class="unidade">kg de CO₂</span></div>
    <div class="calc-card"><span class="unidade">🌳 Árvores equivalentes</span><span class="numero">${((co2_evitado*12)/22).toFixed(1)}</span><span class="unidade">árvores/ano</span></div>
  `;
  
  resultadoCalc.scrollIntoView({behavior: 'smooth', block: 'center'});
  mostrarToast('✅ Cálculo concluído!');
}