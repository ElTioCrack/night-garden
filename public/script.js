// El primero siempre sale al inicio; los demás salen en orden aleatorio,
// sin repetirse hasta que hayan salido todos, y así en bucle.
const PRIMER_MENSAJE = "Para alegrarte el día tanto como tú alegras los míos 💛";
const MENSAJES = [
  "Flores para ti 🌻",
  "Flores para mi chica 🌻",
  "Un detalle para mi mujer 💛",
  "Esto es por todos los momentos bonitos que me hiciste pasar",
  "Esto es por los recuerdos que creaste en mí",
  "Florecitas amarillas para ti 🌻",
  "Flores para la flor más bella, jsjs 🌻",

  "Esto no significa nada... o sí 💛",

  "Flores para ti, que andas rondando mis pensamientos jsjs 🌻",
  "Un detalle para ver si te saco una sonrisita 👀",

  "Flores para ti, obvio, ¿para quién más? jsjs 🌻",
  "Flores porque contigo todo se siente distinto jsjs 🌻",

  "Girasoles para la que gira mi cabeza sin permiso 👀",
];
const SEGUNDOS_POR_MENSAJE = 5.5;
const CANTIDAD_LUCIERNAGAS = 26;

const btn = document.getElementById("start");
const msg = document.getElementById("message");
const hearts = document.getElementById("bubbles");
const fireflies = document.getElementById("fireflies");

// Arranca el jardín cuando termina de cargar la página.
window.addEventListener("load", () => {
  document.body.classList.remove("container");
});

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

// Luciérnagas y estrellitas alrededor del mensaje.
function crearLuciernagas() {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < CANTIDAD_LUCIERNAGAS; i++) {
    const star = i % 3 === 0;
    const el = document.createElement("span");
    el.className = star ? "star" : "firefly";
    el.style.left = rand(0, 100) + "%";
    el.style.top = rand(0, 100) + "%";
    el.style.setProperty("--s", rand(star ? 3 : 4, star ? 6 : 8).toFixed(1) + "px");
    el.style.setProperty("--dx", rand(-40, 40).toFixed(0) + "px");
    el.style.setProperty("--dy", rand(-40, 40).toFixed(0) + "px");
    el.style.setProperty("--dur", rand(5, 11).toFixed(1) + "s");
    el.style.setProperty("--tw", rand(1.5, 3.5).toFixed(1) + "s");
    el.style.animationDelay = rand(0, 4).toFixed(1) + "s";
    frag.appendChild(el);
  }
  fireflies.appendChild(frag);
  requestAnimationFrame(() => fireflies.classList.add("on"));
}

// "Bolsa" aleatoria: se vacía mensaje a mensaje y se vuelve a llenar (mezclada)
// cuando se acaba, evitando que el mismo mensaje salga dos veces seguidas.
let bolsa = [];
let ultimo = PRIMER_MENSAJE;

function siguienteMensaje() {
  if (bolsa.length === 0) {
    bolsa = [...MENSAJES];
    for (let i = bolsa.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bolsa[i], bolsa[j]] = [bolsa[j], bolsa[i]];
    }
    if (bolsa.length > 1 && bolsa[bolsa.length - 1] === ultimo) {
      bolsa.unshift(bolsa.pop());
    }
  }
  ultimo = bolsa.pop();
  return ultimo;
}

function mostrarMensaje(texto, primero) {
  msg.classList.remove("show");
  // Pequeña pausa para que el fade-out termine antes de cambiar el texto.
  setTimeout(() => {
    msg.textContent = texto;
    msg.classList.add("show");
    setTimeout(() => mostrarMensaje(siguienteMensaje()), SEGUNDOS_POR_MENSAJE * 1000);
  }, primero ? 0 : 700);
}

// Música: solo puede sonar después de un toque, por eso arranca con el botón.
const musica = document.getElementById("musica");
const btnMusica = document.getElementById("music-toggle");
const toastMusica = document.getElementById("music-toast");
const VOLUMEN = 0.8;
const SEGUNDOS_TOAST = 4.5;

function subirVolumen() {
  const paso = setInterval(() => {
    musica.volume = Math.min(VOLUMEN, musica.volume + 0.04);
    if (musica.volume >= VOLUMEN) clearInterval(paso);
  }, 100);
}

// Ficha con el título y el autor de la canción, un ratito nada más.
let ocultarToastId = null;
function mostrarToastMusica() {
  clearTimeout(ocultarToastId);
  toastMusica.hidden = false;
  requestAnimationFrame(() => toastMusica.classList.add("show"));
  ocultarToastId = setTimeout(() => {
    toastMusica.classList.remove("show");
    setTimeout(() => { toastMusica.hidden = true; }, 400);
  }, SEGUNDOS_TOAST * 1000);
}

