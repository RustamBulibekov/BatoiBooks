// Utilidades para los tests de la rama 6-eventos.
// Simulan un json-server en memoria y cargan la aplicación desde cero en cada test.
import { vi } from 'vitest'

// Ruta al main.js desde esta carpeta
const MAIN = '../src/main.js'

// Nuestro usuario (todavía no hay login)
export const USER_ID = 2

export const STATUSES = ['new', 'good', 'used', 'bad', 'digital']

export const PAGES = ['list', 'form', 'about', 'not-found']

export const MODULES = [
  { code: '0514', cliteral: 'Formación y orientación laboral', vliteral: 'Formació i orientació laboral', courseId: '38' },
  { code: '0515', cliteral: 'Empresa e iniciativa emprendedora', vliteral: 'Empresa i iniciativa emprenedora', courseId: '38' },
  { code: '0612', cliteral: 'Desarrollo WEB en entorno cliente', vliteral: 'Desenrotllament WEB en entorn client', courseId: '35' },
  { code: '0613', cliteral: 'Desarrollo WEB en entorno servidor', vliteral: 'Desenrotllament WEB en entorn servidor', courseId: '35' },
  { code: '0614', cliteral: 'Despliegue de aplicaciones WEB', vliteral: "Desplegament d'aplicacions WEB", courseId: '35' },
  { code: '0615', cliteral: 'Diseño de interfaces WEB', vliteral: "Disseny d'interfícies WEB", courseId: '35' },
  { code: 'CV0006', cliteral: 'Formación y Orientación Laboral II', vliteral: 'Formació i Orientació Laboral II', courseId: '57' }
]

// Los libros 1 y 8 son nuestros (userId 2). El 1 está vendido.
export const BOOKS = [
  { id: 1, userId: 2, moduleCode: '0612', publisher: 'Apunts', price: 12, pages: 25, status: 'good', photo: '', comments: '', soldDate: '2023-02-01' },
  { id: 6, userId: 3, moduleCode: '0613', publisher: 'McGraw-Hill', price: 75, pages: 273, status: 'new', photo: '', comments: 'Sense obrir', soldDate: '' },
  { id: 7, userId: 4, moduleCode: '0613', publisher: 'McGraw-Hill', price: 15, pages: 173, status: 'bad', photo: '', comments: 'Fet pols', soldDate: '' },
  { id: 8, userId: 2, moduleCode: '0612', publisher: 'McGraw-Hill', price: 15, pages: 173, status: 'good', photo: '', comments: 'Amb notes', soldDate: '' },
  { id: 9, userId: 4, moduleCode: '0612', publisher: 'Apunts', price: 35, pages: 73, status: 'used', photo: '', comments: '', soldDate: '' },
  { id: 10, userId: 5, moduleCode: '0614', publisher: 'Apunts', price: 5, pages: 57, status: 'digital', photo: '', comments: '', soldDate: '' }
]

export const OWN_IDS = BOOKS.filter(book => book.userId === USER_ID).map(book => book.id)
export const OTHER_IDS = BOOKS.filter(book => book.userId !== USER_ID).map(book => book.id)

export const USERS = [
  { id: 2, email: 'ignasi@batoi.lan', nick: 'Ignasi', password: '1234' },
  { id: 3, email: 'juan@batoi.lan', nick: 'Juan', password: '1234' },
  { id: 4, email: 'marta@batoi.lan', nick: 'Marta', password: '1234' },
  { id: 5, email: 'ximo@batoi.lan', nick: 'Ximo', password: '1234' }
]

const clone = (x) => JSON.parse(JSON.stringify(x))

