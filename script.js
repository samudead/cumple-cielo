/* =========================
   ELEMENTOS
========================= */

const loadingScreen   = document.getElementById("loading-screen");
const mainContent     = document.getElementById("main-content");
const themeButton     = document.getElementById("theme-button");
const flowerButton    = document.getElementById("flower-button");
const garden          = document.getElementById("garden");
const flowerMessage   = document.getElementById("flower-message");
const flowerCounter   = document.getElementById("flower-counter");
const spiderArea      = document.getElementById("spider-area");
const spider          = document.getElementById("spider");
const spiderThread    = document.getElementById("spider-thread");
const spiderDialog    = document.getElementById("spider-dialog");
const webSvg          = document.getElementById("web-svg");
const webLines        = document.getElementById("web-lines");
const compassCards    = document.querySelectorAll(".compass-card");
const compassMessage  = document.getElementById("compass-message");
const compassCounter  = document.getElementById("compass-counter");
const secretButton    = document.getElementById("secret-button");
const secretMessage   = document.getElementById("secret-message");


/* =========================
   PANTALLA DE CARGA
========================= */

document.addEventListener("DOMContentLoaded", () => {

    const loadingBar  = document.getElementById("loading-bar");
    const loadingText = document.getElementById("loading-text");
    const loadingPct  = document.getElementById("loading-percentage");

    if (!loadingScreen || !loadingBar || !loadingText) {
        console.error("Faltan elementos de la pantalla de carga.");
        return;
    }

    const messages = [
        "Iniciando...",
        "Cargando recursos...",
        "Preparando flores...",
        "Buscando recuerdos...",
        "Organizando unas cuantas palabras...",
        "Esto está tardando más de lo esperado...",
        "Ah, es que son demasiadas cosas que decirte.",
        "Cargando amor...",
        "Te amo...",
        "Todo listo."
    ];

    let progress     = 0;
    let messageIndex = 0;

    loadingText.textContent = messages[0];
    loadingBar.style.width  = "0%";
    if (loadingPct) loadingPct.textContent = "0%";

    const loadingInterval = setInterval(() => {

        progress += Math.floor(Math.random() * 8) + 3;
        if (progress > 100) progress = 100;

        loadingBar.style.width = `${progress}%`;
        if (loadingPct) loadingPct.textContent = `${progress}%`;

        const newMessageIndex = Math.min(
            Math.floor(progress / 11),
            messages.length - 1
        );

        if (newMessageIndex !== messageIndex) {
            messageIndex = newMessageIndex;
            loadingText.textContent = messages[messageIndex];
        }

        if (progress >= 100) {

            clearInterval(loadingInterval);
            loadingText.textContent = "Todo listo.";
            if (loadingPct) loadingPct.textContent = "100%";

            setTimeout(() => {

                loadingScreen.classList.add("loading-finished");

                setTimeout(() => {
                    loadingScreen.style.display = "none";
                    mainContent.classList.remove("hidden");
                }, 700);

            }, 500);
        }

    }, 250);

});


/* =========================
   CAMBIO DE TEMA
========================= */

const themes = ["theme-night", "theme-spring", "theme-grandline"];
let currentTheme = 0;

themeButton.addEventListener("click", () => {
    document.body.classList.remove(...themes);
    currentTheme++;
    if (currentTheme >= themes.length) currentTheme = 0;
    document.body.classList.add(themes[currentTheme]);
});


/* =========================================================
   FLORES — SISTEMA COMPLETO
   =========================================================
   Contadores internos para el sistema de progreso futuro.
   flowersPlanted → total de flores plantadas
   specialFlowers → flores especiales encontradas (futuro)
   flowerRegistry → array con datos de cada flor individual
   ========================================================= */

let flowersPlanted = 0;
let specialFlowers = 0;
const flowerRegistry = [];

/* Probabilidad de flor especial (rarísima: ~4%) */
const SPECIAL_FLOWER_CHANCE = 0.04;

/* Mínima separación horizontal entre flores (px) */
const FLOWER_MIN_SEPARATION = 38;


/* =========================================================
   GENERACIÓN PROCEDURAL DE FLORES SVG
   =========================================================
   Cada llamada devuelve un SVGElement diferente.
   Parámetros todos aleatorios dentro de rangos.
   ========================================================= */

