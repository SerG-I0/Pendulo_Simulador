// --- Variables físicas ---
const g = 9.81;

// --- Estado ---
let running = false;
let t = 0;
const dt = 0.02;

// --- Canvas y soporte ---
let xSupport, ySupport;
let pxScale;

// --- Alturas y dimensiones ---
const pilarAltura = 400;    // Reducido para compactar
const pilarAncho = 20;
const baseAltura = 35;
const baseAncho = 350;
const brazoAltura = 12;
const brazoAncho = 160;

// --- Referencias sliders y valores ---
const lengthSlider = document.getElementById("lengthSlider");
const angleSlider = document.getElementById("angleSlider");
const massSlider = document.getElementById("massSlider");

const lengthValue = document.getElementById("lengthValue");
const angleValue = document.getElementById("angleValue");
const massValue = document.getElementById("massValue");

const startBtn = document.getElementById("startBtn");
const stopBtn  = document.getElementById("stopBtn");

startBtn.addEventListener("click", startPendulum);
stopBtn.addEventListener("click", stopPendulum);

function setup() {
  const canvas = createCanvas(900, 600); // más ancho, menos alto para que todo quepa
  canvas.parent("canvas-container");
  angleMode(RADIANS);
  noStroke();

  // Soporte superior
  ySupport = 100;
  xSupport = width / 2 + 50;

  // Inicializar relleno de sliders
  updateSliderFill(lengthSlider);
  updateSliderFill(angleSlider);
  updateSliderFill(massSlider);

  // Eventos para actualizar relleno dinámico
  lengthSlider.addEventListener("input", () => updateSliderFill(lengthSlider));
  angleSlider.addEventListener("input", () => updateSliderFill(angleSlider));
  massSlider.addEventListener("input", () => updateSliderFill(massSlider));
}

function draw() {
  background("#f6f6f6");
  drawStructure();

  // Leer valores
  let L = parseFloat(lengthSlider.value);
  let theta0 = parseFloat(angleSlider.value) * Math.PI / 180;
  let mass = parseFloat(massSlider.value);

  lengthValue.textContent = L.toFixed(2);
  angleValue.textContent = angleSlider.value;
  massValue.textContent = mass.toFixed(2);

  // Escala vertical automática para que la bola toque base
  const Lmax = 6; // longitud máxima
  pxScale = (pilarAltura - baseAltura) / Lmax; // ajustar para que toque base

  let theta = running ? theta0 * Math.cos(Math.sqrt(g / L) * t) : theta0;

  let x = xSupport + L * pxScale * Math.sin(theta);
  let y = ySupport + L * pxScale * Math.cos(theta);

  // Cuerda
  stroke(90);
  strokeWeight(2.4);
  line(xSupport, ySupport, x, y);

  // Bola
  noStroke();
  let r = 10 * Math.sqrt(mass);
  fill("#7b1e26");
  circle(x, y, r * 2);

  // Sombra
  fill(255, 255, 255, 70);
  circle(x - 0.15 * r, y - 0.15 * r, 1.3 * r);

  if (running) t += dt;

  // Período
  if (running) {
    let T = 2 * Math.PI * Math.sqrt(L / g);
    fill("#2e3b4e");
    stroke("#1a2230");
    strokeWeight(1.5);
    rectMode(CENTER);
    rect(width / 2, 50, 180, 50, 10);
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(18);
    text(`Período: ${T.toFixed(2)} s`, width / 2, 50);
  }
}

function drawStructure() {
  push();
  rectMode(CENTER);

  // Pilar
  fill("#8a8a8a");
  stroke("#000");
  strokeWeight(1.5);
  rect(width / 2, ySupport + pilarAltura / 2, pilarAncho, pilarAltura);

  // Base pegada al pilar
  fill("#333");
  noStroke();
  rect(width / 2, ySupport + pilarAltura + baseAltura / 2, baseAncho, baseAltura, 6);

  // Brazo horizontal pegado al pilar
  fill("#777");
  stroke("#000");
  strokeWeight(1.5);
  rectMode(CORNER);
  rect(width / 2, ySupport - brazoAltura / 2, brazoAncho, brazoAltura);
  rectMode(CENTER);

  // Pivote
  noStroke();
  fill("#444");
  circle(xSupport, ySupport, 12);

  pop();
}

// --- Bloqueo/desbloqueo sliders ---
function startPendulum() {
  if (!running) {
    running = true;
    t = 0;
    lengthSlider.disabled = true;
    angleSlider.disabled = true;
    massSlider.disabled = true;
  }
}

function stopPendulum() {
  running = false;
  t = 0;
  lengthSlider.disabled = false;
  angleSlider.disabled = false;
  massSlider.disabled = false;
}

// --- Actualizar relleno dinámico ---
function updateSliderFill(slider) {
  const val = slider.value;
  const min = slider.min;
  const max = slider.max;
  const percent = ((val - min) / (max - min)) * 100;
  const color = slider.id === "lengthSlider" ? "#4c72b0" :
                slider.id === "angleSlider"  ? "#55a868" :
                                               "#c44e52";
  slider.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${percent}%, #ddd ${percent}%, #ddd 100%)`;
}