// ---------- Servidor simulado (imita a json-server) ----------
// options.books / options.modules: datos iniciales distintos de los de arriba
// options.fail: { 'PUT /books': 500, 'DELETE /books': 'network', 'GET *': 'network' ... }
export function createServer (options = {}) {
  const db = {
    books: clone(options.books ?? BOOKS),
    modules: clone(options.modules ?? MODULES),
    users: clone(USERS),
    sales: []
  }
  const calls = []
  const fail = options.fail ?? {}

  const response = (status, body) => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: String(status),
    headers: { get: () => 'application/json' },
    json: async () => clone(body),
    text: async () => JSON.stringify(body)
  })

  async function fakeFetch (input, init = {}) {
    const url = new URL(typeof input === 'string' ? input : (input.url ?? String(input)), 'http://localhost')
    const method = (init.method ?? input.method ?? 'GET').toUpperCase()
    const match = url.pathname.match(/\/(books|modules|users|sales)(?:\/([^/]+))?\/?$/)
    let body
    try { body = init.body ? JSON.parse(init.body) : undefined } catch { body = init.body }
    calls.push({ method, path: url.pathname, body })

    if (!match) return response(404, {})
    const [, resource, id] = match

    const failure = fail[`${method} /${resource}`] ?? fail[`${method} *`] ?? fail['*']
    if (failure === 'network') throw new TypeError('Failed to fetch')
    if (failure) return response(failure, {})

    const table = db[resource]
    const find = () => table.findIndex(item => String(item.id) === String(id))

    switch (method) {
      case 'GET': {
        if (id) {
          const index = find()
          return index === -1 ? response(404, {}) : response(200, table[index])
        }
        let result = table
        for (const [key, value] of url.searchParams) {
          result = result.filter(item => String(item[key]) === value)
        }
        return response(200, result)
      }
      case 'POST': {
        const newId = Math.max(0, ...table.map(item => Number(item.id) || 0)) + 1
        const item = { ...body, id: newId }
        table.push(item)
        return response(201, item)
      }
      case 'PUT':
      case 'PATCH': {
        const index = find()
        if (index === -1) return response(404, {})
        // Como json-server: la id de la URL manda (y conserva su tipo)
        table[index] = method === 'PUT' ? { ...body, id: table[index].id } : { ...table[index], ...body, id: table[index].id }
        return response(200, table[index])
      }
      case 'DELETE': {
        const index = find()
        if (index === -1) return response(404, {})
        const [removed] = table.splice(index, 1)
        return response(200, removed)
      }
    }
    return response(405, {})
  }

  return { db, calls, fetch: fakeFetch }
}

// ---------- Carga de la aplicación ----------
// Guardamos los escuchadores que la aplicación pone en document y window
// para poder quitarlos antes del siguiente test.
const tracked = []
for (const target of [document, window]) {
  const original = target.addEventListener.bind(target)
  target.addEventListener = (type, listener, opts) => {
    tracked.push([target, type, listener, opts])
    return original(type, listener, opts)
  }
}

function cleanup () {
  for (const [target, type, listener, opts] of tracked) target.removeEventListener(type, listener, opts)
  tracked.length = 0
  window.onload = null
  window.onhashchange = null
  window.onpopstate = null
  document.body.innerHTML = ''
}

// Deja que terminen las promesas pendientes (peticiones al servidor, cambios de ruta, etc.)
export async function flush () {
  for (let i = 0; i < 10; i++) await new Promise(resolve => setTimeout(resolve, 0))
}

// Carga la aplicación como si se abriera la página en el navegador.
// options.hash: la URL con la que se abre la página (por ejemplo '#about')
// options.confirm: lo que responde el usuario a los confirm() (true por defecto)
export async function loadApp (options = {}) {
  cleanup()
  // Cambia la URL sin lanzar ningún evento, como si se escribiera en la barra de direcciones
  history.replaceState(null, '', location.pathname + (options.hash ?? ''))
  document.body.innerHTML = '<div id="app"></div>'
  const server = createServer(options)
  globalThis.fetch = vi.fn(server.fetch)
  server.confirm = vi.fn(() => options.confirm ?? true)
  window.confirm = server.confirm
  vi.resetModules()
  await import(MAIN)
  document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true }))
  window.dispatchEvent(new Event('load'))
  await flush()
  return server
}