function buildFlowerSVG(isSpecial) {

    const petalCount  = 5 + Math.floor(Math.random() * 4);   /* 5-8 */
    const petalLen    = 18 + Math.random() * 14;               /* 18-32 */
    const petalWidth  = 7  + Math.random() * 7;                /* 7-14 */
    const centerR     = 5  + Math.random() * 4;                /* 5-9 */
    const stemH       = 70 + Math.random() * 70;               /* 70-140 */
    const stemW       = 2  + Math.random() * 1.5;              /* 2-3.5 */
    const leafCount   = Math.random() < 0.4 ? 2 : 1;
    const leafPos     = 0.4 + Math.random() * 0.3;             /* 40-70% del tallo */
    const tiltAngle   = (Math.random() - 0.5) * 8;             /* ligera inclinación */

    /* Paleta de color */
    const hue = isSpecial
        ? 280 + Math.random() * 60        /* violeta/rosa para especial */
        : 42  + (Math.random() - 0.5) * 12; /* amarillo dorado */

    const petalSat  = isSpecial ? 70 : 85 + Math.random() * 10;
    const petalLit  = isSpecial ? 65 : 60 + Math.random() * 15;
    const centerHue = isSpecial ? hue + 20 : hue - 15;

    const stemGreen = `hsl(${100 + Math.random() * 20}, ${60 + Math.random() * 15}%, ${32 + Math.random() * 12}%)`;
    const petalColor = `hsl(${hue}, ${petalSat}%, ${petalLit}%)`;
    const petalDark  = `hsl(${hue - 5}, ${petalSat}%, ${petalLit - 12}%)`;
    const centerColor= `hsl(${centerHue}, 80%, 38%)`;

    /* ViewBox: ancho centrado en la cabeza de la flor */
    const vbW = (petalLen + centerR) * 2 + 20;
    const headY = petalLen + centerR + 5;
    const totalH = headY + stemH + 10;
    const cx = vbW / 2;

    const ns = "http://www.w3.org/2000/svg";

    /* ---- SVG raíz ---- */
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", `0 0 ${vbW} ${totalH}`);
    svg.setAttribute("width",   `${vbW}`);
    svg.setAttribute("height",  `${totalH}`);
    svg.style.overflow = "visible";

    /* ---- Defs: gradiente pétalos ---- */
    const defs = document.createElementNS(ns, "defs");

    const gid = `pgrad-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const grad = document.createElementNS(ns, "radialGradient");
    grad.setAttribute("id", gid);
    grad.setAttribute("cx", "30%");
    grad.setAttribute("cy", "30%");
    grad.setAttribute("r",  "70%");

    const s1 = document.createElementNS(ns, "stop");
    s1.setAttribute("offset", "0%");
    s1.setAttribute("stop-color", petalColor);
    const s2 = document.createElementNS(ns, "stop");
    s2.setAttribute("offset", "100%");
    s2.setAttribute("stop-color", petalDark);

    grad.appendChild(s1);
    grad.appendChild(s2);
    defs.appendChild(grad);
    svg.appendChild(defs);

    /* ---- Grupo de la flor (cabeza) ---- */
    const headG = document.createElementNS(ns, "g");
    headG.setAttribute("class", "flower-head");
    headG.style.transformOrigin = `${cx}px ${headY}px`;
    headG.style.animation = "petals-open 0.6s 0.7s cubic-bezier(0.34,1.56,0.64,1) both";

    /* Pétalos */
    for (let i = 0; i < petalCount; i++) {

        const angle = (360 / petalCount) * i;
        const jitter = (Math.random() - 0.5) * (360 / petalCount) * 0.35;

        const petal = document.createElementNS(ns, "ellipse");
        petal.setAttribute("cx", cx);
        petal.setAttribute("cy", headY - petalLen / 2);
        petal.setAttribute("rx", petalWidth / 2);
        petal.setAttribute("ry", petalLen / 2);
        petal.setAttribute("fill", `url(#${gid})`);
        petal.setAttribute("opacity", 0.92 + Math.random() * 0.08);
        petal.style.transformOrigin = `${cx}px ${headY}px`;
        petal.style.transform = `rotate(${angle + jitter}deg)`;

        headG.appendChild(petal);
    }

    /* Centro de la flor */
    const center = document.createElementNS(ns, "circle");
    center.setAttribute("cx", cx);
    center.setAttribute("cy", headY);
    center.setAttribute("r",  centerR);
    center.setAttribute("fill", centerColor);

    /* Pequeños puntos en el centro */
    for (let d = 0; d < 4; d++) {
        const dot = document.createElementNS(ns, "circle");
        const da  = (Math.PI * 2 / 4) * d;
        dot.setAttribute("cx", cx + Math.cos(da) * (centerR * 0.55));
        dot.setAttribute("cy", headY + Math.sin(da) * (centerR * 0.55));
        dot.setAttribute("r",  1);
        dot.setAttribute("fill", petalColor);
        dot.setAttribute("opacity", "0.7");
        headG.appendChild(dot);
    }

    headG.appendChild(center);
    svg.appendChild(headG);

    /* ---- Tallo ---- */
    const stemG = document.createElementNS(ns, "g");
    stemG.style.transformOrigin = `${cx}px ${totalH}px`;
    stemG.style.animation = "stem-grow 0.55s cubic-bezier(0.4,0,0.2,1) both";

    /* Curva suave del tallo */
    const cpX = cx + (Math.random() - 0.5) * 12;
    const stem = document.createElementNS(ns, "path");
    stem.setAttribute("d", `M ${cx},${headY} Q ${cpX},${headY + stemH * 0.5} ${cx},${totalH}`);
    stem.setAttribute("fill", "none");
    stem.setAttribute("stroke", stemGreen);
    stem.setAttribute("stroke-width", stemW);
    stem.setAttribute("stroke-linecap", "round");
    stemG.appendChild(stem);

    /* Hojas */
    for (let l = 0; l < leafCount; l++) {

        const side   = l % 2 === 0 ? 1 : -1;
        const posY   = headY + stemH * (leafPos + l * 0.2);
        const leafW  = 10 + Math.random() * 8;
        const leafH  = 18 + Math.random() * 12;
        const leafRot= side * (25 + Math.random() * 20);

        const leaf = document.createElementNS(ns, "ellipse");
        leaf.setAttribute("cx", cx + side * (leafW * 0.7));
        leaf.setAttribute("cy", posY);
        leaf.setAttribute("rx", leafW / 2);
        leaf.setAttribute("ry", leafH / 2);
        leaf.setAttribute("fill", stemGreen);
        leaf.setAttribute("opacity", "0.85");
        leaf.style.transformOrigin = `${cx}px ${posY}px`;
        leaf.style.transform  = `rotate(${leafRot}deg)`;
        leaf.style.animation  = `leaf-appear 0.4s ${0.5 + l * 0.15}s ease both`;

        stemG.appendChild(leaf);
    }

    svg.appendChild(stemG);

    /* Inclinación global de toda la flor */
    svg.style.transform      = `rotate(${tiltAngle}deg)`;
    svg.style.transformOrigin = "bottom center";

    return { svg, stemH, vbW, totalH };
}


