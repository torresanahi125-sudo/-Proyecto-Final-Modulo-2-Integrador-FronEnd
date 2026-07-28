
// ==========================================
// VARIABLES DE ESTADO GLOBAL (NOMENCLATURA EN INGLÉS)
// ==========================================

// Array principal que almacena la base de datos cruda y completa descargada desde el servidor
let allSuperheroes = [];    

// Subconjunto del array original que se actualiza tras aplicar los filtros de búsqueda y editorial
let filteredHeroes = [];    

// Estado dinámico de tipo entero que realiza el seguimiento de la página activa en el viewport
let currentPage = 1;

// Regla de negocio estructural constante: Define el tope máximo de 20 tarjetas visibles por pantalla
const limitPerPage = 20;    

// ==========================================
// REFERENCIAS CENTRALES A ELEMENTOS DEL DOM
// ==========================================

// Captura el contenedor principal (section) donde se inyectará dinámicamente la grilla de héroes
const heroesGrid = document.getElementById('heroes-grid');

// Captura el elemento de texto (span) destinado a mostrar la cantidad total de resultados encontrados
const totalResultsSpan = document.getElementById('total-results');

// Captura la caja de texto (input) que registra las búsquedas por nombre en tiempo real
const searchInput = document.getElementById('search-input');

// Captura el menú desplegable (select) utilizado para filtrar la lista según la editorial del personaje
const publisherFilter = document.getElementById('publisher-filter');

// Captura el menú desplegable (select) encargado de alternar el orden alfabético (A-Z / Z-A)
const sortSelect = document.getElementById('sort-select');

// ==========================================
// REFERENCIAS A ELEMENTOS DEL PAGINADO
// ==========================================

// Captura el botón encargado de regresar al usuario directamente a la primera página de la lista
const btnFirst = document.getElementById('btn-first');

// Captura el botón utilizado para retroceder una página de manera individual
const btnPrev = document.getElementById('btn-prev');

// Captura el botón utilizado para avanzar una página de manera individual
const btnNext = document.getElementById('btn-next');

// Captura el botón encargado de saltar directamente a la última página calculada de la búsqueda
const btnLast = document.getElementById('btn-last');

// Captura el elemento de texto destinado a mostrar el indicador de ubicación (Ej: "Página 1 de 28")
const pageInfo = document.getElementById('page-info');

// ==========================================
// REFERENCIAS A ELEMENTOS DE LA VENTANA MODAL
// ==========================================

// Captura el contenedor externo del modal que actúa como fondo oscuro translúcido en la pantalla
const heroModal = document.getElementById('hero-modal');

// Captura el botón con el ícono de cruz utilizado por el usuario para cerrar la ventana emergente
const modalCloseBtn = document.getElementById('modal-close');

// Captura el contenedor interno vacío donde JavaScript inyectará la biografía y estadísticas del héroe
const modalBody = document.getElementById('modal-body');

// ==========================================
// PETICIÓN HTTP ASÍNCRONA (FETCH API)
// ==========================================

/**
 * Se conecta de forma asíncrona al endpoint remoto y almacena en memoria la base de datos JSON
 */
async function fetchHeroesFromNetwork() {
  // Dirección URL del repositorio de Akabab que centraliza la base de datos sin trabas de CORS
  const API_URL = "https://akabab.github.io/superhero-api/api/all.json";
  
  try {
    // Imprime en consola el inicio del intento de conexión con el servidor
    console.log("[HTTP GET] Fetching universe records from API server...");
    
    // Ejecuta la petición de red asíncrona suspendiendo la ejecución hasta recibir la cabecera de respuesta
    const response = await fetch(API_URL);
    
    // Control de flujo: Si el estado de la respuesta no es exitoso, interrumpe el bloque arrojando un error
    if (!response.ok) throw new Error("Server HTTP response status error: " + response.status);
    
    // Procesa el flujo de datos transformando el cuerpo binario de la respuesta en un array de objetos legibles por JavaScript
    allSuperheroes = await response.json();
    
    // Clona los datos descargados en el set de filtrado secundario para la renderización inicial del viewport
    filteredHeroes = [...allSuperheroes];
    
    // Registra en la consola el éxito de la operación junto con el tamaño de la base de datos obtenida
    console.log("[ SUCCESS] Downloaded " + allSuperheroes.length + " superheroes from network.");
    
    // Gatilla la actualización completa de la interfaz gráfica (Filtros, paginado y dibujo de tarjetas)
    updateUserInterface();
    
  } catch (error) {
    // Captura cualquier falla crítica ocurrida en el proceso 
    console.error("[CRITICAL NETWORK ERROR] Fetch transaction aborted:", error);
    
    // Si el contenedor visual existe en el DOM, inyecta un mensaje de alerta amigable para el usuario
    if (heroesGrid) {
      heroesGrid.innerHTML = '<p class="no-results"> Connection timeout. Failed to synchronize remote data.</p>';
    }
  }
}
// ==========================================
// PROCESAMIENTO DE DATOS (FILTROS, ORDENACIÓN Y PAGINACIÓN)
// ==========================================

