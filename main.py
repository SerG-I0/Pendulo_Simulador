import matplotlib
matplotlib.use("TkAgg")

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.widgets import Slider, Button
from matplotlib.patches import Rectangle, Circle, FancyBboxPatch
from matplotlib.collections import LineCollection

# --- Constantes físicas ---
g = 9.81
radio_base = 0.18
long_max = 6.0
mass_max = 5.0

# --- Estado inicial ---
L0 = 2.5
theta0_deg = 20
mass0 = 1.0
running = False
frame_counter = 0
theta_initial = np.radians(theta0_deg)

# --- Crear figura ---
fig, ax = plt.subplots(figsize=(7, 8))
plt.subplots_adjust(left=0.1, bottom=0.3)
ax.set_aspect("equal")
ax.axis("off")
ax.set_facecolor("#f6f6f6")

# --- Soporte ---
base_width = 3.5
base_height = 0.35
pillar_height = long_max + 0.8
pillar_width = 0.16
arm_length = 0.7
arm_height = 0.08

base = Rectangle((-base_width/2, -long_max - base_height), base_width, base_height,
                 fc="#333333", ec="black", lw=1.0, zorder=0)
ax.add_patch(base)

pillar = Rectangle((-pillar_width/2, -long_max), pillar_width, pillar_height,
                   fc="#8a8a8a", ec="#444444", lw=1.2, zorder=0)
ax.add_patch(pillar)

arm = Rectangle((-pillar_width/2, -long_max + pillar_height),
                arm_length, arm_height,
                fc="#777777", ec="#444444", lw=1.2, zorder=0)
ax.add_patch(arm)

# --- Punto de suspensión ---
x_support = -pillar_width / 2 + arm_length
y_support = -long_max + pillar_height

# --- Ajuste ventana ---
margen_x = 1.0
margen_y = 1.0
x_min = x_support - long_max - radio_base - margen_x
x_max = x_support + long_max + radio_base + margen_x
y_min = -long_max - base_height - margen_y
y_max = y_support + long_max*0.1 + margen_y
ax.set_xlim(x_min, x_max)
ax.set_ylim(y_min, y_max)

# --- Sliders ---
ax_length = plt.axes([0.15, 0.22, 0.55, 0.03])
ax_angle  = plt.axes([0.15, 0.17, 0.55, 0.03])
ax_mass   = plt.axes([0.15, 0.12, 0.55, 0.03])

s_length = Slider(ax_length, 'Longitud (m)', 0.5, long_max, valinit=L0, facecolor="#4c72b0")
s_angle  = Slider(ax_angle,  'Ángulo (°)', 5, 90, valinit=theta0_deg, facecolor="#55a868")
s_mass   = Slider(ax_mass,   'Masa (kg)', 0.1, mass_max, valinit=mass0, facecolor="#c44e52")

# --- Botones ---
ax_start = plt.axes([0.15, 0.03, 0.25, 0.05])
ax_stop  = plt.axes([0.45, 0.03, 0.25, 0.05])

def estilo_boton(ax_b):
    bbox = FancyBboxPatch((0,0),1,1,
                          boxstyle="round,pad=0.03",
                          transform=ax_b.transAxes,
                          facecolor="#d9d9d9",
                          edgecolor="#999999",
                          linewidth=1.2,
                          zorder=-1)
    ax_b.add_patch(bbox)
    ax_b.patch.set_alpha(0)

estilo_boton(ax_start)
estilo_boton(ax_stop)

btn_start = Button(ax_start, 'Iniciar', color="#d9d9d9", hovercolor="#bbbbbb")
btn_stop  = Button(ax_stop,  'Detener', color="#d9d9d9", hovercolor="#bbbbbb")

# --- Posición inicial ---
theta0 = np.radians(s_angle.val)
L0 = s_length.val
x0 = x_support + L0 * np.sin(theta0)
y0 = y_support - L0 * np.cos(theta0)