/* =========================================================
   POSICIÓN EN EL JARDÍN (evitar solapamientos)
   ========================================================= */

const usedPositions = [];

function findFlowerPosition(flowerW) {

    const gardenW = garden.clientWidth || 600;
    const margin  = 10;
    const maxTries = 30;

    for (let t = 0; t < maxTries; t++) {

        const candidate = margin + Math.random() * (gardenW - flowerW - margin * 2);

        const tooClose = usedPositions.some(
            p => Math.abs(p - candidate) < FLOWER_MIN_SEPARATION
        );

        if (!tooClose) {
            usedPositions.push(candidate);
            return candidate;
        }
    }

    /* Si no encuentra espacio libre, usa una posición aleatoria de todas formas */
    const fallback = margin + Math.random() * (gardenW - flowerW - margin * 2);
    usedPositions.push(fallback);
    return fallback;
}


/* =========================================================
   PARTÍCULAS AL TOCAR
   ========================================================= */

function spawnParticles(flowerEl, count) {

    const rect = flowerEl.getBoundingClientRect();
    const gardenRect = garden.getBoundingClientRect();

    const cx = rect.left + rect.width  / 2 - gardenRect.left;
    const cy = rect.top  + rect.height / 2 - gardenRect.top;

    for (let i = 0; i < count; i++) {

        const p = document.createElement("div");
        p.className = "flower-particle";

        const angle = Math.random() * Math.PI * 2;
        const dist  = 20 + Math.random() * 30;

        p.style.setProperty("--px", `${Math.cos(angle) * dist}px`);
        p.style.setProperty("--py", `${Math.sin(angle) * dist - 10}px`);
        p.style.left = `${cx}px`;
        p.style.top  = `${cy}px`;
        p.style.animationDelay = `${Math.random() * 0.1}s`;

        garden.appendChild(p);
        setTimeout(() => p.remove(), 700);
    }
}


/* =========================================================
   PLANTAR UNA FLOR
   ========================================================= */

function plantFlower() {

    flowersPlanted++;
    flowerCounter.textContent = flowersPlanted;

    /* ¿Flor especial? */
    const isSpecial = Math.random() < SPECIAL_FLOWER_CHANCE;
    if (isSpecial) specialFlowers++;

    /* Generar SVG procedural */
    const { svg, stemH, vbW, totalH } = buildFlowerSVG(isSpecial);

    /* Crear contenedor */
    const wrapper = document.createElement("div");
    wrapper.className = "garden-flower" + (isSpecial ? " special-flower" : "");

    /* Posición horizontal sin solapar */
    const posX = findFlowerPosition(vbW);
    wrapper.style.left   = `${posX}px`;
    wrapper.style.width  = `${vbW}px`;
    wrapper.style.height = `${totalH}px`;

    /* Balanceo individual asíncrono */
    const swayDuration = 2.8 + Math.random() * 2.4;
    const swayDelay    = Math.random() * 2;
    wrapper.style.animation = `flower-sway ${swayDuration}s ${swayDelay}s ease-in-out infinite`;

    wrapper.appendChild(svg);
    garden.appendChild(wrapper);

    /* Guardar en registro */
    const flowerData = {
        id:        flowersPlanted,
        isSpecial,
        posX,
        element:   wrapper,
        planted:   Date.now()
    };
    flowerRegistry.push(flowerData);

    /* Interacción al tocar la flor */
    wrapper.addEventListener("click", () => onFlowerClick(wrapper, flowerData));

    /* Mensaje progresivo */
    updateFlowerMessage(flowersPlanted);
}