/**
 * Función principal que coordina los filtros cruzados, la ordenación de elementos
 * y calcula los segmentos de memoria para actualizar la vista de la aplicación.
 */
function updateUserInterface() {
  // Captura y normaliza el texto de búsqueda (quita espacios extras y pasa todo a minúsculas)
  const textQuery = searchInput ? searchInput.value.toLowerCase().trim() : "";
  // Captura el valor del filtro de editoriales; por defecto usa "all" si el nodo no existe
  const selectedPublisher = publisherFilter ? publisherFilter.value : "all";
  // Captura el criterio de ordenamiento activo en el menú desplegable
  const selectedSorting = sortSelect ? sortSelect.value : "asc";

  // 1. Lógica de Filtros Cruzados (Búsqueda por cadena de texto AND filtro por Editorial)
  filteredHeroes = allSuperheroes.filter(hero => {
    // Control de flujo: Si el registro viene vacío o corrupto, lo descarta del array final
    if (!hero || !hero.name) return false;
    
    // Evalúa si el nombre del personaje contiene el texto tipeado por el usuario
    const matchesName = hero.name.toLowerCase().includes(textQuery);
    // Obtiene la editorial de forma segura. Si el campo no existe, asigna "Unknown"
    const heroPublisher = hero.biography && hero.biography.publisher ? hero.biography.publisher : "Unknown";
    // Evalúa si la editorial coincide con la elegida o si el usuario seleccionó ver todas
    const matchesPublisher = (selectedPublisher === "all" || heroPublisher === selectedPublisher);
    
    // Retorna verdadero únicamente si el superhéroe satisface de forma simultánea ambos criterios
    return matchesName && matchesPublisher;
  });

  // 2. Proceso de Ordenamiento Alfabético del set filtrado
  if (selectedSorting === "asc") {
    // Organiza el array de la A a la Z contemplando caracteres especiales de forma correcta
    filteredHeroes.sort((a, b) => a.name.localeCompare(b.name));
  } else if (selectedSorting === "desc") {
    // Organiza el array de la Z a la A invirtiendo el orden de los elementos
    filteredHeroes.sort((a, b) => b.name.localeCompare(a.name));
  }

  // Cálculos matemáticos esenciales para establecer los límites lógicos del paginado
  const totalHeroes = filteredHeroes.length;
  // Divide por 20 y redondea hacia arriba. Si el resultado es cero, asigna 1 por seguridad
  const totalPages = Math.ceil(totalHeroes / limitPerPage) || 1;

  // Cláusulas de guarda para evitar que la página activa quede fuera del rango de páginas reales
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  // Actualiza el contador dinámico en la pantalla con el total de coincidencias halladas
  if (totalResultsSpan) {
    totalResultsSpan.textContent = totalHeroes;
  }

  // 3. Segmentación del Array (Slicing) según la página que se desea visualizar
  // Determina el índice de inicio en base a la página actual (Ej: Página 2 arranca en index 20)
  const startIndex = (currentPage - 1) * limitPerPage;
  // Determina el límite superior excluyente para hacer el recorte de elementos
  const endIndex = startIndex + limitPerPage;
  // Extrae la porción exacta de hasta 20 superhéroes correspondientes a esta página
  const currentPageSegment = filteredHeroes.slice(startIndex, endIndex);

  // Ejecuta la función que inyecta las tarjetas físicas en la grilla visual de la aplicación
  renderHeroCards(currentPageSegment);
  // Actualiza los estados de habilitación e indicadores de texto en la barra de navegación
  renderPaginationControls(totalPages);
}

/**
 * Crea elementos de forma dinámica en el DOM e inyecta las tarjetas dentro de la grilla de trabajo
 */
