/* ============================================================
   PROJETO INTEGRADOR CEP — 3º TRI 2026
   Script principal: simuladores, calculadora e gráfico comparativo
   ============================================================ */

/* ============ ACESSIBILIDADE ============ */
function toggleContraste() {
  document.body.classList.toggle('alto-contraste');
}
function toggleDislexia() {
  document.body.classList.toggle('dislexia');
}
let tamanhoFonte = 16;
function aumentarFonte() {
  if (tamanhoFonte < 24) {
    tamanhoFonte += 2;
    document.documentElement.style.setProperty('--tamanho-base', tamanhoFonte + 'px');
  }
}
function diminuirFonte() {
  if (tamanhoFonte > 12) {
    tamanhoFonte -= 2;
    document.documentElement.style.setProperty('--tamanho-base', tamanhoFonte + 'px');
  }
}

/* ============ UTIL: comprimento de onda -> cor RGB ============ */
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

/* ============ SIMULADOR 1: DIFRAÇÃO ============ */
const canvasD = document.getElementById('canvasDifracao');
const ctxD = canvasD.getContext('2d');
const lambdaSlider = document.getElementById('lambda');
const fendaSlider = document.getElementById('fenda');
const valorLambda = document.getElementById('valorLambda');
const valorFenda = document.getElementById('valorFenda');

function desenharDifracao() {
  const w = canvasD.width, h = canvasD.height;
  ctxD.fillStyle = '#001a33';
  ctxD.fillRect(0,0,w,h);
  
  const lambda = +lambdaSlider.value;
  const fenda = +fendaSlider.value;
  valorLambda.textContent = lambda;
  valorFenda.textContent = fenda;
  
  const cor = lambdaParaCor(lambda);
  
  // Fenda
  ctxD.fillStyle = '#333';
  ctxD.fillRect(w/2 - 4, 0, 8, h/2 - 20);
  ctxD.fillRect(w/2 - 4, h/2 + 20, 8, h/2 - 20);
  ctxD.fillStyle = cor;
  ctxD.fillRect(w/2 - 2, h/2 - 20, 4, 40);
  
  // Padrão de difração (sinc²)
  for (let x = 0; x < w; x++) {
    const dx = x - w/2;
    const theta = dx / (w/2);
    const u = Math.PI * Math.sin(theta) * (fenda*1e-6) / (lambda*1e-9) * 0.3;
    const sinc = u===0 ? 1 : Math.sin(u)/u;
    const I = sinc*sinc;
    const altura = I * h * 0.8;
    ctxD.fillStyle = cor;
    ctxD.globalAlpha = I;
    ctxD.fillRect(x, h - altura, 1, altura);
  }
  ctxD.globalAlpha = 1;
  
  ctxD.fillStyle = '#fff';
  ctxD.font = '14px Poppins';
  ctxD.fillText(`λ = ${lambda} nm | fenda = ${fenda} µm`, 10, 20);
}
lambdaSlider.addEventListener('input', desenharDifracao);
fendaSlider.addEventListener('input', desenharDifracao);
desenharDifracao();

/* ============ SIMULADOR 2: PRISMA ============ */
const canvasP = document.getElementById('canvasPrisma');
const ctxP = canvasP.getContext('2d');
const intSlider = document.getElementById('intensidade');
const valorInt = document.getElementById('valorIntensidade');