function updateFlowerMessage(count) {

    if (count === 1)       flowerMessage.textContent = "Esta es para ti. 🌼";
    else if (count === 3)  flowerMessage.textContent = "Siguen creciendo...";
    else if (count === 5)  flowerMessage.textContent = "Creo que estoy empezando a llenar esto de flores...";
    else if (count === 10) flowerMessage.textContent = "Bueno... supongo que tendré que seguir. ❤️";
    else if (count === 15) flowerMessage.textContent = "Ya casi no hay espacio...";
    else if (count > 15)   flowerMessage.textContent = "Todavía no son suficientes.";
}


/* =========================================================
   INTERACCIÓN AL TOCAR UNA FLOR
   ========================================================= */

function onFlowerClick(wrapper, data) {

    /* Animación de toque */
    wrapper.style.animation = "flower-tap 0.5s ease forwards";

    setTimeout(() => {
        /* Restaurar balanceo */
        const swayDuration = 2.8 + Math.random() * 2.4;
        wrapper.style.animation = `flower-sway ${swayDuration}s ease-in-out infinite`;
    }, 550);

    /* Partículas */
    spawnParticles(wrapper, 6);

    /* Aquí se podrá añadir lógica de mensajes secretos por flor */
    /* data.id, data.isSpecial disponibles */
}


/* =========================================================
   BOTÓN
   ========================================================= */

flowerButton.addEventListener("click", plantFlower);


/* =========================================================
   SISTEMA DE ARAÑAS
   =========================================================
   Variables de progreso internas (para Archivo Secreto).
   spidersFound      → total de clics en cualquier araña
   gothicSpiders     → clics en araña gótica
   spidermanSpiders  → clics en araña Spider-Man
   ========================================================= */

let spidersFound     = 0;
let gothicSpiders    = 0;
let spidermanSpiders = 0;

/* ¿Hay alguna araña activa ahora mismo? */
let spiderActive = false;

/* Referencia al timeout del ciclo de aparición */
let spiderCycleTimeout = null;

/* SVG de la araña gótica (la que ya existe en el DOM) */
const GOTHIC_SVG = spider.innerHTML;

/* SVG de la araña Spider-Man — silueta estilizada */
const SPIDERMAN_SVG = `
<svg class="spider-svg" viewBox="0 0 100 130"
     xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="sm-body" cx="40%" cy="30%" r="60%">
      <stop offset="0%"   stop-color="#1a1a1a"/>
      <stop offset="100%" stop-color="#000"/>
    </radialGradient>
  </defs>
  <!-- Cuerpo central compacto -->
  <ellipse cx="50" cy="42" rx="10" ry="13" fill="url(#sm-body)" stroke="#000" stroke-width="1"/>
  <ellipse cx="50" cy="62" rx="9"  ry="12" fill="url(#sm-body)" stroke="#000" stroke-width="1"/>

  <!-- Patas superiores muy angulares y largas (estilo Garfield) -->
  <!-- L1 sube y se dobla muy abierto -->
  <path class="s-leg sm-leg" d="M 42,36 L 20,10 L 0,-2"/>
  <!-- L2 horizontal con codo alto -->
  <path class="s-leg sm-leg" d="M 40,44 L 14,30 L -6,24"/>
  <!-- L3 diagonal baja -->
  <path class="s-leg sm-leg" d="M 40,54 L 16,64 L -2,80"/>
  <!-- L4 muy abajo -->
  <path class="s-leg sm-leg" d="M 42,62 L 22,86 L 10,112"/>

  <!-- R1 -->
  <path class="s-leg sm-leg" d="M 58,36 L 80,10 L 100,-2"/>
  <!-- R2 -->
  <path class="s-leg sm-leg" d="M 60,44 L 86,30 L 106,24"/>
  <!-- R3 -->
  <path class="s-leg sm-leg" d="M 60,54 L 84,64 L 102,80"/>
  <!-- R4 -->
  <path class="s-leg sm-leg" d="M 58,62 L 78,86 L 90,112"/>

  <!-- Ojos brillantes -->
  <ellipse cx="44" cy="37" rx="3.5" ry="2.5" fill="#e6c84f" opacity="0.9"/>
  <ellipse cx="56" cy="37" rx="3.5" ry="2.5" fill="#e6c84f" opacity="0.9"/>
</svg>`;