function renderHeroCards(heroesList) {
  if (!heroesGrid) return;
  // Vacía por completo el contenedor principal antes de renderizar el nuevo lote de tarjetas
  heroesGrid.innerHTML = "";

  // Si los filtros aplicados dejan el array en cero, despliega un aviso amigable en la pantalla
  if (heroesList.length === 0) {
    heroesGrid.innerHTML = '<p class="no-results"> No superhero matches found for this cross filter criteria.</p>';
    return;
  }

  // Itera secuencialmente sobre el bloque de 20 héroes para maquetar su interfaz correspondiente
  heroesList.forEach(hero => {
    // Crea una etiqueta de artículo para respetar los estándares de HTML semántico
    const cardElement = document.createElement("article");
    // Agrega la clase base siguiendo la metodología de nombres BEM (.hero-card)
    cardElement.classList.add("hero-card");

    // Asignación segura de la imagen de portada y de la editorial resolviendo posibles campos nulos
    const imgUrl = hero.images && hero.images.sm ? hero.images.sm : "https://placeholder.com";
    const publisher = hero.biography && hero.biography.publisher ? hero.biography.publisher : "Unknown";

    // Inserta los elementos internos estructurando el diseño con clases BEM para estilar en SASS
    // Se añade el atributo 'loading="lazy"' para optimizar la transferencia de datos y la velocidad
    cardElement.innerHTML = `
      <img class="hero-card__image" src="${imgUrl}" alt="${hero.name}" loading="lazy">
      <div class="hero-card__content">
        <h2 class="hero-card__title">${hero.name}</h2>
        <p class="hero-card__publisher">${publisher}</p>
      </div>
    `;

    // Escuchador de eventos: Al hacer click sobre el artículo, dispara el modal pasando el objeto actual
    cardElement.addEventListener('click', () => openDetailModal(hero));
    // Agrega el nodo secundario completado al interior de la grilla principal
    heroesGrid.appendChild(cardElement);
  });
}

/**
 * Actualiza dinámicamente las cadenas de texto informativas y modifica el estado de bloqueo de los botones
 */
function renderPaginationControls(totalPages) {
  // Actualiza la visualización de la posición del usuario (Ej: "Page 1 of 28")
  if (pageInfo) pageInfo.textContent = "Page " + currentPage + " of " + totalPages;

  // Lógica de deshabilitación de controles para resguardar la navegación (Criterio del TP)
  if (btnFirst) btnFirst.disabled = (currentPage === 1); // Bloquea "Primero" si ya está en la página 1
  if (btnPrev) btnPrev.disabled = (currentPage === 1);   // Bloquea "Anterior" si ya está en la página 1
  if (btnNext) btnNext.disabled = (currentPage === totalPages); // Bloquea "Siguiente" si llegó al final
  if (btnLast) btnLast.disabled = (currentPage === totalPages); // Bloquea "Último" si llegó al final
}
// ==========================================
// INTERACCIÓN Y RENDERIZADO ASÍNCRONO DEL MODAL
// ==========================================

/**
 * Se encarga de abrir la ventana modal e inyectar dinámicamente la información detallada del héroe seleccionado
 * @param {Object} hero - El objeto con los datos completos del superhéroe
 */
function openDetailModal(hero) {
  if (!heroModal || !modalBody) return;

  // Mapeo seguro de todas las estructuras internas requeridas por la consigna
  const stats = hero.powerstats || {};
  const appearance = hero.appearance || {};
  const biography = hero.biography || {};
  const connections = hero.connections || {};

  
  modalBody.innerHTML = `
    <div class="modal__layout">
      <div class="modal__media">
        <img class="modal__image" src="${hero.images.md}" alt="${hero.name}">
      </div>
      <div class="modal__details">
        <h2 class="modal__hero-title">${hero.name}</h2>
        <p class="modal__text"><strong>Nombre Real:</strong> ${biography.fullName || "Desconocido"}</p>
        
        <!-- REQUISITO: Editorial (Marvel / DC / etc.) -->
        <p class="modal__text"><strong>Editorial:</strong> ${biography.publisher || "Desconocida"}</p>
        
        <!-- REQUISITO: Altura y peso -->
        <p class="modal__text"><strong>Altura:</strong> ${appearance.height ? appearance.height.join(' / ') : "N/A"} | <strong>Peso:</strong> ${appearance.weight ? appearance.weight.join(' / ') : "N/A"}</p>
        
        <!-- REQUISITO: Descripción / Biografía (alias, lugar de nacimiento, ocupación) -->
        <h3 class="modal__subtitle">Biografía</h3>
        <p class="modal__text"><strong>Alias:</strong> ${biography.aliases ? biography.aliases.join(', ') : "Ninguno"}</p>
        <p class="modal__text"><strong>Lugar de Nacimiento:</strong> ${biography.placeOfBirth || "Desconocido"}</p>
        <p class="modal__text"><strong>Ocupación:</strong> ${biography.occupation || "Desconocida"}</p>
        
        <!-- REQUISITO: Conexiones o afiliaciones -->
        <p class="modal__text"><strong>Conexiones:</strong> ${connections.groupAffiliation || "Ninguna"}</p>

        <!-- REQUISITO: Estadísticas de poder (fuerza, velocidad, inteligencia, combate, etc.) -->
        <h3 class="modal__subtitle">Estadísticas de Poder</h3>
        <ul class="modal__stats-list">
          <li class="modal__stat-item">🧠 Inteligencia: <strong>${stats.intelligence || 0}</strong></li>
          <li class="modal__stat-item">💪 Fuerza: <strong>${stats.strength || 0}</strong></li>
          <li class="modal__stat-item">⚡ Velocidad: <strong>${stats.speed || 0}</strong></li>
          <li class="modal__stat-item">🛡️ Durabilidad: <strong>${stats.durability || 0}</strong></li>
          <li class="modal__stat-item">🔥 Poder: <strong>${stats.power || 0}</strong></li>
          <li class="modal__stat-item">⚔️ Combate: <strong>${stats.combat || 0}</strong></li>
        </ul>
      </div>
    </div>
  `;

  heroModal.style.display = "flex";
}


