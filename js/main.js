/* =========================================================
   1. CONFIGURACIÓN — edita SOLO esta parte con tus datos
   ========================================================= */
const CONFIG = {
  nombre: "Keitlin",
  apellidos: "Agudelo García",
  nombreCompleto: "Keitlin Agudelo García",
  padre: "Jhonatan Agudelo",
  madre: "Katherine García",
  frase: "“Tu presencia hará que esta noche sea un recuerdo inolvidable y convertirá este sueño en el día más importante de mi vida.”",

  // Fecha y hora en formato ISO con zona horaria de Colombia (-05:00)
  fechaEvento: "2026-12-19T20:00:00-05:00",
  fechaTexto: "Sábado 19 de diciembre de 2026",
  fechaCorta: "19 · 12 · 2026",
  hora: "8:00 p. m.",

  lugar: {
    direccion: "Calle 37 # 9D-03",
    ciudad: "El Campito, Barranquilla, Atlántico",
    mapsUrl: "https://maps.app.goo.gl/6yihX9d9K3eJJbQn8"
  },

  // Música (debe coincidir EXACTO con el nombre del archivo, con mayúsculas)
  musica: "assets/audio/Enredados.mp3",
  inicioMusica: 0,                 // segundo en el que empieza la canción
  cancion: {          // nombre que se ve en la página de música
    detalle: "Dale play y vive la magia conmigo ✨"
  },

  // Galería: 3 fotos de la quinceañera (súbelas a assets/img/)
  fotos: [
    "assets/img/foto1.jpg",
    "assets/img/foto2.jpg",
    "assets/img/foto3.jpg"
  ],

  vestimenta: "Formal",
  notaVestimenta: "El color lila está reservado para la quinceañera."
};

/* =========================================================
   2. UTILIDADES
   ========================================================= */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const leer = (ruta) => ruta.split(".").reduce((o, k) => (o ? o[k] : undefined), CONFIG);

const params = new URLSearchParams(location.search);
const INVITADO = (params.get("invitado") || "").trim().slice(0, 60);

/* =========================================================
   3. TEXTOS DESDE LA CONFIGURACIÓN
   ========================================================= */
function aplicarConfig() {
  $$("[data-config]").forEach((el) => {
    const valor = leer(el.dataset.config);
    if (typeof valor === "string") {
      el.textContent = valor;
      el.hidden = valor.trim() === "";
    }
  });
  document.title = `Mis XV Años · ${CONFIG.nombre}`;
  if (INVITADO) $("#saludoInvitado").textContent = `${INVITADO}, estás invitado(a) a`;
}

/* =========================================================
   4. GALERÍA DE FOTOS (una página con las 3 fotos)
   ========================================================= */
function renderGaleria() {
  const g = $("#galeria");
  CONFIG.fotos.forEach((src, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "foto";
    btn.setAttribute("aria-label", `Ver foto ${i + 1} en grande`);
    const img = new Image();
    img.alt = `Foto ${i + 1} de ${CONFIG.nombre}`;
    img.src = src;
    img.onerror = () => { btn.classList.add("vacia"); img.remove(); };
    btn.appendChild(img);
    btn.addEventListener("click", () => { if (!btn.classList.contains("vacia")) abrirFoto(i); });
    g.appendChild(btn);
  });
}

/* =========================================================
   5. LIBRO CON ANIMACIÓN DE PÁGINAS
   ========================================================= */
let hojas = [];
let actual = 0;
let tActiva;

function prepararLibro() {
  hojas = $$(".hoja");

  hojas.forEach((hoja, i) => {
    const frente = hoja.querySelector(".frente");
    frente.insertAdjacentHTML("beforeend",
      `<svg class="deco-esq sup" aria-hidden="true"><use href="#esquinaFlor"/></svg>
       <svg class="deco-esq inf" aria-hidden="true"><use href="#esquinaFlor"/></svg>
       <span class="num-pag">${i + 1}</span>`);

    if (i < hojas.length - 1) {
      const esquina = document.createElement("button");
      esquina.className = "esquina";
      esquina.setAttribute("aria-label", "Pasar página");
      esquina.addEventListener("click", siguiente);
      frente.appendChild(esquina);
    }

    hoja.insertAdjacentHTML("beforeend",
      `<div class="cara reverso" aria-hidden="true"><svg><use href="#torre"/></svg></div>`);

    hoja.addEventListener("transitionend", (e) => {
      if (e.propertyName === "transform") hoja.classList.remove("girando");
    });

    // Orden de aparición de cada texto (efecto escalonado)
    [...hoja.querySelector(".pagina").children].forEach((el, k) => el.style.setProperty("--i", k));
  });

  $("#btnSiguiente").addEventListener("click", siguiente);
  $("#btnAnterior").addEventListener("click", anterior);

  document.addEventListener("keydown", (e) => {
    if (!$("#lightbox").hidden) return;
    if (e.key === "ArrowRight") siguiente();
    if (e.key === "ArrowLeft") anterior();
  });

  let x0 = 0, y0 = 0;
  const libro = $("#libro");
  libro.addEventListener("touchstart", (e) => {
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
  }, { passive: true });
  libro.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - x0;
    const dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? siguiente() : anterior();
  }, { passive: true });

  actualizarLibro();
}