/* =========================================================
   HELPERS — POSICIONES DESDE LOS BORDES
   =========================================================
   Calcula una posición de entrada en un borde del área
   y una posición "dentro" a la que se desplazará.
   ========================================================= */

function getEdgePosition() {

    const W  = spiderArea.clientWidth;
    const H  = spiderArea.clientHeight;
    const sw = spider.offsetWidth  || 80;
    const sh = spider.offsetHeight || 96;

    /* 0=top 1=right 2=bottom 3=left, con esquinas incluidas */
    const edge = Math.floor(Math.random() * 4);

    let startX, startY, enterX, enterY;

    /* margen de penetración: cuánto entra dentro del área */
    const peekInX = sw * 0.4 + Math.random() * sw * 0.8;
    const peekInY = sh * 0.4 + Math.random() * sh * 0.7;

    if (edge === 0) {
        /* Borde superior */
        startX = Math.random() * (W - sw);
        startY = -sh;
        enterX = startX + (Math.random() - 0.5) * 40;
        enterY = peekInY;

    } else if (edge === 1) {
        /* Borde derecho */
        startX = W;
        startY = Math.random() * (H - sh);
        enterX = W - peekInX;
        enterY = startY + (Math.random() - 0.5) * 40;

    } else if (edge === 2) {
        /* Borde inferior */
        startX = Math.random() * (W - sw);
        startY = H;
        enterX = startX + (Math.random() - 0.5) * 40;
        enterY = H - peekInY;

    } else {
        /* Borde izquierdo */
        startX = -sw;
        startY = Math.random() * (H - sh);
        enterX = peekInX;
        enterY = startY + (Math.random() - 0.5) * 40;
    }

    /* Clamp: que enterX/Y no salgan del área */
    enterX = Math.max(0, Math.min(W - sw, enterX));
    enterY = Math.max(0, Math.min(H - sh, enterY));

    return { startX, startY, enterX, enterY, edge };
}


/* =========================================================
   TELARAÑA PROCEDURAL
   ========================================================= */

/*
 * Añade un path SVG animado con stroke-dasharray/dashoffset.
 * totalLength se aproxima con getPathLength o un valor fijo.
 */
function addAnimatedPath(d, delay, duration, strokeW, opacity) {

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", strokeW.toString());
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("opacity", opacity.toString());

    /* Primero lo añadimos invisible */
    path.style.strokeDasharray  = "2000";
    path.style.strokeDashoffset = "2000";
    path.style.transition       = "none";

    webLines.appendChild(path);

    /* Forzar reflow y animar */
    requestAnimationFrame(() => {
        setTimeout(() => {
            path.style.transition =
                `stroke-dashoffset ${duration}ms cubic-bezier(0.4,0,0.6,1)`;
            path.style.strokeDashoffset = "0";
        }, delay);
    });

    return path;
}

/*
 * rng: función que devuelve float en [-1,1] sesgado (ruido suave).
 */
function jitter(amount) {
    return (Math.random() - 0.5) * 2 * amount;
}

/*
 * Genera una telaraña procedural irregular en SVG coords.
 * cx, cy: centro en coordenadas del SVG (viewBox 1000×500).
 */