// Escuchador de eventos asignado al botón de cierre 
if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', () => {
    // Al hacer click, oculta la ventana flotante modificando su propiedad display
    heroModal.style.display = "none";
  });
}


window.addEventListener('click', (e) => {
  // Condición de seguridad: Evalúa si el elemento exacto que recibió el click fue el fondo oscuro difuminado
  if (e.target === heroModal) {
    // Oculta el modal impidiendo que los clicks internos en el contenido cierren la ventana por error
    heroModal.style.display = "none";
  }
});


// ==========================================
// REGISTRO DE ESCUCHADORES DE EVENTOS 
// ==========================================

// Escuchador para la barra de búsqueda: Se ejecuta cada vez que el usuario escribe una letra
if (searchInput) searchInput.addEventListener('input', () => { 
  // Resetea a la primera página para mostrar los nuevos resultados desde el inicio
  currentPage = 1; 
  // Re-renderiza toda la interfaz gráfica con el filtro de texto aplicado
  updateUserInterface(); 
});

// Escuchador para el filtro de editoriales: Se activa al seleccionar una opción diferente del menú desplegable
if (publisherFilter) publisherFilter.addEventListener('change', () => { 
  // Regresa a la página inicial del nuevo set de datos filtrados
  currentPage = 1; 
  // Actualiza la grilla y recalcula el número total de páginas correspondientes
  updateUserInterface(); 
});

// Escuchador para el selector de ordenamiento: Se dispara al cambiar el criterio (A-Z o Z-A)
if (sortSelect) sortSelect.addEventListener('change', () => { 
  // Resetea el paginado a la página 1 para que el orden comience desde el principio
  currentPage = 1; 
  // Ejecuta la ordenación del array y redibuja las tarjetas en pantalla
  updateUserInterface(); 
});

//  Permite el salto directo al inicio de la lista
if (btnFirst) btnFirst.addEventListener('click', () => { 
  // Fuerza el estado global a la página número 1
  currentPage = 1; 
  // Actualiza  la aplicación
  updateUserInterface(); 
});

//  Permite el salto directo al final de los resultados
if (btnLast) btnLast.addEventListener('click', () => {
  // Determina matemáticamente la última página dividiendo los héroes filtrados actuales por el límite de 20
  // Usa el cortocircuito lógico  para resguardar la app asignando la página 1 si el cálculo da cero
  currentPage = Math.ceil(filteredHeroes.length / limitPerPage) || 1;
  // Sincroniza la visualización de la interfaz
  updateUserInterface();
});

//  Controla el retroceso de páginas de forma individual
if (btnPrev) btnPrev.addEventListener('click', () => { 
  //  Solo resta una unidad si la página actual es estrictamente mayor a 1
  if (currentPage > 1) { 
    currentPage--; 
    // Redibuja las tarjetas del segmento anterior en el DOM
    updateUserInterface(); 
  } 
});

// Controla el avance de páginas de forma de forma individual
if (btnNext) btnNext.addEventListener('click', () => {
  // Calcula el tope máximo de páginas según el filtro de búsqueda activo actualmente
  const total = Math.ceil(filteredHeroes.length / limitPerPage) || 1;
  //  Solo permite sumar una página si no se ha alcanzado dicho tope máximo
  if (currentPage < total) { 
    currentPage++; 
    // Redibuja las tarjetas del segmento siguiente en el DOM
    updateUserInterface(); 
  }
});

// ==========================================
// PUNTO DE ENTRADA E INICIALIZACIÓN
// ==========================================

// Dispara de forma inmediata la descarga asíncrona de los datos al momento de cargarse el archivo
fetchHeroesFromNetwork();

