// --- Constantes físicas ---
let g = 9.81;

// --- Variables del sistema ---
let L = 2.5;
let theta0 = 20 * Math.PI / 180;
let mass = 1.0;

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

function setup() {
  createCanvas(700, 900);
  angleMode(RADIANS);
  noStroke();

  // Punto de suspensión
  xSupport = width / 2 + 70;
  ySupport = 180;

  // Posición y tamaño de los sliders
  let baseY = 550;  // debajo del péndulo
  let sliderWidth = 350;

  // ---- Contenedor dinámico de sliders para mejor alineación ----
  createSliderRow("Longitud (m)", 0.5, 6, 2.5, 0.1, "#4c72b0", baseY);
  createSliderRow("Ángulo (°)", 5, 90, 20, 1, "#55a868", baseY + 60);
  createSliderRow("Masa (kg)", 0.1, 5, 1, 0.1, "#c44e52", baseY + 120);

  // --- Botones ---
  startButton = createButton("Iniciar");
  startButton.position(width / 2 - 130, baseY + 180);
  styleButton(startButton);
  startButton.mousePressed(startPendulum);

  stopButton = createButton("Detener");
  stopButton.position(width / 2 + 20, baseY + 180);
  styleButton(stopButton);
  stopButton.mousePressed(stopPendulum);
}

// --- Crear fila de slider con label y valor ---
function createSliderRow(labelText, min, max, val, step, color, yPos) {
  let label = createP(labelText);
  label.style("margin", "0");
  label.style("font-size", "15px");
  label.style("color", "#333");
  label.style("font-family", "Segoe UI, sans-serif");
  label.position(width / 2 - 250, yPos - 5);

  let slider = createSlider(min, max, val, step);
  slider.position(width / 2 - 50, yPos);
  slider.style("width", "350px");
  slider.style("accent-color", color);
  slider.style("background-color", "white");
  slider.style("padding", "2px");

  let valueP = createP(val.toFixed(2));
  valueP.style("margin", "0");
  valueP.style("font-size", "15px");
  valueP.style("color", "#333");
  valueP.style("font-family", "Segoe UI, sans-serif");
  valueP.position(width / 2 + 320, yPos - 5);

  // Guardar referencias
  if (labelText.includes("Longitud")) { lengthSlider = slider; lengthValue = valueP; }
  if (labelText.includes("Ángulo")) { angleSlider = slider; angleValue = valueP; }
  if (labelText.includes("Masa")) { massSlider = slider; massValue = valueP; }
}

// --- Estilos de botones ---
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

  let theta = running ? theta0 * Math.cos(Math.sqrt(g / L) * t) : theta0;

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

  if (running) t += dt;

  // Cartel período
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

  // Base inferior
  noStroke();
  fill("#333");
  rect(width / 2, height - 80, 350, 35, 6);

  // Pilar vertical
  fill("#8a8a8a");
  stroke("#000");
  strokeWeight(1.5);
  rect(width / 2, ySupport + 260, 20, 520);

  // Brazo horizontal (pegado al pilar, sobresale a la derecha)
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

// --- Controladores ---
function startPendulum() {
  if (!running) {
    running = true;
    t = 0;
    lengthSlider.attribute("disabled", "");
    angleSlider.attribute("disabled", "");
    massSlider.attribute("disabled", "");
  }
}

function stopPendulum() {
  running = false;
  t = 0;
  lengthSlider.removeAttribute("disabled");
  angleSlider.removeAttribute("disabled");
  massSlider.removeAttribute("disabled");
}
