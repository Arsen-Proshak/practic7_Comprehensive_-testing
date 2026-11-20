'use strict';

const VALID_STATES = ['loading', 'content', 'empty', 'error'];

const INITIAL_MODULES = [
  {
    id: 1,
    tag: 'HTML / CSS',
    title: 'Архітектура дизайн-токенів',
    description: 'Побудова трирівневої системи змінних Primitive, Semantic та Component.'
  },
  {
    id: 2,
    tag: 'JavaScript ES6+',
    title: 'Керування станами екрана',
    description: 'Реалізація життєвого циклу Loading, Content, Empty та Error без фреймворків.'
  },
  {
    id: 3,
    tag: 'UX / Accessibility',
    title: 'Семантика та доступність',
    description: 'Правильне використання тегів button, label та ARIA-атрибутів.'
  },
  {
    id: 4,
    tag: 'UI-Kit',
    title: 'Бібліотека компонентів',
    description: 'Уніфікація кнопок, карток та полів вводу з підтримкою темної теми.'
  }
];

/* =========================================================
   ЧИСТІ ФУНКЦІЇ БІЗНЕС-ЛОГІКИ (для модульного тестування)
   ========================================================= */

/**
 * Перевіряє валідність текстового поля (не порожнє та не складається лише з пробілів)
 * @param {unknown} value
 * @returns {boolean}
 */
function validateInput(value) {
  if (typeof value !== 'string') {
    return false;
  }
  return value.trim().length > 0;
}

/**
 * Перевіряє, чи є назва стану екрана допустимою
 * @param {unknown} stateName
 * @returns {boolean}
 */
function isValidState(stateName) {
  return typeof stateName === 'string' && VALID_STATES.includes(stateName);
}

/**
 * Чиста функція фільтрації масиву модулів за пошуковим запитом
 * @param {Array} list
 * @param {string} query
 * @returns {Array}
 */
function filterModulesList(list, query) {
  if (!Array.isArray(list)) return [];
  if (typeof query !== 'string' || query.trim() === '') {
    return [...list];
  }
  const normalizedQuery = query.trim().toLowerCase();
  return list.filter(
    (item) =>
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.description.toLowerCase().includes(normalizedQuery) ||
      item.tag.toLowerCase().includes(normalizedQuery)
  );
}

/* =========================================================
   ЛОГІКА ІНТЕРФЕЙСУ (DOM-взаємодія із захистом від XSS)
   ========================================================= */

let modules = [...INITIAL_MODULES];
let activeTimerId = null;

const stateBlocks = document.querySelectorAll('[data-state]');
const stateSwitchButtons = document.querySelectorAll('[data-switch-state]');
const contentContainer = document.getElementById('contentContainer');
const searchInput = document.getElementById('searchInput');
const emptyQueryText = document.getElementById('emptyQueryText');
const refreshBtn = document.getElementById('refreshBtn');
const resetEmptyBtn = document.getElementById('resetEmptyBtn');
const retryErrorBtn = document.getElementById('retryErrorBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');

const addModuleForm = document.getElementById('addModuleForm');
const moduleTagInput = document.getElementById('moduleTagInput');
const moduleTitleInput = document.getElementById('moduleTitleInput');
const moduleDescInput = document.getElementById('moduleDescInput');
const formFeedback = document.getElementById('formFeedback');

/**
 * Перемикає стан екрана через classList
 * @param {'loading' | 'content' | 'empty' | 'error'} targetState
 */
function renderState(targetState) {
  if (!isValidState(targetState)) return;

  stateBlocks.forEach((block) => {
    const isTarget = block.dataset.state === targetState;
    block.classList.toggle('is-hidden', !isTarget);
  });
}

/**
 * Безпечно створює DOM-елемент картки виключно через textContent (захист від XSS)
 * @param {{id: number, tag: string, title: string, description: string}} item
 * @returns {HTMLElement}
 */
