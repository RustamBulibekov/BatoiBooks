// @vitest-environment jsdom
// Tests de la rama 5-dom.
// Comprueban lo que ve y hace el usuario, no cómo está organizado el código:
// deben pasar igual al final de la fase 1 y al final de la fase 2.
import { describe, test, expect } from 'vitest'
import {
  loadApp, flush, $, $$, cards, card, alerts,
  fillForm, submitForm, clickSave, removeById,
  MODULES, BOOKS, STATUSES, NEW_BOOK
} from './helpers.js'

describe('Estructura de la página', () => {
  test('tiene encabezado, menú, mensajes, los 4 divs principales y pie', async () => {
    await loadApp()
    expect($('header')).not.toBeNull()
    expect($('header').textContent).toContain('BatoiBooks')
    expect($('footer')).not.toBeNull()
    expect($('#messages')).not.toBeNull()
    for (const id of ['list', 'remove', 'form', 'about']) {
      expect($('#' + id)).not.toBeNull()
    }
  })

  test('el menú enlaza a #list, #form y #about', async () => {
    await loadApp()
    const links = $$('nav a').map(a => a.getAttribute('href'))
    expect(links).toEqual(['#list', '#form', '#about'])
  })

  test('el div #remove tiene label, input y botón', async () => {
    await loadApp()
    expect($('#remove label')).not.toBeNull()
    expect($('#remove #id-remove')).not.toBeNull()
    expect($('#remove #remove-btn')).not.toBeNull()
  })

  test('el formulario tiene un campo por cada dato que introduce el usuario', async () => {
    await loadApp()
    const form = $('#form form#bookForm')
    expect(form).not.toBeNull()
    for (const name of ['moduleCode', 'publisher', 'price', 'pages', 'status', 'photo', 'comments']) {
      expect(form.elements.namedItem(name)).not.toBeNull()
    }
    for (const name of ['id', 'userId', 'soldDate']) {
      expect(form.elements.namedItem(name)).toBeNull()
    }
    expect(form.querySelector('[type="submit"]')).not.toBeNull()
    expect(form.querySelector('[type="reset"]')).not.toBeNull()
  })

  test('el módulo es un SELECT y el estado son radiobuttons con todos los valores', async () => {
    await loadApp()
    expect($('#bookForm select[name="moduleCode"]')).not.toBeNull()
    const values = $$('#bookForm input[type="radio"][name="status"]').map(r => r.value)
    expect(values.sort()).toEqual([...STATUSES].sort())
  })
})

describe('Carga inicial', () => {
  test('el select tiene una opción por cada módulo del servidor', async () => {
    await loadApp()
    const options = $$('#bookForm select[name="moduleCode"] option').filter(o => o.value !== '')
    expect(options.map(o => o.value)).toEqual(MODULES.map(m => m.code))
    expect(options[2].textContent).toContain(MODULES[2].cliteral)
  })

  test('se muestra una card por cada libro del servidor', async () => {
    await loadApp()
    expect(cards()).toHaveLength(BOOKS.length)
    expect(cards().map(c => c.dataset.id)).toEqual(BOOKS.map(b => String(b.id)))
  })

  test('la card de un libro en venta muestra sus datos', async () => {
    await loadApp()
    const c = card(7)
    expect(c.querySelector('img').getAttribute('alt')).toBe('Libro: 7')
    expect(c.querySelector('h3').textContent).toContain('Desarrollo WEB en entorno servidor')
    expect(c.querySelector('h3').textContent).toContain('(7)')
    const h4 = [...c.querySelectorAll('h4')].map(h => h.textContent)
    expect(h4[0]).toContain('McGraw-Hill')
    expect(h4[h4.length - 1]).toMatch(/15\s?€/)
    const text = c.textContent
    expect(text).toContain('173 páginas')
    expect(text).toContain('Estado: bad')
    expect(text).toContain('En venta')
    expect(text).not.toContain('Vendido')
    expect(text).toContain('Fet pols')
  })

  test('la card de un libro vendido muestra la fecha de venta en formato dd/mm/aaaa', async () => {
    await loadApp()
    const text = card(1).textContent
    expect(text).toMatch(/Vendido el 0?1\/0?2\/2023/)
    expect(text).not.toContain('En venta')
    expect(text).not.toContain('2023-02-01')
  })

  test('si el servidor no responde se muestra un mensaje de error', async () => {
    await loadApp({ fail: { 'GET *': 'network' } })
    expect(alerts('danger').length).toBeGreaterThan(0)
  })
})

