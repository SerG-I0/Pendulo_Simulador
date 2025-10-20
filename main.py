import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.patches import Rectangle, Circle
from matplotlib.collections import LineCollection

# --- Constantes físicas ---
g = 9.81
radio_base = 0.18
long_max = 5.0

# --- Estado inicial ---
L = 2.5
theta0 = np.radians(25)
mass = 1.0

# --- Crear figura ---
fig, ax = plt.subplots(figsize=(5, 6))
ax.set_aspect("equal")
ax.axis("off")
ax.set_facecolor("#f6f6f6")

# --- Soporte ---
base_width = 3.2
base_height = 0.25
pillar_height = long_max + 0.7
pillar_width = 0.14
arm_length = 0.65
arm_height = 0.07

base = Rectangle((-base_width/2, -long_max - base_height), base_width, base_height,
                 fc="#333333", ec="black", lw=1.0, zorder=0)
ax.add_patch(base)

pillar = Rectangle((-pillar_width/2, -long_max), pillar_width, pillar_height,
                   fc="#888888", ec="#444444", lw=1.2, zorder=0)
ax.add_patch(pillar)

arm = Rectangle((-pillar_width/2, -long_max + pillar_height),
                arm_length, arm_height,
                fc="#777777", ec="#444444", lw=1.2, zorder=0)
ax.add_patch(arm)

# --- Punto de suspensión ---
x_support = -pillar_width/2 + arm_length
y_support = -long_max + pillar_height

# --- Ajuste de ventana ---
ax.set_xlim(x_support - long_max - 1, x_support + long_max + 1)
ax.set_ylim(-long_max - 1, y_support + long_max*0.3 + 1)

# --- Cuerda y bola ---
def segmentos_cuerda(x1, y1, x2, y2, n=24):
    xs = np.linspace(x1, x2, n)
    ys = np.linspace(y1, y2, n)
    points = np.array([xs, ys]).T.reshape(-1, 1, 2)
    return np.concatenate([points[:-1], points[1:]], axis=1)

x = x_support + L * np.sin(theta0)
y = y_support - L * np.cos(theta0)
segments = segmentos_cuerda(x_support, y_support, x, y)
colors = [(0.7 - 0.4*i/len(segments),)*3 for i in range(len(segments))]
cuerda = LineCollection(segments, colors=colors, linewidths=2.4, zorder=1)
ax.add_collection(cuerda)

r = radio_base * np.sqrt(mass)
bola = Circle((x, y), r, fc='#8b0000', ec='black', lw=1.0, zorder=2)
sombra = Circle((x-0.03*r, y+0.03*r), r*0.7, fc='white', ec='none', alpha=0.3, zorder=3)
ax.add_patch(bola)
ax.add_patch(sombra)

# --- Texto de período ---
T = 2*np.pi*np.sqrt(L/g)
text_period = ax.text(0, y_support + long_max*0.35, f"Período: {T:.2f} s",
                      fontsize=14, ha='center', va='center', color='black',
                      bbox=dict(facecolor='white', alpha=0.8, boxstyle='round,pad=0.4'))

# --- Animación ---
frame_counter = 0
theta_init = theta0

def update(frame):
    global frame_counter
    dt = 0.02
    t = frame_counter * dt
    omega = np.sqrt(g/L)
    theta = theta_init * np.cos(omega * t)
    x = x_support + L * np.sin(theta)
    y = y_support - L * np.cos(theta)
    r = radio_base * np.sqrt(mass)
    bola.center = (x, y)
    sombra.center = (x-0.03*r, y+0.03*r)
    cuerda.set_segments(segmentos_cuerda(x_support, y_support, x, y))
    frame_counter += 1
    return [bola, sombra, cuerda, text_period]

ani = animation.FuncAnimation(fig, update, frames=1000, interval=20, blit=False)
display(fig)