function desenharPrisma() {
  const w = canvasP.width, h = canvasP.height;
  ctxP.fillStyle = '#001a33';
  ctxP.fillRect(0,0,w,h);
  
  const intens = +intSlider.value / 100;
  valorInt.textContent = intSlider.value;
  
  // Raio branco
  ctxP.strokeStyle = `rgba(255,255,255,${intens})`;
  ctxP.lineWidth = 4;
  ctxP.beginPath();
  ctxP.moveTo(30, h/2);
  ctxP.lineTo(200, h/2);
  ctxP.stroke();
  
  // Prisma
  ctxP.fillStyle = 'rgba(200,230,255,0.4)';
  ctxP.strokeStyle = '#fff';
  ctxP.lineWidth = 2;
  ctxP.beginPath();
  ctxP.moveTo(200, h/2 - 60);
  ctxP.lineTo(300, h/2 + 60);
  ctxP.lineTo(200, h/2 + 60);
  ctxP.closePath();
  ctxP.fill();
  ctxP.stroke();
  
  // Raios coloridos
  const cores = [
    {l:400}, {l:450}, {l:500}, {l:550}, {l:600}, {l:650}, {l:700}
  ];
  cores.forEach((c,i) => {
    const ang = (i - 3) * 4;
    ctxP.strokeStyle = lambdaParaCor(c.l);
    ctxP.globalAlpha = intens;
    ctxP.lineWidth = 3;
    ctxP.beginPath();
    ctxP.moveTo(260, h/2);
    ctxP.lineTo(w - 20, h/2 + ang*6);
    ctxP.stroke();
  });
  ctxP.globalAlpha = 1;
  
  ctxP.fillStyle = '#fff';
  ctxP.font = '14px Poppins';
  ctxP.fillText('Luz branca → dispersão em cores', 10, 20);
}
intSlider.addEventListener('input', desenharPrisma);
desenharPrisma();

/* ============ SIMULADOR 3: CORPO NEGRO (PLANCK) ============ */
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
  ctxB.fillStyle = '#001a33';
  ctxB.fillRect(0,0,w,ht);
  
  const T = +tempSlider.value;
  valorTemp.textContent = T;
  
  const lambdaMax = 2.898e-3 / T;
  const lambdaMaxNm = lambdaMax * 1e9;
  
  // Eixos
  ctxB.strokeStyle = '#fff';
  ctxB.lineWidth = 1;
  ctxB.beginPath();
  ctxB.moveTo(50, ht-30);
  ctxB.lineTo(w-20, ht-30);
  ctxB.moveTo(50, ht-30);
  ctxB.lineTo(50, 20);
  ctxB.stroke();
  
  ctxB.fillStyle = '#fff';
  ctxB.font = '12px Poppins';
  ctxB.fillText('λ (nm)', w-60, ht-10);
  ctxB.fillText('B(λ,T)', 5, 15);
  
  // Calcular curva
  const lambdaMin = 100e-9, lambdaMaxR = 3000e-9;
  let Bmax = 0;
  const pontos = [];
  for (let i = 0; i < 300; i++) {
    const lam = lambdaMin + (lambdaMaxR - lambdaMin) * i/299;
    const B = planck(lam, T);
    if (B > Bmax) Bmax = B;
    pontos.push({lam, B});
  }
  
  // Desenhar curva
  ctxB.strokeStyle = lambdaParaCor(Math.max(380, Math.min(750, lambdaMaxNm)));
  ctxB.lineWidth = 3;
  ctxB.beginPath();
  pontos.forEach((p,i) => {
    const x = 50 + (w-70) * (p.lam - lambdaMin)/(lambdaMaxR - lambdaMin);
    const y = ht - 30 - (ht-50) * (p.B / Bmax);
    if (i===0) ctxB.moveTo(x,y); else ctxB.lineTo(x,y);
  });
  ctxB.stroke();
  
  // Marcar pico
  const xPico = 50 + (w-70) * (lambdaMax - lambdaMin)/(lambdaMaxR - lambdaMin);
  ctxB.fillStyle = '#ff0';
  ctxB.beginPath();
  ctxB.arc(xPico, ht-30 - (ht-50), 5, 0, 2*Math.PI);
  ctxB.fill();
  
  // Escala λ
  for (let l = 500; l <= 2500; l += 500) {
    const x = 50 + (w-70) * (l*1e-9 - lambdaMin)/(lambdaMaxR - lambdaMin);
    ctxB.fillStyle = '#fff';
    ctxB.fillText(l, x-10, ht-15);
  }
  
  corPico.innerHTML = `λ<sub>máx</sub> ≈ ${Math.round(lambdaMaxNm)} nm | Cor aparente: <span style="color:${lambdaParaCor(Math.max(380,Math.min(750,lambdaMaxNm)))}">●</span>`;
}
tempSlider.addEventListener('input', desenharPlanck);
desenharPlanck();