function createSafeCardElement(item) {
  const article = document.createElement('article');
  article.className = 'card';

  const badge = document.createElement('span');
  badge.className = 'card-badge';
  badge.textContent = item.tag;

  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = item.title;

  const desc = document.createElement('p');
  desc.className = 'card-desc';
  desc.textContent = item.description;

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'btn btn-danger';
  deleteBtn.dataset.deleteId = String(item.id);
  deleteBtn.textContent = 'Видалити елемент';

  article.append(badge, title, desc, deleteBtn);
  return article;
}

/**
 * Рендерить список карток або переходить у стан empty
 * @param {Array} items
 */
function renderCards(items) {
  if (items.length === 0) {
    if (emptyQueryText) {
      emptyQueryText.textContent = searchInput.value.trim() || 'усі модулі';
    }
    renderState('empty');
    return;
  }

  contentContainer.replaceChildren();
  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    fragment.appendChild(createSafeCardElement(item));
  });
  contentContainer.appendChild(fragment);

  renderState('content');
}

function applySearchFilter() {
  const filtered = filterModulesList(modules, searchInput.value);
  renderCards(filtered);
}

/**
 * Імітація асинхронного завантаження із захистом від накладання таймерів при швидких кліках
 */
function simulateAsyncLoad() {
  if (activeTimerId !== null) {
    window.clearTimeout(activeTimerId);
  }
  renderState('loading');
  activeTimerId = window.setTimeout(() => {
    activeTimerId = null;
    applySearchFilter();
  }, 1500);
}

// Перемикач станів (State Switcher)
stateSwitchButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (activeTimerId !== null) {
      window.clearTimeout(activeTimerId);
      activeTimerId = null;
    }
    const selectedState = btn.dataset.switchState;
    if (selectedState === 'content') {
      applySearchFilter();
    } else {
      renderState(selectedState);
    }
  });
});

// Додавання нової картки із перевіркою порожнього введення
addModuleForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const tagValue = moduleTagInput.value;
  const titleValue = moduleTitleInput.value;
  const descValue = moduleDescInput.value;

  const isTitleValid = validateInput(titleValue);
  const isDescValid = validateInput(descValue);

  moduleTitleInput.classList.toggle('is-error', !isTitleValid);
  moduleDescInput.classList.toggle('is-error', !isDescValid);

  if (!isTitleValid || !isDescValid) {
    formFeedback.textContent = 'Помилка: заповніть назву та опис модуля (порожні рядки або пробіли заборонені).';
    formFeedback.classList.remove('is-hidden');
    return;
  }

  formFeedback.classList.add('is-hidden');

  const newModule = {
    id: Date.now(),
    tag: validateInput(tagValue) ? tagValue.trim() : 'Новий модуль',
    title: titleValue.trim(),
    description: descValue.trim()
  };

  modules.unshift(newModule);
  addModuleForm.reset();
  searchInput.value = '';
  renderCards(modules);
});

// Видалення картки
contentContainer.addEventListener('click', (event) => {
  const deleteBtn = event.target.closest('[data-delete-id]');
  if (!deleteBtn) return;

  const idToDelete = Number(deleteBtn.dataset.deleteId);
  modules = modules.filter((item) => item.id !== idToDelete);
  applySearchFilter();
});

// Пошук у реальному часі
searchInput.addEventListener('input', applySearchFilter);

// Оновлення та скидання станів
refreshBtn.addEventListener('click', simulateAsyncLoad);
retryErrorBtn.addEventListener('click', simulateAsyncLoad);

resetEmptyBtn.addEventListener('click', () => {
  searchInput.value = '';
  modules = [...INITIAL_MODULES];
  renderCards(modules);
});

// Перемикач теми
themeToggleBtn.addEventListener('click', () => {
  const root = document.documentElement;
  const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', nextTheme);
});

// Початковий рендер
renderCards(modules);