function iniciarMusica() {
  musica.volume = 0;
  musica.play()
    .then(() => {
      subirVolumen();
      mostrarToastMusica();
    })
    .catch(() => marcarMusica(false));
  btnMusica.hidden = false;
}

function marcarMusica(sonando) {
  btnMusica.setAttribute("aria-pressed", String(sonando));
  btnMusica.setAttribute("aria-label", sonando ? "Pausar la música" : "Reanudar la música");
}

btnMusica.addEventListener("click", () => {
  if (musica.paused) {
    musica.play().then(() => {
      marcarMusica(true);
      mostrarToastMusica();
    }).catch(() => {});
  } else {
    musica.pause();
    marcarMusica(false);
  }
});

// Foto: entra flotando en una esquina; al tocarla se ve en grande.
const foto = document.getElementById("photo");
const vista = document.getElementById("photo-view");
const SEGUNDOS_HASTA_FOTO = 3;

function mostrarFoto() {
  foto.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => foto.classList.add("show")));
}

function abrirFoto() {
  vista.hidden = false;
  requestAnimationFrame(() => vista.classList.add("show"));
}

function cerrarFoto() {
  vista.classList.remove("show");
  setTimeout(() => { vista.hidden = true; }, 350);
}

// Arrastrar la polaroid por toda la pantalla (dedo o mouse).
// Un toque sin mover la abre en grande; si se arrastró, no se abre.
const UMBRAL_ARRASTRE = 6; // px que hay que mover para que cuente como arrastre
let arrastre = null;
let seArrastro = false;

// Posiciona la foto sin dejar que se salga de la pantalla.
function colocarFoto(x, y) {
  const maxX = window.innerWidth - foto.offsetWidth;
  const maxY = window.innerHeight - foto.offsetHeight;
  foto.style.left = Math.min(Math.max(0, x), maxX) + "px";
  foto.style.top = Math.min(Math.max(0, y), maxY) + "px";
  foto.style.right = "auto";
  foto.style.bottom = "auto";
}

foto.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  arrastre = {
    id: e.pointerId,
    dx: e.clientX - foto.offsetLeft,
    dy: e.clientY - foto.offsetTop,
    x0: e.clientX,
    y0: e.clientY,
  };
  seArrastro = false;
  foto.setPointerCapture(e.pointerId);
});

foto.addEventListener("pointermove", (e) => {
  if (!arrastre || e.pointerId !== arrastre.id) return;
  if (!seArrastro) {
    if (Math.hypot(e.clientX - arrastre.x0, e.clientY - arrastre.y0) < UMBRAL_ARRASTRE) return;
    seArrastro = true;
    foto.classList.add("dragging");
  }
  colocarFoto(e.clientX - arrastre.dx, e.clientY - arrastre.dy);
});

function soltarFoto(e) {
  if (!arrastre || e.pointerId !== arrastre.id) return;
  arrastre = null;
  foto.classList.remove("dragging");
}
foto.addEventListener("pointerup", soltarFoto);
foto.addEventListener("pointercancel", soltarFoto);

foto.addEventListener("click", () => {
  if (seArrastro) {
    seArrastro = false;
    return;
  }
  abrirFoto();
});

// Con teclado: flechas para moverla (Shift = pasos más largos).
foto.addEventListener("keydown", (e) => {
  const paso = e.shiftKey ? 60 : 20;
  const mov = { ArrowLeft: [-paso, 0], ArrowRight: [paso, 0], ArrowUp: [0, -paso], ArrowDown: [0, paso] }[e.key];
  if (!mov) return;
  e.preventDefault();
  colocarFoto(foto.offsetLeft + mov[0], foto.offsetTop + mov[1]);
});

// Si se gira el celular, que no quede fuera de la pantalla.
window.addEventListener("resize", () => {
  if (foto.style.left) colocarFoto(foto.offsetLeft, foto.offsetTop);
});
vista.addEventListener("click", cerrarFoto);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !vista.hidden) cerrarFoto();
});

btn.addEventListener("click", () => {
  iniciarMusica();
  setTimeout(mostrarFoto, SEGUNDOS_HASTA_FOTO * 1000);
  btn.classList.add("hide");
  hearts.classList.add("on");
  crearLuciernagas();
  setTimeout(() => mostrarMensaje(PRIMER_MENSAJE, true), 500);
}, { once: true });