/* ============ 🆕 SIMULADOR 4: GRÁFICO COMPARATIVO ============ */
const canvasComp = document.getElementById('canvasComparativo');
const ctxComp = canvasComp.getContext('2d');
const chkLampada = document.getElementById('chkLampada');
const chkSol = document.getElementById('chkSol');
const chkEstrela = document.getElementById('chkEstrela');

function desenharComparativo() {
  const w = canvasComp.width, ht = canvasComp.height;
  ctxComp.fillStyle = '#001a33';
  ctxComp.fillRect(0,0,w,ht);
  
  const corpos = [];
  if (chkLampada.checked) corpos.push({T:2800, cor:'#ff6b35', nome:'Lâmpada 2800K'});
  if (chkSol.checked)     corpos.push({T:5800, cor:'#ffd60a', nome:'Sol 5800K'});
  if (chkEstrela.checked) corpos.push({T:10000, cor:'#4da6ff', nome:'Estrela 10000K'});
  
  // Eixos
  ctxComp.strokeStyle = '#fff';
  ctxComp.lineWidth = 1;
  ctxComp.beginPath();
  ctxComp.moveTo(50, ht-40);
  ctxComp.lineTo(w-20, ht-40);
  ctxComp.moveTo(50, ht-40);
  ctxComp.lineTo(50, 20);
  ctxComp.stroke();
  
  ctxComp.fillStyle = '#fff';
  ctxComp.font = '12px Poppins';
  ctxComp.fillText('λ (nm)', w-60, ht-20);
  ctxComp.fillText('B(λ,T)', 5, 15);
  
  // Escala λ
  for (let l = 500; l <= 2500; l += 500) {
    const lambdaMin = 100e-9, lambdaMaxR = 3000e-9;
    const x = 50 + (w-70) * (l*1e-9 - lambdaMin)/(lambdaMaxR - lambdaMin);
    ctxComp.fillStyle = '#fff';
    ctxComp.fillText(l, x-10, ht-25);
  }
  
  // Faixa do visível (380-750 nm)
  const lambdaMin = 100e-9, lambdaMaxR = 3000e-9;
  const xVis1 = 50 + (w-70) * (380e-9 - lambdaMin)/(lambdaMaxR - lambdaMin);
  const xVis2 = 50 + (w-70) * (750e-9 - lambdaMin)/(lambdaMaxR - lambdaMin);
  ctxComp.fillStyle = 'rgba(255,255,255,0.1)';
  ctxComp.fillRect(xVis1, 20, xVis2-xVis1, ht-60);
  ctxComp.fillStyle = '#aaa';
  ctxComp.font = '10px Poppins';
  ctxComp.fillText('VISÍVEL', (xVis1+xVis2)/2 - 20, 35);
  
  // Desenhar cada curva
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
  
  // Normalizar e desenhar
  curvas.forEach(c => {
    ctxComp.strokeStyle = c.cor;
    ctxComp.lineWidth = 3;
    ctxComp.beginPath();
    c.pontos.forEach((p,i) => {
      const x = 50 + (w-70) * (p.lam - lambdaMin)/(lambdaMaxR - lambdaMin);
      const y = ht - 40 - (ht-60) * (p.B / BglobalMax);
      if (i===0) ctxComp.moveTo(x,y); else ctxComp.lineTo(x,y);
    });
    ctxComp.stroke();
    
    // Marcar pico
    const lambdaMax = 2.898e-3 / c.T;
    const xPico = 50 + (w-70) * (lambdaMax - lambdaMin)/(lambdaMaxR - lambdaMin);
    const yPico = ht - 40 - (ht-60) * (c.Bmax / BglobalMax);
    ctxComp.fillStyle = c.cor;
    ctxComp.beginPath();
    ctxComp.arc(xPico, yPico, 5, 0, 2*Math.PI);
    ctxComp.fill();
    
    // Legenda no gráfico
    ctxComp.fillStyle = c.cor;
    ctxComp.font = 'bold 12px Poppins';
    ctxComp.fillText(c.nome, xPico + 8, yPico - 5);
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
  
  // Céu
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
  
  // Sol
  const xSol = w * (hora-6)/12;
  const ySol = ht/2 - Math.sin((hora-6)/12 * Math.PI) * ht/3;
  ctxPis.fillStyle = '#ffd60a';
  ctxPis.beginPath();
  ctxPis.arc(xSol, ySol, 25, 0, 2*Math.PI);
  ctxPis.fill();
  
  // Piscina
  ctxPis.fillStyle = '#0077b6';
  ctxPis.fillRect(50, ht/2, w-100, ht/2 - 20);
  
  // Ondas animadas
  ctxPis.strokeStyle = 'rgba(255,255,255,0.5)';
  ctxPis.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctxPis.beginPath();
    for (let x = 60; x < w-60; x += 5) {
      const y = ht/2 + 10 + i*15 + Math.sin(x/20 + Date.now()/500)*3;
      if (x===60) ctxPis.moveTo(x,y); else ctxPis.lineTo(x,y);
    }
    ctxPis.stroke();
  }
  
  // Temperatura estimada
  const Tbase = 20;
  const ganho = (irrad / 1000) * Math.sin((hora-6)/12 * Math.PI) * 12;
  const Tfinal = (Tbase + ganho).toFixed(1);
  
  ctxPis.fillStyle = '#fff';
  ctxPis.font = 'bold 16px Poppins';
  ctxPis.fillText(`T da água: ${Tfinal}°C`, 70, ht - 30);
  ctxPis.fillText(`${hora}h | ${irrad} W/m²`, 70, ht - 50);
  
  infoPiscina.innerHTML = `🌡️ Temperatura estimada da piscina: <strong>${Tfinal}°C</strong> | Ideal: 26–28°C`;
}
irradSlider.addEventListener('input', desenharPiscina);
horaSlider.addEventListener('input', desenharPiscina);
setInterval(desenharPiscina, 500);
desenharPiscina();

/* ============ 🆕 CALCULADORA DE ECONOMIA ENERGÉTICA ============ */
const btnCalcular = document.getElementById('btnCalcular');
const resultadoCalc = document.getElementById('resultadoCalc');
const calcResultados = document.querySelector('.calc-resultados');

btnCalcular.addEventListener('click', calcularEconomia);

function calcularEconomia() {
  // Ler inputs
  const V = parseFloat(document.getElementById('calcVolume').value);          // m³
  const T_atual = parseFloat(document.getElementById('calcTempAtual').value); // °C
  const T_desejada = parseFloat(document.getElementById('calcTempDesejada').value); // °C
  const area = parseFloat(document.getElementById('calcArea').value);         // m²
  const eficiencia = parseFloat(document.getElementById('calcEficiencia').value) / 100;
  const horasSol = parseFloat(document.getElementById('calcHorasSol').value); // h/dia
  const irrad = parseFloat(document.getElementById('calcIrrad').value);       // W/m²
  const custoKwh = parseFloat(document.getElementById('calcCustoKwh').value); // R$/kWh
  
  // Validação
  if (T_desejada <= T_atual) {
    alert('⚠️ A temperatura desejada deve ser maior que a atual!');
    return;
  }
  
  // Física: Q = ρ · V · c · ΔT
  const rho = 1000;        // kg/m³ (densidade da água)
  const c = 4186;          // J/(kg·K) (calor específico da água)
  const deltaT = T_desejada - T_atual;
  
  const Q_joules = rho * V * c * deltaT;           // Energia total em Joules
  const Q_kwh = Q_joules / 3.6e6;                  // Converter para kWh
  
  // Energia solar captada por dia (em kWh)
  // E_solar = irradiação (W/m²) × área (m²) × horas × eficiência / 1000
  const E_solar_diaria = (irrad * area * horasSol * eficiencia) / 1000; // kWh/dia
  
  // Tempo para aquecer com solar (dias)
  const dias_para_aquecer = Q_kwh / E_solar_diaria;
  
  // Economia mensal (considerando manutenção da temperatura)
  // Perdas diárias estimadas: ~1°C por dia sem cobertura → repôr com ΔT = 1°C
  const Q_perda_diaria = (rho * V * c * 1) / 3.6e6; // kWh para repor 1°C
  const E_solar_mensal = E_solar_diaria * 30;       // kWh/mês
  const Q_perda_mensal = Q_perda_diaria * 30;       // kWh/mês necessários
  
  // Fração solar (quanto do aquecimento é coberto pelo sol)
  const fracao_solar = Math.min(1, E_solar_mensal / Q_perda_mensal);
  const economia_mensal_kwh = Q_perda_mensal * fracao_solar;
  const economia_mensal_r$ = economia_mensal_kwh * custoKwh;
  
  // CO₂ evitado (fator: 0,1 kg CO₂/kWh no Brasil - média)
  const co2_evitado = economia_mensal_kwh * 0.1;
  
  // Exibir resultados
  resultadoCalc.hidden = false;
  calcResultados.innerHTML = `
    <div class="calc-card">
      <span class="unidade">Energia para aquecer</span>
      <span class="numero">${Q_kwh.toFixed(1)}</span>
      <span class="unidade">kWh (uma vez)</span>
    </div>
    <div class="calc-card">
      <span class="unidade">Tempo com energia solar</span>
      <span class="numero">${dias_para_aquecer.toFixed(1)}</span>
      <span class="unidade">dias</span>
    </div>
    <div class="calc-card">
      <span class="unidade">Energia solar captada/dia</span>
      <span class="numero">${E_solar_diaria.toFixed(2)}</span>
      <span class="unidade">kWh/dia</span>
    </div>
    <div class="calc-card">
      <span class="unidade">Fração solar da manutenção</span>
      <span class="numero">${(fracao_solar*100).toFixed(0)}</span>
      <span class="unidade">% do aquecimento</span>
    </div>
    <div class="calc-card destaque">
      <span class="unidade">💰 Economia mensal</span>
      <span class="numero">R$ ${economia_mensal_r$.toFixed(2)}</span>
      <span class="unidade">${economia_mensal_kwh.toFixed(1)} kWh/mês</span>
    </div>
    <div class="calc-card destaque">
      <span class="unidade">💰 Economia anual</span>
      <span class="numero">R$ ${(economia_mensal_r$*12).toFixed(2)}</span>
      <span class="unidade">${(economia_mensal_kwh*12).toFixed(1)} kWh/ano</span>
    </div>
    <div class="calc-card">
      <span class="unidade">🌱 CO₂ evitado/ano</span>
      <span class="numero">${(co2_evitado*12).toFixed(1)}</span>
      <span class="unidade">kg de CO₂</span>
    </div>
    <div class="calc-card">
      <span class="unidade">🌳 Equivalente em árvores</span>
      <span class="numero">${((co2_evitado*12)/22).toFixed(1)}</span>
      <span class="unidade">árvores plantadas/ano</span>
    </div>
  `;
  
  resultadoCalc.scrollIntoView({behavior: 'smooth', block: 'center'});
}