// ---------- Consultas ----------
export const $ = (selector) => document.querySelector(selector)
export const $$ = (selector) => [...document.querySelectorAll(selector)]
export const cards = () => $$('#list .card')
export const card = (id) => $(`#list .card[data-id="${id}"]`)
export const alerts = (type) => $$(`#messages .alert-${type}`)
export const cartCount = () => $('#cart-count').textContent.trim()

// Un elemento está oculto si él o alguno de sus antecesores tiene la clase hidden
export const isHidden = (element) => element.closest('.hidden') !== null

// Páginas que se ven ahora mismo
export const visiblePages = () => PAGES.filter(id => $('#' + id) && !isHidden($('#' + id)))

// Botón de una card por su aria-label ('Editar', 'Borrar', 'Añadir al carrito')
export const cardButton = (id, label) => card(id)?.querySelector(`[aria-label="${label}"]`) ?? null

// ---------- Acciones del usuario ----------
// Pulsa un botón de una card. Con onIcon: true pulsa sobre el icono que hay dentro.
export async function clickCardButton (id, label, { onIcon = false } = {}) {
  const button = cardButton(id, label)
  if (!button) throw new Error(`La card ${id} no tiene ningún botón con aria-label="${label}"`)
  const target = onIcon ? (button.querySelector('.material-icons') ?? button.firstElementChild) : button
  if (!target) throw new Error(`El botón "${label}" de la card ${id} no tiene ningún icono dentro`)
  target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  await flush()
}

// Cambia la ruta como lo haría el usuario al pulsar un enlace o escribir la URL
export async function navigate (hash) {
  location.hash = hash
  await flush()
}

// Pulsa un enlace del menú
export async function clickMenu (hash) {
  const link = $(`nav a[href="${hash}"]`)
  if (!link) throw new Error(`El menú no tiene ningún enlace a ${hash}`)
  link.click()
  await flush()
}

export async function goBack () {
  history.back()
  await flush()
}

function field (name) {
  const element = $('#bookForm').elements.namedItem(name)
  if (!element) throw new Error(`El formulario no tiene ningún campo con name="${name}"`)
  return element
}

function setValue (name, value) {
  if (name === 'status') {
    const radio = $$('#bookForm input[name="status"]').find(r => r.value === value)
    if (!radio) throw new Error(`No hay ningún radiobutton de estado con value="${value}"`)
    radio.checked = true
    radio.dispatchEvent(new Event('change', { bubbles: true }))
    return
  }
  const element = field(name)
  element.value = value
  element.dispatchEvent(new Event('input', { bubbles: true }))
  element.dispatchEvent(new Event('change', { bubbles: true }))
}

// Valores que se ven en el formulario
export function formValues () {
  const values = {}
  for (const name of ['id', 'moduleCode', 'publisher', 'price', 'pages', 'photo', 'comments']) {
    values[name] = field(name).value
  }
  values.status = $$('#bookForm input[name="status"]').find(r => r.checked)?.value ?? ''
  return values
}

export const NEW_BOOK = {
  moduleCode: '0615',
  publisher: 'Anaya',
  price: '20',
  pages: '150',
  status: 'used',
  photo: 'https://example.com/libro.jpg',
  comments: 'Subrayado a lápiz'
}

export function fillForm (data = NEW_BOOK) {
  for (const [name, value] of Object.entries(data)) setValue(name, value)
}

// El usuario envía el formulario pulsando Enter
export async function submitForm () {
  $('#bookForm').requestSubmit()
  await flush()
}

// El usuario hace clic en el botón Guardar
export async function clickSave () {
  const button = $('#bookForm [type="submit"]')
  if (!button) throw new Error('El formulario no tiene botón de tipo submit')
  button.click()
  await flush()
}

// El usuario hace clic en el botón Reset
export async function clickReset () {
  const button = $('#bookForm [type="reset"]')
  if (!button) throw new Error('El formulario no tiene botón de tipo reset')
  button.click()
  await flush()
}

// Peticiones que ha recibido el servidor para modificar un libro (PUT o PATCH)
export const changeCalls = (server, id) =>
  server.calls.filter(c => (c.method === 'PUT' || c.method === 'PATCH') && c.path.endsWith(`/books/${id}`))
