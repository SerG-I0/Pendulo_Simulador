import streamlit as st
import plotly.graph_objects as go
import numpy as np

st.set_page_config(page_title="Simulador de Péndulo", layout="centered")
st.title("🧭 Simulador Interactivo del Péndulo")
st.write("Controla la longitud, el ángulo y la masa para ver cómo cambia el movimiento y el período.")

# --- Controles ---
L = st.sidebar.slider("Longitud (m)", 0.5, 6.0, 2.5)
angle_deg = st.sidebar.slider("Ángulo (°)", 5, 90, 20)
mass = st.sidebar.slider("Masa (kg)", 0.1, 5.0, 1.0)
start_button = st.sidebar.button("Iniciar")
stop_button = st.sidebar.button("Detener")

# --- Estado ---
if "running" not in st.session_state:
    st.session_state.running = False
if "frame" not in st.session_state:
    st.session_state.frame = 0

if start_button:
    st.session_state.running = True
    st.session_state.frame = 0
if stop_button:
    st.session_state.running = False

# --- Parámetros físicos ---
g = 9.81
theta0 = np.radians(angle_deg)
x_support, y_support = 0, 0
radio_base = 0.18

# --- Función de posición ---
def pos_pendulo(L, theta):
    x = x_support + L * np.sin(theta)
    y = y_support - L * np.cos(theta)
    return x, y

# --- Crear figura ---
fig = go.Figure()

# Soporte
fig.add_shape(type="rect", x0=-1.5, x1=1.5, y0=-0.1, y1=0, line=dict(color="black"), fillcolor="#333333")
fig.add_shape(type="line", x0=0, x1=0, y0=0, y1=2.0, line=dict(color="#888888", width=8))
fig.add_shape(type="line", x0=0, x1=0.5, y0=2.0, y1=2.0, line=dict(color="#777777", width=12))

# Pendulo inicial
theta = theta0
x, y = pos_pendulo(L, theta)
r = radio_base * np.sqrt(mass)

# Línea (cuerda)
fig.add_trace(go.Scatter(x=[x_support, x], y=[y_support + 2.0, y],
                         mode='lines', line=dict(color='gray', width=3), name='Cuerda'))

# Bola
fig.add_trace(go.Scatter(x=[x], y=[y], mode='markers',
                         marker=dict(size=30*r, color='darkred', line=dict(color='black', width=2)),
                         name='Bola'))

# Configuración gráfica
fig.update_layout(xaxis=dict(range=[-3,3], showgrid=False, zeroline=False, visible=False),
                  yaxis=dict(range=[-1,3.5], showgrid=False, zeroline=False, visible=False),
                  height=600, width=500)

# --- Animación simple ---
dt = 0.02
omega = np.sqrt(g / L)
frames = 200

if st.session_state.running:
    t = st.session_state.frame * dt
    theta = theta0 * np.cos(omega * t)
    x, y = pos_pendulo(L, theta)
    r = radio_base * np.sqrt(mass)
    
    # Actualizar línea y bola
    fig.data[0].x = [x_support, x]
    fig.data[0].y = [y_support + 2.0, y]
    fig.data[1].x = [x]
    fig.data[1].y = [y]
    fig.data[1].marker.size = 30*r

    st.session_state.frame += 1

# Mostrar período si animación en marcha
if st.session_state.running:
    T = 2*np.pi*np.sqrt(L/g)
    st.write(f"**Período: {T:.2f} s**")

st.plotly_chart(fig, use_container_width=True)