function buildProceduralWeb(cx, cy) {

    /* Parámetro de familia (0-3): determina el "tipo" de telaraña */
    const family = Math.floor(Math.random() * 4);

    /* Número de radios */
    const radialCount = 7 + Math.floor(Math.random() * 7); /* 7–13 */

    /* Tamaño máximo */
    const baseRadius = family === 3
        ? 55 + Math.random() * 30   /* pequeña y densa */
        : 90 + Math.random() * 60;  /* normal */

    /* Ángulo de rotación base (orientación variable) */
    const baseAngle = Math.random() * Math.PI * 2;

    /* Construir radios con longitudes irregulares */
    const radii = [];
    for (let i = 0; i < radialCount; i++) {

        /* Ángulo con espaciado irregular */
        const nominalAngle = baseAngle + (Math.PI * 2 / radialCount) * i;
        const angle = nominalAngle + jitter(0.18);

        /* Longitud variable por radio */
        const lengthFactor = 0.55 + Math.random() * 0.5;
        const r = baseRadius * lengthFactor;

        /* Algunos radios están "rotos" (family 2) */
        const broken = family === 2 && Math.random() < 0.25;

        radii.push({ angle, r, broken });
    }

    /* ---- FASE 1: hilos radiales ---- */
    let delay = 0;
    const radialDuration = 280;

    radii.forEach((spoke, i) => {

        if (spoke.broken) {
            delay += 60;
            return;
        }

        /* El hilo parte de un punto ligeramente descentrado */
        const ox = cx + jitter(6);
        const oy = cy + jitter(6);

        const ex = cx + Math.cos(spoke.angle) * spoke.r + jitter(8);
        const ey = cy + Math.sin(spoke.angle) * spoke.r + jitter(8);

        /* Curva suave con un punto de control */
        const mx = (ox + ex) / 2 + jitter(12);
        const my = (oy + ey) / 2 + jitter(12);

        const d = `M ${ox},${oy} Q ${mx},${my} ${ex},${ey}`;

        const sw = 0.6 + Math.random() * 0.5;
        const op = 0.3 + Math.random() * 0.25;

        addAnimatedPath(d, delay, radialDuration, sw, op);
        delay += 55 + Math.floor(Math.random() * 40);
    });

    /* ---- FASE 2: anillos irregulares ---- */
    const ringCount = family === 3
        ? 5 + Math.floor(Math.random() * 4)
        : 3 + Math.floor(Math.random() * 4);

    const ringDelay   = delay + 100;
    const ringDuration = 350;

    for (let ring = 1; ring <= ringCount; ring++) {

        /* Fracción del radio para este anillo, con jitter */
        const fraction = (ring / (ringCount + 1)) * (0.85 + Math.random() * 0.15);

        /* Para cada radio calculamos el punto en este anillo */
        const ringPoints = [];

        radii.forEach((spoke) => {
            if (spoke.broken && Math.random() < 0.6) return;

            const r = spoke.r * fraction + jitter(8);
            ringPoints.push({
                x: cx + Math.cos(spoke.angle) * r + jitter(5),
                y: cy + Math.sin(spoke.angle) * r + jitter(5)
            });
        });

        if (ringPoints.length < 3) continue;

        /* Construir el path del anillo conectando los puntos con curvas */
        let d = `M ${ringPoints[0].x},${ringPoints[0].y}`;

        for (let p = 1; p < ringPoints.length; p++) {

            const prev = ringPoints[p - 1];
            const curr = ringPoints[p];

            /* Punto de control curvo */
            const cpx = (prev.x + curr.x) / 2 + jitter(10);
            const cpy = (prev.y + curr.y) / 2 + jitter(10);

            d += ` Q ${cpx},${cpy} ${curr.x},${curr.y}`;
        }

        /* Cerrar el anillo (salvo si está roto o es familia parcial) */
        const closeRing = family !== 2 || Math.random() > 0.3;
        if (closeRing && ringPoints.length > 0) {

            const last  = ringPoints[ringPoints.length - 1];
            const first = ringPoints[0];
            const cpx   = (last.x + first.x) / 2 + jitter(10);
            const cpy   = (last.y + first.y) / 2 + jitter(10);
            d += ` Q ${cpx},${cpy} ${first.x},${first.y}`;
        }

        const sw = 0.4 + Math.random() * 0.4;
        const op = 0.25 + Math.random() * 0.2;
        const extraDelay = ringDelay + (ring - 1) * (80 + Math.floor(Math.random() * 50));

        addAnimatedPath(d, extraDelay, ringDuration, sw, op);
    }

    /* ---- FASE 3: detalles secundarios (hilos cortos irregulares) ---- */
    if (family !== 3) {

        const detailDelay = ringDelay + ringCount * 130 + 100;

        for (let d = 0; d < 4; d++) {

            const r1 = radii[Math.floor(Math.random() * radii.length)];
            const r2 = radii[Math.floor(Math.random() * radii.length)];
            if (!r1 || !r2 || r1 === r2) continue;

            const f1 = 0.3 + Math.random() * 0.4;
            const f2 = 0.3 + Math.random() * 0.4;

            const x1 = cx + Math.cos(r1.angle) * r1.r * f1 + jitter(6);
            const y1 = cy + Math.sin(r1.angle) * r1.r * f1 + jitter(6);
            const x2 = cx + Math.cos(r2.angle) * r2.r * f2 + jitter(6);
            const y2 = cy + Math.sin(r2.angle) * r2.r * f2 + jitter(6);

            const path = `M ${x1},${y1} L ${x2},${y2}`;
            addAnimatedPath(path, detailDelay + d * 60, 200, 0.4, 0.2);
        }
    }
}


/* =========================================================
   CONVERSIÓN PIXEL → SVG coords
   =========================================================
   El SVG tiene viewBox="0 0 1000 500" y preserveAspectRatio="none",
   así que la escala es directamente proporcional.
   ========================================================= */

function pixelToSvg(px, py) {

    const rect   = webSvg.getBoundingClientRect();
    const svgW   = 1000;
    const svgH   = 500;

    const svgX = (px / rect.width)  * svgW;
    const svgY = (py / rect.height) * svgH;

    return { x: svgX, y: svgY };
}


/* =========================================================
   CICLO PRINCIPAL DE LA ARAÑA
   =========================================================
   Estado:
     hidden → aparece → (opcionalmente construye web) → se esconde → hidden
   ========================================================= */

function scheduleNextSpider() {

    if (spiderActive) return;

    /* Intervalo aleatorio 8-13 segundos */
    const delay = 8000 + Math.random() * 5000;

    spiderCycleTimeout = setTimeout(runSpiderCycle, delay);
}

