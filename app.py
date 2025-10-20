import streamlit as st
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Circle
from matplotlib.collections import LineCollection
import time

# --- Configuración página ---
st.set_page_config(page_title="Simulador de Péndulo", layout="centered")
st.title("🧭 Simulador Interactivo del Péndulo")
st.write("Controla la longitud, el ángulo y la masa para ver cómo cambia el movimiento y el período.")

# --- Constantes físicas ---
g = 9.81
radio_base = 0.18
long_max = 6.0
mass_max = 5.0
dt = 0.02  # tiempo por frame

# --- Sliders ---
L = st.sidebar.slider("Longitud (m)", 0.5, long_max, 2.5)
angle_deg = st.sidebar.slider("Ángulo (°)", 5, 90, 20)
mass = st.sidebar.slider("Masa (kg)", 0.1, mass_max, 1.0)

theta0 = np.radians(angle_deg)

# --- Contenedor para la animación ---
canvas = st.empty()

# --- Botones Play/Stop ---
if 'running' not in st.session_state:
    st.session_state.running = False
    st.session_state.frame_counter = 0

col1, col2 = st.columns(2)
with col1:
    start_btn = st.button("Iniciar")
with col2:
    stop_btn = st.button("Detener")

if start_btn:
    st.session_state.running = True
if stop_btn:
    st.session_state.running = False

# --- Función de segmentos de cuerda ---
def segmentos_cuerda(x1, y1, x2, y2, n=24):
    xs = np.linspace(x1, x2, n)
    ys = np.linspace(y1, y2, n)
    points = np.array([xs, ys]).T.reshape(-1,1,2)
    segments = np.concatenate([points[:-1], points[1:]], axis=1)
    return segments

# --- Dibujar figura base ---
def crear_figura():
    fig, ax = plt.subplots(figsize=(7,8))
    ax.set_aspect("equal")
    ax.axis("off")
    ax.set_facecolor("#f6f6f6")

    # Soporte
    base_width, base_height = 3.5, 0.35
    pillar_height, pillar_width = long_max + 0.8, 0.16
    arm_length, arm_height = 0.7, 0.08

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

    # Punto de suspensión
    x_sup = -pillar_width/2 + arm_length
    y_sup = -long_max + pillar_height

    # Ajuste ventana
    margen_x, margen_y = 1.0, 1.0
    x_min = x_sup - long_max - radio_base - margen_x
    x_max = x_sup + long_max + radio_base + margen_x
    y_min = -long_max - base_height - margen_y
    y_max = y_sup + long_max*0.1 + margen_y
    ax.set_xlim(x_min, x_max)
    ax.set_ylim(y_min, y_max)

    # Cuerda inicial
    x0 = x_sup + L * np.sin(theta0)
    y0 = y_sup - L * np.cos(theta0)
    segs = segmentos_cuerda(x_sup, y_sup, x0, y0)
    nseg = segs.shape[0]
    colors = [(0.75 - 0.35*i/nseg,)*3 for i in range(nseg)]
    cuerda = LineCollection(segs, colors=colors, linewidths=2.4, zorder=1)
    ax.add_collection(cuerda)

    # Bola
    r0 = radio_base * np.sqrt(mass)
    bola = Circle((x0, y0), r0, fc='darkred', ec='black', lw=1.2, zorder=2)
    sombra = Circle((x0-0.03*r0, y0+0.03*r0), r0*0.7, fc='white', ec='none', alpha=0.25, zorder=3)
    ax.add_patch(bola)
    ax.add_patch(sombra)

    # Período (visible solo si se inicia)
    T = 2*np.pi*np.sqrt(L/g)
    text_period = ax.text(0, y_max - 0.3, f"Período: {T:.2f} s",
                          fontsize=16, ha='center', va='center', color="#222222",
                          bbox=dict(facecolor='lightyellow', alpha=0.8,
                                    edgecolor='#666666', boxstyle='round,pad=0.5'))
    text_period.set_visible(st.session_state.running)

    return fig, ax, bola, sombra, cuerda, text_period, x_sup, y_sup

# --- Función de actualización ---
def actualizar(fig, bola, sombra, cuerda, text_period, x_sup, y_sup):
    theta = theta0 * np.cos(np.sqrt(g/L) * st.session_state.frame_counter * dt)
    x = x_sup + L * np.sin(theta)
    y = y_sup - L * np.cos(theta)
    r = radio_base * np.sqrt(mass)
    bola.center = (x, y)
    bola.radius = r
    sombra.center = (x-0.03*r, y+0.03*r)
    sombra.radius = r*0.7
    cuerda.set_segments(segmentos_cuerda(x_sup, y_sup, x, y))
    st.session_state.frame_counter += 1
    text_period.set_visible(st.session_state.running)
    canvas.pyplot(fig)

# --- Loop principal ---
fig, ax, bola, sombra, cuerda, text_period, x_sup, y_sup = crear_figura()
if st.session_state.running:
    for _ in range(500):  # animación de 500 frames
        actualizar(fig, bola, sombra, cuerda, text_period, x_sup, y_sup)
        time.sleep(dt)

