let g = 9.81;
let L = 2.5;
let theta0 = 20 * Math.PI / 180;
let mass = 1.0;

let running = false;
let t = 0;
let dt = 0.02;

let xSupport, ySupport;

function setup() {
  createCanvas(500, 600);
  xSupport = width / 2;
  ySupport = 150;
  noStroke();
}

function draw() {
  background(246);
  drawStructure();

  // Actualizar sliders si está detenido
  if (!running) {
    L = parseFloat(document.getElementById("length").value);
    theta0 = parseFloat(document.getElementById("angle").value) * Math.PI / 180;
    mass = parseFloat(document.getElementById("mass").value);
  }

  let theta = running ? theta0 * Math.cos(Math.sqrt(g / L) * t) : theta0;

  let x = xSupport + L * 80 * Math.sin(theta);
  let y = ySupport + L * 80 * Math.cos(theta);

  stroke(120);
  strokeWeight(2.4);
  line(xSupport, ySupport, x, y);

  noStroke();
  let r = 18 * Math.sqrt(mass);
  fill("#7b1e26");
  circle(x, y, r);

  fill(255, 255, 255, 60);
  circle(x - 0.03 * r, y - 0.03 * r, 0.7 * r);

  if (running) {
    t += dt;
  }

  let T = 2 * Math.PI * Math.sqrt(L / g);
  document.getElementById("period").textContent = `Período: ${T.toFixed(2)} s`;
}

function drawStructure() {
  fill("#8a8a8a");
  rect(width / 2 - 8, ySupport - 150, 16, 150);
  fill("#333");
  rect(width / 2 - 100, ySupport, 200, 20);
  fill("#777");
  rect(width / 2 - 8, ySupport - 150, 70, 8);
}

document.getElementById("start").onclick = function() {
  running = true;
  t = 0;
};

document.getElementById("stop").onclick = function() {
  running = false;
  t = 0;
};