function siguiente() {
  if (actual >= hojas.length - 1) return;
  hojas[actual].classList.add("girando", "volteada");
  actual++;
  actualizarLibro();
  marcarActiva(0);
}

function anterior() {
  if (actual <= 0) return;
  actual--;
  const hoja = hojas[actual];
  hoja.classList.add("girando");
  hoja.classList.remove("volteada");
  actualizarLibro();
  marcarActiva(0);
}

// Activa los efectos de texto de la página visible
function marcarActiva(retraso) {
  clearTimeout(tActiva);
  hojas.forEach((h) => h.classList.remove("activa"));
  const hoja = hojas[actual];
  tActiva = setTimeout(() => hoja.classList.add("activa"), retraso);
}

function actualizarLibro() {
  const total = hojas.length;
  hojas.forEach((h, i) => {
    h.style.zIndex = h.classList.contains("volteada") ? i + 1 : total - i + total;
    h.setAttribute("aria-hidden", i === actual ? "false" : "true");
  });
  $("#libro").classList.toggle("abierto", actual > 0);
  $("#indicador").textContent = `${actual + 1} / ${total}`;
  $("#btnAnterior").disabled = actual === 0;
  $("#btnSiguiente").disabled = actual === total - 1;
}

/* =========================================================
   6. CUENTA REGRESIVA
   ========================================================= */
function iniciarCuentaRegresiva() {
  const objetivo = new Date(CONFIG.fechaEvento).getTime();
  const dos = (n) => String(n).padStart(2, "0");
  let intervalo;

  function tick() {
    const resta = objetivo - Date.now();
    if (resta <= 0) {
      ["#cDias", "#cHoras", "#cMin", "#cSeg"].forEach((s) => ($(s).textContent = "00"));
      $("#cuentaMensaje").textContent = "¡Hoy es el gran día! ✨";
      clearInterval(intervalo);
      return;
    }
    $("#cDias").textContent = dos(Math.floor(resta / 86400000));
    $("#cHoras").textContent = dos(Math.floor((resta / 3600000) % 24));
    $("#cMin").textContent = dos(Math.floor((resta / 60000) % 60));
    $("#cSeg").textContent = dos(Math.floor((resta / 1000) % 60));
  }
  intervalo = setInterval(tick, 1000);
  tick();
}

/* =========================================================
   7. BOTONES DE UBICACIÓN
   ========================================================= */
function prepararUbicacion() {
  const l = CONFIG.lugar;
  const q = encodeURIComponent([l.nombre, l.direccion, l.ciudad, "Colombia"].filter(Boolean).join(", "));
  $("#btnMaps").href = l.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${q}`;
  const waze = $("#btnWaze");
  if (waze) waze.href = l.wazeUrl || `https://waze.com/ul?q=${q}&navigate=yes`;
}

/* =========================================================
   8. VISOR DE FOTOS
   ========================================================= */
let fotoActual = 0;
function prepararVisor() {
  $("#lbCerrar").addEventListener("click", cerrarFoto);
  $("#lightbox").addEventListener("click", (e) => { if (e.target.id === "lightbox") cerrarFoto(); });
  $("#lbPrev").addEventListener("click", () => moverFoto(-1));
  $("#lbNext").addEventListener("click", () => moverFoto(1));
  document.addEventListener("keydown", (e) => {
    if ($("#lightbox").hidden) return;
    if (e.key === "Escape") cerrarFoto();
    if (e.key === "ArrowRight") moverFoto(1);
    if (e.key === "ArrowLeft") moverFoto(-1);
  });
}
function abrirFoto(i) {
  fotoActual = i;
  $("#lbImg").src = CONFIG.fotos[i];
  $("#lightbox").hidden = false;
}
function cerrarFoto() { $("#lightbox").hidden = true; }
function moverFoto(paso) {
  const n = CONFIG.fotos.length;
  abrirFoto((fotoActual + paso + n) % n);
}

