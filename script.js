// --- Constantes físicas ---
let g = 9.81;

// --- Variables del sistema ---
let L = 2.5;                      // Longitud inicial (m)
let theta0 = 20 * Math.PI / 180;  // Ángulo inicial (rad)
let mass = 1.0;                   // Masa (kg)

// --- Estado de simulación ---
let running = false;
let t = 0;
let dt = 0.02;

// --- Escala y soporte ---
let xSupport, ySupport;
let basePxScale = 85;
let pxScale;

// --- Controles ---
let lengthSlider, angleSlider, massSlider;
let startButton, stopButton;
let lengthLabel, angleLabel, massLabel;
let lengthValue, angleValue, massValue;

// --- Setup ---
function setup() {
  createCanvas(700, 850);
  angleMode(RADIANS);
  noStroke();

  // Punto de suspensión
  xSupport = width / 2 + 70;
  ySupport = 180;

  let sliderWidth = 350;
  let controlX = width / 2 - sliderWidth / 2 + 80;
  let labelX = controlX - 100;
  let valueX = controlX + sliderWidth + 20;
  let baseY = height - 220;

  // ---- Sliders y etiquetas ----
  lengthLabel = createP("Longitud (m)");
  styleLabel(lengthLabel, labelX, baseY - 15);

  lengthSlider = createSlider(0.5, 6, 2.5, 0.1);
  lengthSlider.position(controlX, baseY);
  lengthSlider.style("width", sliderWidth + "px");
  lengthSlider.style("accent-color", "#4c72b0");
  lengthValue = createP(L.toFixed(2));
  styleValue(lengthValue, valueX, baseY - 15);

  angleLabel = createP("Ángulo (°)");
  styleLabel(angleLabel, labelX, baseY + 35);

  angleSlider = createSlider(5, 90, 20, 1);
  angleSlider.position(controlX, baseY + 50);
  angleSlider.style("width", sliderWidth + "px");
  angleSlider.style("accent-color", "#55a868");
  angleValue = createP(degrees(theta0).toFixed(0));
  styleValue(angleValue, valueX, baseY + 35);

  massLabel = createP("Masa (kg)");
  styleLabel(massLabel, labelX, baseY + 85);

  massSlider = createSlider(0.1, 5, 1, 0.1);
  massSlider.position(controlX, baseY + 100);
  massSlider.style("width", sliderWidth + "px");
  massSlider.style("accent-color", "#c44e52");
  massValue = createP(mass.toFixed(2));
  styleValue(massValue, valueX, baseY + 85);

  // ---- Botones ----
  startButton = createButton("Iniciar");
  startButton.position(width / 2 - 130, baseY + 160);
  styleButton(startButton);
  startButton.mousePressed(startPendulum);

  stopButton = createButton("Detener");
  stopButton.position(width / 2 + 20, baseY + 160);
  styleButton(stopButton);
  stopButton.mousePressed(stopPendulum);
}

// --- Estilos ---
function styleButton(btn) {
  btn.style("background-color", "#d9d9d9");
  btn.style("border", "none");
  btn.style("border-radius", "10px");
  btn.style("padding", "8px 18px");
  btn.style("cursor", "pointer");
  btn.style("font-size", "16px");
  btn.mouseOver(() => btn.style("background-color", "#bbbbbb"));
  btn.mouseOut(() => btn.style("background-color", "#d9d9d9"));
}

function styleLabel(el, x, y) {
  el.position(x, y);
  el.style("font-size", "15px");
  el.style("margin", "0");
  el.style("color", "#333");
  el.style("font-family", "Segoe UI, sans-serif");
}

function styleValue(el, x, y) {
  el.position(x, y);
  el.style("font-size", "15px");
  el.style("margin", "0");
  el.style("color", "#333");
  el.style("font-family", "Segoe UI, sans-serif");
}

// --- Dibujo principal ---
function draw() {
  background("#f6f6f6");
  drawStructure();

  // Leer sliders si no está corriendo
  if (!running) {
    L = lengthSlider.value();
    theta0 = angleSlider.value() * Math.PI / 180;
    mass = massSlider.value();
  }

  // Actualizar valores mostrados
  lengthValue.html(L.toFixed(2));
  angleValue.html(degrees(theta0).toFixed(0));
  massValue.html(mass.toFixed(2));

  // Escala automática
  pxScale = basePxScale * (2.5 / L);
  pxScale = constrain(pxScale, 40, 100);

  // Ángulo actual
  let theta = running ? theta0 * Math.cos(Math.sqrt(g / L) * t) : theta0;

  // Posición masa
  let x = xSupport + L * pxScale * Math.sin(theta);
  let y = ySupport + L * pxScale * Math.cos(theta);

  // Dibujar cuerda
  stroke(90);
  strokeWeight(2.4);
  line(xSupport, ySupport, x, y);

  // Dibujar masa
  noStroke();
  let r = 10 * Math.sqrt(mass);
  fill("#7b1e26");
  circle(x, y, r * 2);

  // Sombra
  fill(255, 255, 255, 70);
  circle(x - 0.15 * r, y - 0.15 * r, 1.3 * r);

  // Avanzar tiempo
  if (running) t += dt;

  // Mostrar período si está corriendo
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

// --- Estructura metálica con borde negro ---
function drawStructure() {
  push();
  rectMode(CENTER);

  // Base inferior
  noStroke();
  fill("#333");
  rect(width / 2, height - 80, 350, 35, 6);

  // Pilar vertical
  fill("#8a8a8a");
  stroke("#000");
  strokeWeight(1.5);
  rect(width / 2, ySupport + 260, 20, 520);

  // Brazo superior (solo a la derecha)
  fill("#777");
  stroke("#000");
  strokeWeight(1.5);
  rect(width / 2 + 40, ySupport, 160, 12, 3);

  // Pivote
  noStroke();
  fill("#444");
  circle(xSupport, ySupport, 12);
  pop();
}

// --- Controladores ---
function startPendulum() {
  if (!running) {
    running = true;
    t = 0;
    // Bloquear sliders
    lengthSlider.attribute("disabled", "");
    angleSlider.attribute("disabled", "");
    massSlider.attribute("disabled", "");
  }
}

function stopPendulum() {
  running = false;
  t = 0;
  // Desbloquear sliders
  lengthSlider.removeAttribute("disabled");
  angleSlider.removeAttribute("disabled");
  massSlider.removeAttribute("disabled");
}

