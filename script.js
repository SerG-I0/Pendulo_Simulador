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
let pxScale = 90; // Escala píxel/metro

// --- Controles ---
let lengthSlider, angleSlider, massSlider;
let startButton, stopButton;

// --- Setup ---
function setup() {
  createCanvas(700, 800);
  angleMode(RADIANS);
  noStroke();

  // Punto de suspensión (desde el extremo derecho del brazo metálico)
  xSupport = width / 2 + 70;
  ySupport = 180;

  // ---- Sliders ----
  let sliderWidth = 400;
  let slidersX = width / 2 - sliderWidth / 2;
  let baseY = height - 180;

  // Longitud
  lengthSlider = createSlider(0.5, 6, 2.5, 0.1);
  lengthSlider.position(slidersX, baseY);
  lengthSlider.style("width", sliderWidth + "px");
  lengthSlider.style("accent-color", "#4c72b0");

  // Ángulo
  angleSlider = createSlider(5, 90, 20, 1);
  angleSlider.position(slidersX, baseY + 40);
  angleSlider.style("width", sliderWidth + "px");
  angleSlider.style("accent-color", "#55a868");

  // Masa
  massSlider = createSlider(0.1, 5, 1, 0.1);
  massSlider.position(slidersX, baseY + 80);
  massSlider.style("width", sliderWidth + "px");
  massSlider.style("accent-color", "#c44e52");

  // ---- Botones ----
  startButton = createButton("Iniciar");
  startButton.position(width / 2 - 130, baseY + 130);
  styleButton(startButton);
  startButton.mousePressed(startPendulum);

  stopButton = createButton("Detener");
  stopButton.position(width / 2 + 20, baseY + 130);
  styleButton(stopButton);
  stopButton.mousePressed(stopPendulum);
}

// --- Estilo de botones ---
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

// --- Dibujo principal ---
function draw() {
  background("#f6f6f6");
  drawStructure();

  // Leer sliders (solo si está detenido)
  if (!running) {
    L = lengthSlider.value();
    theta0 = angleSlider.value() * Math.PI / 180;
    mass = massSlider.value();
  }

  // Calcular ángulo
  let theta = running ? theta0 * Math.cos(Math.sqrt(g / L) * t) : theta0;

  // Posición de la masa
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

  // Mostrar etiquetas sliders
  noStroke();
  fill(30);
  textSize(14);
  textAlign(LEFT);
  text(`Longitud (m): ${L.toFixed(2)}`, 80, height - 165);
  text(`Ángulo (°): ${degrees(theta0).toFixed(0)}`, 80, height - 125);
  text(`Masa (kg): ${mass.toFixed(2)}`, 80, height - 85);

  // Mostrar período solo si está corriendo
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

// --- Estructura metálica ---
function drawStructure() {
  push();
  rectMode(CENTER);
  noStroke();

  // Base inferior
  fill("#333");
  rect(width / 2, height - 80, 350, 35, 6);

  // Pilar vertical
  fill("#8a8a8a");
  rect(width / 2, ySupport + 260, 20, 520);

  // Brazo superior: solo sobresale hacia la derecha
  fill("#777");
  rect(width / 2 + 40, ySupport, 160, 12, 3);

  pop();
}

// --- Controladores ---
function startPendulum() {
  if (!running) {
    running = true;
    t = 0;
  }
}

function stopPendulum() {
  running = false;
  t = 0;
}