/* =========================================================
   11. MÚSICA (disco en la esquina del libro)
   ========================================================= */
let musicaPausadaPorUsuario = false;
function prepararMusica() {
  const audio = $("#audio");
  const disco = $("#btnMusica");
  const VUELTA = 169.65; // largo del anillo de progreso
  audio.src = CONFIG.musica || "assets/audio/Enredados.mp3";
  audio.volume = 0.6;

  const pintar = () => {
    const pct = audio.duration ? audio.currentTime / audio.duration : 0;
    $("#anilloProgreso").style.strokeDashoffset = VUELTA * (1 - pct);
  };
  const estado = (sonando) => {
    disco.classList.toggle("sonando", sonando);
    disco.setAttribute("aria-label", sonando ? "Pausar música" : "Reproducir música");
  };

  audio.addEventListener("loadedmetadata", () => {
    if (CONFIG.inicioMusica) audio.currentTime = CONFIG.inicioMusica;
    pintar();
  }, { once: true });
  audio.addEventListener("play", () => estado(true));
  audio.addEventListener("pause", () => estado(false));
  audio.addEventListener("timeupdate", pintar);

  disco.addEventListener("click", () => {
    if (audio.paused) { musicaPausadaPorUsuario = false; reproducir(); }
    else { musicaPausadaPorUsuario = true; audio.pause(); }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) audio.pause();
    else if (!musicaPausadaPorUsuario && !$("#escenario").classList.contains("oculto")) reproducir();
  });
}
function reproducir() {
  const p = $("#audio").play();
  if (p) p.catch((e) => console.warn("No se pudo reproducir el audio:", e.message));
}

/* =========================================================
   12. BIENVENIDA Y FAROLES
   ========================================================= */
function prepararBienvenida() {
  [...$(".sobre").children].forEach((el, k) => el.style.setProperty("--i", k));
  let abierta = false;

  const mostrarLibro = (cine) => {
    $("#bienvenida").classList.add("salir");
    $("#escenario").classList.remove("oculto");
    if (cine) $("#escenario").classList.add("cine-entra");
  };

  $("#btnAbrir").addEventListener("click", () => {
    if (abierta) return;
    abierta = true;
    reproducir(); // los navegadores solo permiten audio después de un toque

    const sinMovimiento = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (sinMovimiento) { mostrarLibro(false); return; }
    try { transicionCine($("#btnAbrir"), () => mostrarLibro(true)); }
    catch (err) { console.error(err); mostrarLibro(false); }
  });
}

/* =========================================================
   13. TRANSICIÓN TIPO PELÍCULA: franjas de cine, destello,
       chispas doradas, flores y pétalos que caen
   ========================================================= */
