// --- Constantes físicas ---
let g = 9.81;

// --- Variables del péndulo ---
let L = 2.5;
let theta0 = 20 * Math.PI / 180;
let mass = 1.0;

// --- Estado ---
let running = false;
let t = 0;
let dt = 0.02;

// --- Escala y soporte ---
let xSupport, ySupport;
let pxScale;

// --- Controles ---
let lengthSlider, angleSlider, massSlider;
let startButton, stopButton;
let lengthValue, angleValue, massValue;

function setup() {
  const canvas = createCanvas(700, 900);
  canvas.parent("canvas-container");
  angleMode(RADIANS);
  noStroke();

  // Ajuste compacto: soporte más alto para que la bola toque la base
  ySupport = 150; 
  xSupport = width / 2 + 70;

  // Crear sliders
  lengthSlider = createSliderRow("Longitud (m)", 0.5, 6, 2.5, 0.1, "#4c72b0");
  angleSlider = createSliderRow("Ángulo (°)", 5, 90, 20, 1, "#55a868");
  massSlider = createSliderRow("Masa (kg)", 0.1, 5, 1, 0.1, "#c44e52");

  // Botones
  startButton = createButton("Iniciar");
  startButton.parent("controls");
  styleButton(startButton);
  startButton.mousePressed(startPendulum);

  stopButton = createButton("Detener");
  stopButton.parent("controls");
  styleButton(stopButton);
  stopButton.mousePressed(stopPendulum);
}

// --- Crear fila de slider ---
function createSliderRow(labelText, min, max, val, step, color) {
  const container = createDiv().class("slider-row").parent("controls");

  const label = createP(labelText).parent(container);
  label.style("margin", "0");
  label.style("font-size", "15px");

  const slider = createSlider(min, max, val, step).parent(container);
  slider.style("width", "350px");
  slider.style("accent-color", color); 
  slider.style("background-color", "transparent");

  const valueP = createP(val.toFixed(2)).parent(container);
  valueP.style("margin", "0");
  valueP.style("font-size", "15px");

  // Guardar referencias
  if (labelText.includes("Longitud")) lengthValue = valueP;
  if (labelText.includes("Ángulo")) angleValue = valueP;
  if (labelText.includes("Masa")) massValue = valueP;

  return slider;
}

// --- Estilos botón ---
function styleButton(btn) {
  btn.style("background-color", "#d9d9d9");
  btn.style("border", "none");
  btn.style("border-radius", "10px");
  btn.style("padding", "8px 18px");
  btn.style("font-size", "16px");
  btn.style("margin", "5px");
  btn.style("cursor", "pointer");
  btn.mouseOver(() => btn.style("background-color", "#bbbbbb"));
  btn.mouseOut(() => btn.style("background-color", "#d9d9d9"));
}

// --- Dibujo ---
function draw() {
  background("#f6f6f6");
  drawStructure();

  if (!running) {
    L = lengthSlider.value();
    theta0 = angleSlider.value() * Math.PI / 180;
    mass = massSlider.value();
  }

  // Actualizar valores
  lengthValue.html(L.toFixed(2));
  angleValue.html(degrees(theta0).toFixed(0));
  massValue.html(mass.toFixed(2));

  // Escala vertical ajustada
  pxScale = (height - 300 - 20) / 6; 

  let theta = running ? theta0 * Math.cos(Math.sqrt(g / L) * t) : theta0;

  let x = xSupport + L * pxScale * Math.sin(theta);
  let y = ySupport + L * pxScale * Math.cos(theta);

  // Cuerda
  stroke(90);
  strokeWeight(2.4);
  line(xSupport, ySupport, x, y);

  // Masa
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

// --- Estructura ---
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

// --- Control ---
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


