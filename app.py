import streamlit as st
import numpy as np
import plotly.graph_objects as go

st.set_page_config(page_title="Simulador de Péndulo", layout="centered")
st.title("🧭 Simulador Interactivo del Péndulo")
st.write("Controla la longitud, el ángulo y la masa para ver cómo cambia el movimiento y el período.")

# --- Parámetros físicos ---
g = 9.81
radio_base = 0.18
long_max = 6.0
mass_max = 5.0

# --- Sliders ---
L = st.sidebar.slider("Longitud (m)", 0.5, long_max, 2.5)
angle_deg = st.sidebar.slider("Ángulo (°)", 5, 90, 20)
mass = st.sidebar.slider("Masa (kg)", 0.1, mass_max, 1.0)

theta0 = np.radians(angle_deg)
x_support, y_support = 0, 0
r_base = radio_base * np.sqrt(mass)

# --- Tiempo ---
frames_total = 200
t = np.linspace(0, 2*np.pi*np.sqrt(L/g), frames_total)
theta_t = theta0 * np.cos(np.sqrt(g/L) * t)

# --- Posiciones ---
x_t = x_support + L * np.sin(theta_t)
y_t = y_support - L * np.cos(theta_t)

# --- Cuerda como línea ---
def cuerda_segment(x, y):
    return [x_support, x], [y_support + 2.0, y]  # offset para simular soporte alto

# --- Crear figura ---
fig = go.Figure(
    layout=go.Layout(
        xaxis=dict(range=[-3,3], showgrid=False, zeroline=False, visible=False),
        yaxis=dict(range=[-1,3.5], showgrid=False, zeroline=False, visible=False),
        width=500,
        height=600,
        updatemenus=[dict(
            type="buttons",
            buttons=[dict(label="Play",
                          method="animate",
                          args=[None, {"frame": {"duration": 50, "redraw": True},
                                       "fromcurrent": True, "transition": {"duration":0}}]),
                     dict(label="Pause",
                          method="animate",
                          args=[[None], {"frame": {"duration": 0, "redraw": False},
                                         "mode": "immediate"}])]
        )]
    )
)

# --- Soporte ---
fig.add_shape(type="rect", x0=-1.5, x1=1.5, y0=-0.1, y1=0, fillcolor="#333333", line_color="black")
fig.add_shape(type="line", x0=0, x1=0, y0=0, y1=2.0, line=dict(color="#888888", width=8))
fig.add_shape(type="line", x0=0, x1=0.7, y0=2.0, y1=2.0, line=dict(color="#777777", width=12))

# --- Frame inicial ---
x_line, y_line = cuerda_segment(x_t[0], y_t[0])
fig.add_trace(go.Scatter(x=x_line, y=y_line, mode='lines', line=dict(color='gray', width=3), name='Cuerda'))
fig.add_trace(go.Scatter(x=[x_t[0]], y=[y_t[0]], mode='markers',
                         marker=dict(size=30*r_base, color='darkred', line=dict(color='black', width=2)),
                         name='Bola'))

# --- Frames de animación ---
frames = []
for i in range(frames_total):
    x_line, y_line = cuerda_segment(x_t[i], y_t[i])
    frames.append(go.Frame(data=[
        go.Scatter(x=x_line, y=y_line),
        go.Scatter(x=[x_t[i]], y=[y_t[i]], marker=dict(size=30*r_base))
    ]))

fig.frames = frames

# --- Mostrar período ---
T = 2*np.pi*np.sqrt(L/g)
st.write(f"**Período: {T:.2f} s**")

st.plotly_chart(fig, use_container_width=True)


