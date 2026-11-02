// Utilidades comunes para los tests de la rama 5-dom.
// Simulan un json-server en memoria y cargan la aplicación desde cero en cada test.
import { vi } from 'vitest'

// Ruta al main.js desde esta carpeta
const MAIN = '../src/main.js'

export const STATUSES = ['new', 'good', 'used', 'bad', 'digital']

export const MODULES = [
  { code: '0514', cliteral: 'Formación y orientación laboral', vliteral: 'Formació i orientació laboral', courseId: '38' },
  { code: '0515', cliteral: 'Empresa e iniciativa emprendedora', vliteral: 'Empresa i iniciativa emprenedora', courseId: '38' },
  { code: '0612', cliteral: 'Desarrollo WEB en entorno cliente', vliteral: 'Desenrotllament WEB en entorn client', courseId: '35' },
  { code: '0613', cliteral: 'Desarrollo WEB en entorno servidor', vliteral: 'Desenrotllament WEB en entorn servidor', courseId: '35' },
  { code: '0614', cliteral: 'Despliegue de aplicaciones WEB', vliteral: "Desplegament d'aplicacions WEB", courseId: '35' },
  { code: '0615', cliteral: 'Diseño de interfaces WEB', vliteral: "Disseny d'interfícies WEB", courseId: '35' },
  { code: 'CV0006', cliteral: 'Formación y Orientación Laboral II', vliteral: 'Formació i Orientació Laboral II', courseId: '57' }
]

export const BOOKS = [
  { id: 1, userId: 2, moduleCode: '0612', publisher: 'Apunts', price: 12, pages: 25, status: 'good', photo: '', comments: '', soldDate: '2023-02-01' },
  { id: 6, userId: 3, moduleCode: '0613', publisher: 'McGraw-Hill', price: 75, pages: 273, status: 'new', photo: '', comments: 'Sense obrir', soldDate: '' },
  { id: 7, userId: 4, moduleCode: '0613', publisher: 'McGraw-Hill', price: 15, pages: 173, status: 'bad', photo: '', comments: 'Fet pols', soldDate: '' },
  { id: 8, userId: 4, moduleCode: '0612', publisher: 'McGraw-Hill', price: 15, pages: 173, status: 'good', photo: '', comments: '', soldDate: '' },
  { id: 9, userId: 4, moduleCode: '0612', publisher: 'Apunts', price: 35, pages: 73, status: 'used', photo: '', comments: '', soldDate: '' },
  { id: 10, userId: 5, moduleCode: '0614', publisher: 'Apunts', price: 5, pages: 57, status: 'digital', photo: '', comments: '', soldDate: '' }
]

export const USERS = [
  { id: 2, email: 'ignasi@batoi.lan', nick: 'Ignasi', password: '1234' },
  { id: 3, email: 'juan@batoi.lan', nick: 'Juan', password: '1234' },
  { id: 4, email: 'marta@batoi.lan', nick: 'Marta', password: '1234' },
  { id: 5, email: 'ximo@batoi.lan', nick: 'Ximo', password: '1234' }
]

const clone = (x) => JSON.parse(JSON.stringify(x))

// ---------- Servidor simulado (imita a json-server) ----------
// options.books / options.modules: datos iniciales distintos de los de arriba
// options.fail: { 'POST /books': 500, 'DELETE /books': 'network', 'GET *': 'network' ... }
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
        table[index] = method === 'PUT' ? { ...body, id: table[index].id } : { ...table[index], ...body }
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

// jsdom no implementa el acceso a los campos como propiedades del formulario
// (form.publisher), que sí funciona en los navegadores. Lo añadimos para los
// campos del libro para que el código que lo usa funcione igual que en el navegador.
for (const name of ['moduleCode', 'publisher', 'price', 'pages', 'status', 'photo', 'comments']) {
  if (!(name in HTMLFormElement.prototype)) {
    Object.defineProperty(HTMLFormElement.prototype, name, {
      configurable: true,
      get () { return this.elements.namedItem(name) ?? undefined }
    })
  }
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
  document.body.innerHTML = ''
}

// Deja que terminen las promesas pendientes (peticiones al servidor, etc.)
export async function flush () {
  for (let i = 0; i < 5; i++) await new Promise(resolve => setTimeout(resolve, 0))
}

// Carga la aplicación como si se abriera la página en el navegador
export async function loadApp (options = {}) {
  cleanup()
  document.body.innerHTML = '<div id="app"></div>'
  const server = createServer(options)
  globalThis.fetch = vi.fn(server.fetch)
  // Vaciamos la caché de módulos para que el main.js se ejecute de nuevo en cada test
  vi.resetModules()
  await import(MAIN)
  document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true }))
  window.dispatchEvent(new Event('load'))
  await flush()
  return server
}

// ---------- Acciones del usuario ----------
export const $ = (selector) => document.querySelector(selector)
export const $$ = (selector) => [...document.querySelectorAll(selector)]
export const cards = () => $$('#list .card')
export const card = (id) => $(`#list .card[data-id="${id}"]`)
export const alerts = (type) => $$(`#messages .alert-${type}`)

function field (name) {
  const element = $('#bookForm').elements.namedItem(name)
  if (!element) throw new Error(`El formulario no tiene ningún campo con name="${name}"`)
  return element
}

function setValue (name, value) {
  const element = field(name)
  if (name === 'status') {
    const radio = $$('#bookForm input[name="status"]').find(r => r.value === value)
    if (!radio) throw new Error(`No hay ningún radiobutton de estado con value="${value}"`)
    radio.checked = true
    radio.dispatchEvent(new Event('change', { bubbles: true }))
    return
  }
  element.value = value
  element.dispatchEvent(new Event('input', { bubbles: true }))
  element.dispatchEvent(new Event('change', { bubbles: true }))
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

// El usuario envía el formulario pulsando Enter (sin hacer clic en el botón)
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

export async function removeById (id) {
  const input = $('#id-remove')
  input.value = String(id)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  $('#remove-btn').click()
  await flush()
}