# --- Segmentos de cuerda ---
def segmentos_cuerda(x1, y1, x2, y2, n=24):
    xs = np.linspace(x1, x2, n)
    ys = np.linspace(y1, y2, n)
    points = np.array([xs, ys]).T.reshape(-1, 1, 2)
    segments = np.concatenate([points[:-1], points[1:]], axis=1)
    return segments

initial_segments = segmentos_cuerda(x_support, y_support, x0, y0, n=24)
nseg = initial_segments.shape[0]
colors = [(0.75 - 0.35*i/nseg, 0.75 - 0.35*i/nseg, 0.75 - 0.35*i/nseg) for i in range(nseg)]
cuerda = LineCollection(initial_segments, colors=colors, linewidths=2.4, zorder=1)
ax.add_collection(cuerda)

# --- Bola granate con sombreado sutil ---
r0 = radio_base * np.sqrt(s_mass.val)
bola_base = Circle((x0, y0), r0, fc='#7b1e26', ec='#4a0f13', lw=1.3, zorder=2)
bola_sombra = Circle((x0-0.03*r0, y0+0.03*r0), r0*0.7, fc='white', ec='none', alpha=0.25, zorder=3)
ax.add_patch(bola_base)
ax.add_patch(bola_sombra)

# --- Label del período (oculto inicialmente) ---
text_period = ax.text(0, y_max - 0.25, '', fontsize=16, ha='center', va='center',
                      color="#f8f8f8",
                      bbox=dict(facecolor='#2e3b4e', edgecolor='#1a2230',
                                alpha=0.9, boxstyle='round,pad=0.5'),
                      visible=False)

# --- Control de animación ---
def start(event):
    global running, frame_counter, theta_initial
    running = True
    frame_counter = 0
    theta_initial = np.radians(s_angle.val)
    text_period.set_visible(True)
    for s in (s_length, s_angle, s_mass):
        s.set_active(False)

def stop(event):
    global running, frame_counter
    running = False
    frame_counter = 0
    text_period.set_visible(False)
    actualizar_posicion()
    for s in (s_length, s_angle, s_mass):
        s.set_active(True)

btn_start.on_clicked(start)
btn_stop.on_clicked(stop)

# --- Actualizar posición ---
def actualizar_posicion():
    L = s_length.val
    theta = np.radians(s_angle.val)
    x = x_support + L * np.sin(theta)
    y = y_support - L * np.cos(theta)
    r = radio_base * np.sqrt(s_mass.val)
    bola_base.center = (x, y)
    bola_base.radius = r
    bola_sombra.center = (x-0.03*r, y+0.03*r)
    bola_sombra.radius = r*0.7
    cuerda.set_segments(segmentos_cuerda(x_support, y_support, x, y, n=24))

for s in (s_length, s_angle, s_mass):
    s.on_changed(lambda val: actualizar_posicion() if not running else None)

# --- Animación ---
def update(frame):
    global frame_counter
    L = s_length.val
    if not running:
        return [bola_base, bola_sombra, cuerda, text_period]

    dt = 0.02
    t = frame_counter * dt
    omega = np.sqrt(g/L)
    theta = theta_initial * np.cos(omega*t)
    x = x_support + L * np.sin(theta)
    y = y_support - L * np.cos(theta)
    r = radio_base * np.sqrt(s_mass.val)

    bola_base.center = (x, y)
    bola_base.radius = r
    bola_sombra.center = (x-0.03*r, y+0.03*r)
    bola_sombra.radius = r*0.7

    cuerda.set_segments(segmentos_cuerda(x_support, y_support, x, y, n=24))
    T = 2*np.pi*np.sqrt(L/g)
    text_period.set_text(f"Período: {T:.2f} s")
    frame_counter += 1
    return [bola_base, bola_sombra, cuerda, text_period]

ani = animation.FuncAnimation(fig, update, frames=1000, interval=20, blit=False)
plt.show()
