// --- Variables físicas ---
const g = 9.81;

// --- Estado ---
let running = false;
let t = 0;
const dt = 0.02;

// --- Canvas y soporte ---
let xSupport, ySupport;
let pxScale;

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
  const canvas = createCanvas(700, 900);
  canvas.parent("canvas-container");
  angleMode(RADIANS);
  noStroke();

  // Ajuste compacto
  ySupport = 150;
  xSupport = width / 2 + 70;
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

  // Escala vertical automática
  pxScale = (height - 300 - 20) / 6; // 6 m máximo, 20 px margen

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
    rect(width / 2, 60, 180, 50, 10);
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(18);
    text(`Período: ${T.toFixed(2)} s`, width / 2, 60);
  }
}

function drawStructure() {
  push();
  rectMode(CENTER);

  // Base
  noStroke();
  fill("#333");
  rect(width / 2, height - 80, 350, 35, 6);

  // Pilar
  fill("#8a8a8a");
  stroke("#000");
  strokeWeight(1.5);
  rect(width / 2, ySupport + 260, 20, 520);

  // Brazo horizontal
  fill("#777");
  stroke("#000");
  strokeWeight(1.5);
  rect(width / 2 + 10, ySupport, 160, 12, 3);

  // Pivote
  noStroke();
  fill("#444");
  circle(xSupport, ySupport, 12);

  pop();
}

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


