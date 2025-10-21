let g = 9.81;
let L = 2.5;
let theta0 = 20 * Math.PI / 180;
let mass = 1.0;

let running = false;
let t = 0;
let dt = 0.02;

let xSupport, ySupport;
let pxScale = 60; // Escala píxeles/metro para mantener proporciones realistas

function setup() {
  createCanvas(600, 700);
  xSupport = width / 2;
  ySupport = 150;
  noStroke();

  // Asignar funciones a los botones HTML
  document.getElementById("start").onclick = startPendulum;
  document.getElementById("stop").onclick = stopPendulum;
}

function draw() {
  background(246);
  drawStructure();

  // Leer sliders si no está corriendo
  if (!running) {
    L = parseFloat(document.getElementById("length").value);
    theta0 = parseFloat(document.getElementById("angle").value) * Math.PI / 180;
    mass = parseFloat(document.getElementById("mass").value);
  }

  // Calcular ángulo
  let theta = running ? theta0 * Math.cos(Math.sqrt(g / L) * t) : theta0;

  // Posición de la masa
  let x = xSupport + L * pxScale * Math.sin(theta);
  let y = ySupport + L * pxScale * Math.cos(theta);

  // Dibujar cuerda
  stroke(80);
  strokeWeight(2.5);
  line(xSupport, ySupport, x, y);

  // Dibujar masa
  noStroke();
  let r = 15 * Math.sqrt(mass);
  fill("#7b1e26");
  circle(x, y, r * 2);

  // Sombra
  fill(255, 255, 255, 70);
  circle(x - 0.1 * r, y - 0.1 * r, r * 1.3);

  // Avanzar tiempo si está corriendo
  if (running) t += dt;

  // Mostrar periodo
  let T = 2 * Math.PI * Math.sqrt(L / g);
  document.getElementById("period").textContent = `Período: ${T.toFixed(2)} s`;
}

function drawStructure() {
  // Base
  fill("#333");
  rect(xSupport - 150, ySupport + 5, 300, 25, 5);
  // Pilar
  fill("#8a8a8a");
  rect(xSupport - 8, ySupport - 150, 16, 150);
  // Brazo superior
  fill("#777");
  rect(xSupport - 8, ySupport - 150, 70, 8, 2);
}

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


document.getElementById("stop").onclick = function() {
  running = false;
  t = 0;
};