function runSpiderCycle() {

    if (spiderActive) return;
    spiderActive = true;

    /* ¿Araña Spider-Man? Probabilidad ~12% */
    const isSpiderman = Math.random() < 0.12;

    /* Cambiar diseño si es Spider-Man */
    if (isSpiderman) {
        spider.innerHTML = SPIDERMAN_SVG;
        spider.classList.add("spiderman-spider");
    } else {
        spider.innerHTML = GOTHIC_SVG;
        spider.classList.remove("spiderman-spider");
    }

    /* ---- 1. Colocar en el borde de inicio ---- */
    const pos = getEdgePosition();

    spider.style.transition = "none";
    spider.style.left       = `${pos.startX}px`;
    spider.style.top        = `${pos.startY}px`;
    spider.style.opacity    = "1";

    /* Orientar hacia el interior */
    const dx = pos.enterX - pos.startX;
    spider.style.transform  = dx < 0 ? "scaleX(-1)" : "scaleX(1)";

    /* Hacer visible */
    spider.classList.remove("spider-hiding");
    spider.classList.add("spider-visible");

    /* ---- 2. Mover hacia dentro (con transición) ---- */
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {

            spider.style.transition =
                "left 2.2s cubic-bezier(0.4,0,0.2,1), top 2.2s cubic-bezier(0.4,0,0.2,1), transform 0.3s ease";

            spider.style.left = `${pos.enterX}px`;
            spider.style.top  = `${pos.enterY}px`;
            spider.classList.add("walking");
        });
    });

    /* ---- 3. Araña visible unos segundos ---- */
    const visibleTime = 3500 + Math.random() * 3000; /* 3.5-6.5 s */

    /* ¿Construye telaraña? (~35% de veces, no en Spider-Man) */
    const buildWeb = !isSpiderman && Math.random() < 0.35;

    setTimeout(() => {

        spider.classList.remove("walking");

        if (buildWeb) {

            /* Pequeña pausa como si "preparara" */
            setTimeout(() => {

                /* Coordenadas SVG del centro de la araña */
                const svgCoords = pixelToSvg(
                    pos.enterX + (spider.offsetWidth  || 80) / 2,
                    pos.enterY + (spider.offsetHeight || 96) / 2
                );

                buildProceduralWeb(svgCoords.x, svgCoords.y);

                /* Después de construir, espera y se va */
                setTimeout(() => hideSpider(pos), 2800);

            }, 600);

        } else {

            /* Sin telaraña: espera quieta y se va */
            setTimeout(() => hideSpider(pos), 1800 + Math.random() * 1200);
        }

    }, visibleTime);
}

function hideSpider(pos) {

    /* Calcular posición de salida (volver al borde de origen) */
    const edge = pos.edge;
    const W    = spiderArea.clientWidth;
    const H    = spiderArea.clientHeight;
    const sw   = spider.offsetWidth  || 80;
    const sh   = spider.offsetHeight || 96;

    let exitX, exitY;

    if (edge === 0)      { exitX = pos.startX; exitY = -sh - 10; }
    else if (edge === 1) { exitX = W + 10;     exitY = pos.startY; }
    else if (edge === 2) { exitX = pos.startX; exitY = H + 10; }
    else                 { exitX = -sw - 10;   exitY = pos.startY; }

    spider.style.transition =
        "left 1.8s cubic-bezier(0.4,0,0.6,1), top 1.8s cubic-bezier(0.4,0,0.6,1), transform 0.3s ease";

    /* Orientar hacia el exterior */
    const dx = exitX - pos.enterX;
    spider.style.transform = dx < 0 ? "scaleX(-1)" : "scaleX(1)";

    spider.style.left = `${exitX}px`;
    spider.style.top  = `${exitY}px`;

    /* Después de que salga, marcar como inactivo y programar siguiente */
    setTimeout(() => {

        spider.classList.remove("spider-visible", "walking");
        spiderActive = false;
        scheduleNextSpider();

    }, 1900);
}


/* =========================================================
   CLIC EN LA ARAÑA — sin modal, solo animación y contador
   ========================================================= */

const spiderDialogMessages = [
    "Te encontré otra vez y sigo sonriendo como un tonto por ti.",
    "No hace falta un motivo para recordarte lo mucho que te quiero.",
    "La verdad es que tú haces que todo se vea más bonito.",
    "Eres mi parte favorita de cada día y de cada noche.",
    "Si me pillas escondido, es porque no puedo evitar pensar en ti.",
    "Te quiero más de lo que las palabras saben decir.",
    "No sé si soy un misterio, pero sí sé que tú eres mi hogar.",
    "Cada vez que te pienso, el mundo se vuelve más amable.",
    "Me enamoro otra vez de ti incluso cuando estás a mi lado.",
    "Estoy aquí para recordarte que eres mi Cielo y mi lugar favorito."
];