describe('Añadir un libro', () => {
  test('al enviar el formulario se guarda el libro en el servidor', async () => {
    const server = await loadApp()
    fillForm()
    await submitForm()
    const post = server.calls.find(c => c.method === 'POST' && c.path.endsWith('/books'))
    expect(post).toBeDefined()
    expect(post.body).toMatchObject({
      moduleCode: NEW_BOOK.moduleCode,
      publisher: NEW_BOOK.publisher,
      price: 20,
      pages: 150,
      status: NEW_BOOK.status,
      photo: NEW_BOOK.photo,
      comments: NEW_BOOK.comments
    })
    expect(post.body.userId).toBeDefined()
    expect(post.body.id).toBeUndefined()
  })

  test('el nuevo libro aparece en la lista con la id que le da el servidor', async () => {
    await loadApp()
    fillForm()
    await submitForm()
    expect(cards()).toHaveLength(BOOKS.length + 1)
    const c = card(11)
    expect(c).not.toBeNull()
    expect(c.querySelector('h3').textContent).toContain('Diseño de interfaces WEB')
    expect(c.textContent).toContain('Anaya')
  })

  test('se muestra un mensaje informativo y ninguno de error', async () => {
    await loadApp()
    fillForm()
    await submitForm()
    expect(alerts('info')).toHaveLength(1)
    expect(alerts('danger')).toHaveLength(0)
  })

  test('también funciona haciendo clic en el botón Guardar', async () => {
    await loadApp()
    fillForm()
    await clickSave()
    expect(cards()).toHaveLength(BOOKS.length + 1)
  })

  test('el envío no recarga la página', async () => {
    await loadApp()
    let prevented
    document.addEventListener('submit', e => { prevented = e.defaultPrevented })
    fillForm()
    await submitForm()
    expect(prevented).toBe(true)
  })

  test('con el formulario vacío no se envía nada al servidor', async () => {
    const server = await loadApp()
    await submitForm()
    expect(server.calls.some(c => c.method === 'POST')).toBe(false)
    expect(cards()).toHaveLength(BOOKS.length)
  })

  test('si el servidor da error no se añade la card y se muestra un mensaje de error', async () => {
    await loadApp({ fail: { 'POST /books': 500 } })
    fillForm()
    await submitForm()
    expect(cards()).toHaveLength(BOOKS.length)
    expect(alerts('danger')).toHaveLength(1)
    expect(alerts('info')).toHaveLength(0)
  })
})

describe('Borrar un libro', () => {
  test('se borra del servidor y desaparece de la lista', async () => {
    const server = await loadApp()
    await removeById(7)
    expect(server.calls.some(c => c.method === 'DELETE' && c.path.endsWith('/books/7'))).toBe(true)
    expect(card(7)).toBeNull()
    expect(cards()).toHaveLength(BOOKS.length - 1)
    expect(alerts('info')).toHaveLength(1)
  })

  test('si el libro no existe se muestra un error y no cambia la lista', async () => {
    await loadApp()
    await removeById(999)
    expect(cards()).toHaveLength(BOOKS.length)
    expect(alerts('danger')).toHaveLength(1)
    expect(alerts('info')).toHaveLength(0)
  })

  test('si el servidor da error el libro sigue en la lista', async () => {
    await loadApp({ fail: { 'DELETE /books': 500 } })
    await removeById(7)
    expect(card(7)).not.toBeNull()
    expect(alerts('danger')).toHaveLength(1)
  })
})

describe('Mensajes', () => {
  test('tienen role="alert" y un botón que los cierra sin usar onclick en el HTML', async () => {
    await loadApp()
    await removeById(999)
    const alert = alerts('danger')[0]
    expect(alert.getAttribute('role')).toBe('alert')
    const button = alert.querySelector('button')
    expect(button).not.toBeNull()
    expect(button.hasAttribute('onclick')).toBe(false)
    button.click()
    expect(alerts('danger')).toHaveLength(0)
  })

  test('los informativos se cierran solos a los 3 segundos y los de error no', async () => {
    await loadApp()
    await removeById(999)
    await removeById(7)
    expect(alerts('danger')).toHaveLength(1)
    expect(alerts('info')).toHaveLength(1)
    await new Promise(resolve => setTimeout(resolve, 2500))
    expect(alerts('info')).toHaveLength(1)
    await new Promise(resolve => setTimeout(resolve, 700))
    await flush()
    expect(alerts('info')).toHaveLength(0)
    expect(alerts('danger')).toHaveLength(1)
  }, 10000)
})