function transicionCine(origen, alCambiar) {
  const cine = $("#cine");
  const cv = $("#cineCanvas");
  const ctx = cv.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = innerWidth, H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const r = origen.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  cine.style.setProperty("--x", `${cx}px`);
  cine.style.setProperty("--y", `${cy}px`);

  const rnd = (a, b) => a + Math.random() * (b - a);
  const COLORES = ["#c9a6e8", "#f2b8cf", "#ffffff", "#e4d3ff", "#f7c6dd"];
  const parts = [];

  // Chispas doradas que estallan desde el sello
  for (let i = 0; i < 90; i++) {
    const a = rnd(0, Math.PI * 2), v = rnd(2, 11);
    parts.push({ t: "chispa", x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
      edad: 0, vida: rnd(50, 95), tam: rnd(2, 5.5), c: Math.random() < 0.7 ? "#f3dc8a" : "#ffffff" });
  }
  // Flores que salen disparadas
  for (let i = 0; i < 18; i++) {
    const a = rnd(0, Math.PI * 2), v = rnd(3, 8);
    parts.push({ t: "flor", x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, g: 0.12,
      rot: rnd(0, 6), vr: rnd(-0.08, 0.08), edad: 0, vida: rnd(110, 170), tam: rnd(7, 13), c: COLORES[i % COLORES.length] });
  }
  // Pétalos y flores que caen sobre el libro
  const nPet = W < 600 ? 45 : 80;
  for (let i = 0; i < nPet; i++) {
    parts.push({ t: Math.random() < 0.3 ? "flor" : "petalo", cae: true,
      x: rnd(0, W), y: rnd(-H * 0.5, -20), vx: rnd(-0.6, 0.6), vy: rnd(1.4, 3.2), g: 0,
      rot: rnd(0, 6), vr: rnd(-0.05, 0.05), fase: rnd(0, 6),
      edad: -rnd(25, 70), vida: rnd(200, 280), tam: rnd(5, 10), c: COLORES[i % COLORES.length] });
  }

  const chispa = (p, al) => {
    const s = p.tam * (1 + (1 - al));
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = al * 0.35;
    ctx.fillStyle = p.c;
    ctx.beginPath(); ctx.arc(p.x, p.y, s * 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = al;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - s * 2.2); ctx.lineTo(p.x + s * 0.4, p.y);
    ctx.lineTo(p.x, p.y + s * 2.2); ctx.lineTo(p.x - s * 0.4, p.y); ctx.closePath();
    ctx.moveTo(p.x - s * 2.2, p.y); ctx.lineTo(p.x, p.y + s * 0.4);
    ctx.lineTo(p.x + s * 2.2, p.y); ctx.lineTo(p.x, p.y - s * 0.4); ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  };
  const flor = (p, al) => {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = al;
    ctx.fillStyle = p.c;
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      ctx.beginPath(); ctx.arc(Math.cos(a) * p.tam * 0.45, Math.sin(a) * p.tam * 0.45, p.tam * 0.42, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = "#f3d36b";
    ctx.beginPath(); ctx.arc(0, 0, p.tam * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };
  const petalo = (p, al) => {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = al * 0.9;
    ctx.fillStyle = p.c;
    ctx.beginPath(); ctx.ellipse(0, 0, p.tam, p.tam * 0.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };

  // Secuencia de la "película"
  cine.classList.remove("salida");
  cine.classList.add("activo");
  origen.classList.add("presionado");
  $(".sobre").classList.add("cine-sale");
  setTimeout(alCambiar, 750);                               // el libro aparece bajo el destello
  setTimeout(() => cine.classList.add("salida"), 2000);     // se retiran las franjas de cine

  const DURACION = 4300;
  let inicio = null, ultimo = null;
  function cuadro(t) {
    if (inicio === null) { inicio = t; ultimo = t; }
    const f = Math.min((t - ultimo) / 16.67, 3);
    ultimo = t;
    ctx.clearRect(0, 0, W, H);
    let vivas = 0;
    for (const p of parts) {
      p.edad += f;
      if (p.edad < 0) { vivas++; continue; }
      if (p.edad > p.vida) continue;
      vivas++;
      if (p.cae) {
        p.x += (p.vx + Math.sin(p.edad * 0.05 + p.fase) * 0.8) * f;
        p.y += p.vy * f;
      } else {
        p.vx *= 0.97; p.vy = p.vy * 0.97 + (p.g || 0) * f;
        p.x += p.vx * f; p.y += p.vy * f;
      }
      if (p.vr) p.rot += p.vr * f;
      const al = Math.max(0, Math.min(1, (p.vida - p.edad) / 40, p.edad / 8));
      if (p.t === "chispa") chispa(p, al);
      else if (p.t === "flor") flor(p, al);
      else petalo(p, al);
    }
    ctx.globalAlpha = 1;
    if (t - inicio < DURACION && vivas > 0) requestAnimationFrame(cuadro);
    else {
      ctx.clearRect(0, 0, W, H);
      cine.classList.remove("activo", "salida");
    }
  }
  requestAnimationFrame(cuadro);
}

function crearFaroles() {
  const cont = $("#faroles");
  const cantidad = innerWidth < 600 ? 14 : 24;
  for (let i = 0; i < cantidad; i++) {
    const f = document.createElement("span");
    f.className = "farol";
    const t = 10 + Math.random() * 18;
    f.style.cssText = `left:${Math.random() * 100}%;width:${t}px;height:${t * 1.3}px;` +
      `animation-duration:${16 + Math.random() * 18}s;animation-delay:${-Math.random() * 34}s;` +
      `opacity:${0.45 + Math.random() * 0.55}`;
    cont.appendChild(f);
  }
}

/* =========================================================
   INICIO
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  // El sello y la música van primero: así siempre funcionan, aunque otra parte falle
  const pasos = [
    prepararBienvenida, prepararMusica, aplicarConfig, renderGaleria, prepararLibro,
    prepararVisor, prepararUbicacion, iniciarCuentaRegresiva, crearFaroles
  ];
  pasos.forEach((paso) => {
    try { paso(); }
    catch (err) { console.error(`Error en ${paso.name}:`, err); }
  });
});