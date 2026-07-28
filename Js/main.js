
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