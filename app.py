import streamlit as st
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Circle
from matplotlib.collections import LineCollection
import numpy as np
from streamlit_autorefresh import st_autorefresh

# --- Configuración de Streamlit ---
st.set_page_config(page_title="Simulador de Péndulo", layout="centered")
st.title("🧭 Simulador Interactivo del Péndulo")
st.write("Controla la longitud, el ángulo y la masa para ver cómo cambia el movimiento y el período.")

# --- Controles laterales ---
L = st.sidebar.slider("Longitud (m)", 0.5, 6.0, 2.5)
angle_deg = st.sidebar.slider("Ángulo (°)", 5, 90, 20)
mass = st.sidebar.slider("Masa (kg)", 0.1, 5.0, 1.0)
start_button = st.sidebar.button("Iniciar")
stop_button = st.sidebar.button("Detener")

# --- Estado global ---
if "running" not in st.session_state:
    st.session_state.running = False
if "frame_counter" not in st.session_state:
    st.session_state.frame_counter = 0

if start_button:
    st.session_state.running = True
    st.session_state.frame_counter = 0
if stop_button:
    st.session_state.running = False

# --- Función para segmentos de cuerda ---
def segmentos_cuerda(x1, y1, x2, y2, n=24):
    xs = np.linspace(x1, x2, n)
    ys = np.linspace(y1, y2, n)
    points = np.array([xs, ys]).T.reshape(-1, 1, 2)
    return np.concatenate([points[:-1], points[1:]], axis=1)

# --- Parámetros físicos ---
g = 9.81
radio_base = 0.18
long_max = 6.0

theta0 = np.radians(angle_deg)
x_support = -0.16/2 + 0.7
y_support = -long_max + long_max + 0.8  # Ajuste soporte superior

# --- Animación con refresco automático ---
refresh_rate = 50  # ms
st_autorefresh(interval=refresh_rate, key="pendulo_autorefresh")

# --- Crear figura ---
fig, ax = plt.subplots(figsize=(6,7))
ax.set_aspect("equal")
ax.axis("off")
ax.set_facecolor("#f6f6f6")

# Soporte
base = Rectangle((-3.5/2, -long_max - 0.25), 3.5, 0.25, fc="#333333", ec="black", lw=1.0, zorder=0)
pillar = Rectangle((-0.16/2, -long_max), 0.16, long_max + 0.8, fc="#888888", ec="#444444", lw=1.2, zorder=0)
arm = Rectangle((-0.16/2, -long_max + long_max + 0.8), 0.7, 0.08, fc="#777777", ec="#444444", lw=1.2, zorder=0)
ax.add_patch(base)
ax.add_patch(pillar)
ax.add_patch(arm)

# Márgenes
ax.set_xlim(x_support - long_max - 1, x_support + long_max + 1)
ax.set_ylim(-long_max - 0.25 - 1, y_support + long_max*0.2 + 1)

# Posición inicial
theta_init = theta0
x0 = x_support + L * np.sin(theta0)
y0 = y_support - L * np.cos(theta0)

segments = segmentos_cuerda(x_support, y_support, x0, y0)
colors = [(0.75 - 0.35*i/len(segments),)*3 for i in range(len(segments))]
cuerda = LineCollection(segments, colors=colors, linewidths=2.4, zorder=1)
ax.add_collection(cuerda)

r0 = radio_base * np.sqrt(mass)
bola = Circle((x0, y0), r0, fc='#8b0000', ec='black', lw=1.0, zorder=2)
sombra = Circle((x0-0.03*r0, y0+0.03*r0), r0*0.7, fc='white', ec='none', alpha=0.25, zorder=3)
ax.add_patch(bola)
ax.add_patch(sombra)

# Texto período
text_period = ax.text(0, y_support + long_max*0.3, '', fontsize=16, ha='center', va='center',
                      color='black', bbox=dict(facecolor='white', alpha=0.8, boxstyle='round,pad=0.5'))

# --- Animación frame a frame ---
dt = refresh_rate / 1000  # convertir ms a segundos

if st.session_state.running:
    # Mostrar período
    T = 2*np.pi*np.sqrt(L/g)
    text_period.set_text(f"Período: {T:.2f} s")
    
    frame = st.session_state.frame_counter
    theta = theta_init * np.cos(np.sqrt(g/L) * frame * dt)
    x = x_support + L * np.sin(theta)
    y = y_support - L * np.cos(theta)
    r = radio_base * np.sqrt(mass)

    bola.center = (x, y)
    bola.radius = r
    sombra.center = (x-0.03*r, y+0.03*r)
    sombra.radius = r*0.7
    cuerda.set_segments(segmentos_cuerda(x_support, y_support, x, y))

    st.session_state.frame_counter += 1
else:
    text_period.set_text('')

# --- Mostrar figura ---
st.pyplot(fig)