let spiderDialogTimer = null;

function showSpiderDialog() {
    if (!spiderDialog) return;

    const message = spiderDialogMessages[Math.floor(Math.random() * spiderDialogMessages.length)];
    spiderDialog.textContent = message;
    spiderDialog.classList.remove("hidden");
    spiderDialog.classList.add("visible");

    const areaRect = spiderArea.getBoundingClientRect();
    const spiderRect = spider.getBoundingClientRect();
    const centerX = spiderRect.left - areaRect.left + spiderRect.width / 2;
    const topY = spiderRect.top - areaRect.top - 24;

    spiderDialog.style.left = `${Math.max(50, Math.min(centerX, spiderArea.clientWidth - 60))}px`;
    spiderDialog.style.top = `${Math.max(24, topY)}px`;

    clearTimeout(spiderDialogTimer);
    spiderDialogTimer = setTimeout(() => {
        spiderDialog.classList.remove("visible");
        spiderDialog.classList.add("hidden");
    }, 1800);
}

spider.addEventListener("click", (e) => {

    /* Evitar propagación */
    e.stopPropagation();

    showSpiderDialog();

    /* Contadores */
    spidersFound++;
    if (spider.classList.contains("spiderman-spider")) {
        spidermanSpiders++;
    } else {
        gothicSpiders++;
    }

    /* Actualizar contador en archivo secreto si existe */
    const counterEl = document.getElementById("spider-found-counter");
    if (counterEl) counterEl.textContent = spidersFound;

    /* Animación de "susto" y desaparece */
    spider.classList.add("spider-scared");

    setTimeout(() => {
        spider.classList.remove("spider-scared", "walking", "spider-visible");
        spider.style.opacity = "0";

        /* Cancelar ciclo en curso y empezar el siguiente */
        clearTimeout(spiderCycleTimeout);
        spiderActive = false;

        setTimeout(() => {
            spider.style.opacity = "1";
            scheduleNextSpider();
        }, 200);

    }, 400);

});


/* =========================================================
   HILO (solo cuando la araña baja desde arriba)
   ========================================================= */

function updateSpiderThread() {

    const spiderY = parseFloat(spider.style.top) || 0;
    const spiderX = parseFloat(spider.style.left) || 0;

    if (spiderY < 120 && spider.classList.contains("spider-visible")) {

        spiderThread.style.height  = `${spiderY}px`;
        spiderThread.style.left    = `${spiderX + (spider.offsetWidth || 80) / 2}px`;
        spiderThread.style.top     = "0px";
        spiderThread.style.display = "block";

    } else {
        spiderThread.style.display = "none";
    }

    requestAnimationFrame(updateSpiderThread);
}

updateSpiderThread();


/* =========================================================
   ARRANCAR EL CICLO
   (primera aparición entre 5-9 s para que no sea inmediata)
   ========================================================= */

spiderCycleTimeout = setTimeout(runSpiderCycle, 5000 + Math.random() * 4000);


/* =========================================================
   BRÚJULAS
   ========================================================= */

let compassCount = 0;

const compassTexts = {
    luffy: [
        "Luffy dice que vayamos hacia... ❤️ ti.",
        "Si la aventura se trata de nosotros, yo elegiría ir contigo siempre.",
        "Aquí va una dirección segura: hacia tu sonrisa."
    ],
    zoro: [
        "Bueno... era Zoro. ¿Qué esperabas? 😂",
        "Ni un samurái se equivoca: la mejor ruta es hacia ti.",
        "Zoro dice que, aunque sea difícil, el destino siempre nos lleva a nosotros."
    ],
    chopper: [
        "Una brújula que sabe dónde está alguien importante. ❤️",
        "Chopper lo confirma: hay una dirección muy especial y se llama Cielo.",
        "La aguja apunta a ti, porque tú eres mi lugar favorito."
    ]
};

const compassAngles = {
    luffy:   "translate(-50%, -50%) rotate(45deg)",
    zoro:    "translate(-50%, -50%) rotate(247deg)",
    chopper: "translate(-50%, -50%) rotate(-25deg)"
};

compassCards.forEach(card => {

    card.addEventListener("click", () => {

        const character = card.dataset.character;
        const needle    = card.querySelector(".compass-needle");

        compassCards.forEach(item => item.classList.remove("is-active"));
        card.classList.add("is-active");

        compassCount++;
        compassCounter.textContent = compassCount;

        needle.style.transform     = compassAngles[character];

        const pool = compassTexts[character];
        const nextMessage = pool[Math.floor(Math.random() * pool.length)];
        compassMessage.textContent = nextMessage;
    });
});


/* =========================================================
   ARCHIVO SECRETO
   ========================================================= */

secretButton.addEventListener("click", () => {
    secretMessage.classList.toggle("hidden");
});
