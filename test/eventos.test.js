// @vitest-environment jsdom
// Tests de la rama 6-eventos.
// Comprueban lo que ve y hace el usuario, no cómo está organizado el código.
import { describe, test, expect } from 'vitest'
import {
  loadApp, $, $$, cards, card, alerts, cartCount, isHidden, visiblePages, cardButton,
  clickCardButton, navigate, clickMenu, goBack, formValues, fillForm, submitForm, clickSave, clickReset,
  changeCalls, BOOKS, MODULES, OWN_IDS, OTHER_IDS, NEW_BOOK, USER_ID
} from './helpers.js'

const moduleName = (code) => MODULES.find(m => m.code === code).cliteral
const titleOf = () => $('#form h2').textContent.trim()

describe('Estructura de la página', () => {
  test('ya no está el #remove y hay un div #not-found con un enlace a la lista', async () => {
    await loadApp()
    expect($('#remove')).toBeNull()
    expect($('main #not-found')).not.toBeNull()
    expect($('#not-found a[href="#list"]')).not.toBeNull()
  })

  test('el encabezado tiene el contador del carrito a 0', async () => {
    await loadApp()
    expect($('header #cart-count')).not.toBeNull()
    expect(cartCount()).toBe('0')
  })

  test('el formulario tiene un título h2 y un campo id', async () => {
    await loadApp()
    expect($('#form h2')).not.toBeNull()
    expect($('#bookForm').elements.namedItem('id')).not.toBeNull()
  })

  test('nuestros libros tienen los botones Editar y Borrar, y no el del carrito', async () => {
    await loadApp()
    for (const id of OWN_IDS) {
      expect(cardButton(id, 'Editar')).not.toBeNull()
      expect(cardButton(id, 'Borrar')).not.toBeNull()
      expect(cardButton(id, 'Añadir al carrito')).toBeNull()
    }
  })

  test('los libros de otros usuarios sólo tienen el botón del carrito', async () => {
    await loadApp()
    for (const id of OTHER_IDS) {
      expect(cardButton(id, 'Añadir al carrito')).not.toBeNull()
      expect(cardButton(id, 'Editar')).toBeNull()
      expect(cardButton(id, 'Borrar')).toBeNull()
    }
  })

  test('los botones son BUTTON con un icono de Material Icons dentro', async () => {
    await loadApp()
    for (const [id, label, icon] of [[8, 'Editar', 'edit'], [8, 'Borrar', 'delete'], [6, 'Añadir al carrito', 'add_shopping_cart']]) {
      const button = cardButton(id, label)
      expect(button.tagName).toBe('BUTTON')
      expect(button.querySelector('.material-icons').textContent.trim()).toBe(icon)
    }
  })
})

describe('Navegación', () => {
  test('sin hash sólo se ve la lista', async () => {
    await loadApp()
    expect(visiblePages()).toEqual(['list'])
    expect(cards()).toHaveLength(BOOKS.length)
  })

  test('cada enlace del menú muestra sólo su página', async () => {
    await loadApp()
    await clickMenu('#form')
    expect(visiblePages()).toEqual(['form'])
    await clickMenu('#about')
    expect(visiblePages()).toEqual(['about'])
    await clickMenu('#list')
    expect(visiblePages()).toEqual(['list'])
  })

  test('el encabezado, el menú, los mensajes y el pie se ven siempre', async () => {
    await loadApp()
    for (const hash of ['#form', '#about', '#no-existe']) {
      await navigate(hash)
      for (const selector of ['header', 'nav', '#messages', 'footer']) {
        expect(isHidden($(selector)), `${selector} en ${hash}`).toBe(false)
      }
    }
  })

  test('las páginas se ocultan con la clase hidden', async () => {
    await loadApp()
    await navigate('#about')
    for (const id of ['list', 'form', 'not-found']) {
      expect($('#' + id).classList.contains('hidden')).toBe(true)
    }
    expect($('#about').classList.contains('hidden')).toBe(false)
  })

  test('una ruta que no existe muestra la página de no encontrada', async () => {
    await loadApp()
    await navigate('#no-existe')
    expect(visiblePages()).toEqual(['not-found'])
  })

  test('abrir la aplicación directamente en una ruta muestra esa página', async () => {
    await loadApp({ hash: '#about' })
    expect(visiblePages()).toEqual(['about'])
  })

  test('abrir la aplicación en una ruta que no existe muestra la página de no encontrada', async () => {
    await loadApp({ hash: '#no-existe' })
    expect(visiblePages()).toEqual(['not-found'])
  })

  test('el botón Atrás del navegador vuelve a la página anterior', async () => {
    await loadApp()
    await clickMenu('#about')
    await clickMenu('#form')
    await goBack()
    expect(visiblePages()).toEqual(['about'])
    await goBack()
    expect(visiblePages()).toEqual(['list'])
  })
})

describe('Editar un libro', () => {
  test('el botón Editar lleva a #edit/ID con el formulario relleno', async () => {
    await loadApp()
    await clickCardButton(8, 'Editar')
    expect(location.hash).toBe('#edit/8')
    expect(visiblePages()).toEqual(['form'])
    expect(titleOf()).toBe('Editar libro')
    const book = BOOKS.find(b => b.id === 8)
    expect(formValues()).toMatchObject({
      id: '8',
      moduleCode: book.moduleCode,
      publisher: book.publisher,
      price: String(book.price),
      pages: String(book.pages),
      status: book.status,
      comments: book.comments
    })
  })

  test('también funciona al pulsar sobre el icono del botón', async () => {
    await loadApp()
    await clickCardButton(8, 'Editar', { onIcon: true })
    expect(location.hash).toBe('#edit/8')
    expect(visiblePages()).toEqual(['form'])
  })

  test('al editar se ve la id pero no se puede cambiar', async () => {
    await loadApp()
    await navigate('#edit/8')
    const input = $('#bookForm').elements.namedItem('id')
    expect(isHidden(input)).toBe(false)
    expect(input.readOnly || input.disabled).toBe(true)
  })

  test('al añadir no se ve la id', async () => {
    await loadApp()
    await navigate('#form')
    expect(titleOf()).toBe('Añadir libro')
    expect(isHidden($('#bookForm').elements.namedItem('id'))).toBe(true)
  })

  test('abrir la aplicación directamente en #edit/ID muestra el libro en el formulario', async () => {
    await loadApp({ hash: '#edit/8' })
    expect(visiblePages()).toEqual(['form'])
    expect(titleOf()).toBe('Editar libro')
    expect(formValues().publisher).toBe('McGraw-Hill')
  })

  test('si el libro no existe se ve la página de no encontrada', async () => {
    await loadApp()
    await navigate('#edit/999')
    expect(visiblePages()).toEqual(['not-found'])
  })

  test('si el libro no es nuestro se muestra un error y se vuelve a la lista', async () => {
    await loadApp()
    await navigate('#edit/6')
    expect(alerts('danger')).toHaveLength(1)
    expect(visiblePages()).toEqual(['list'])
    expect(location.hash).toBe('#list')
  })

  test('al guardar se modifica en el servidor, se actualiza la card y se vuelve a la lista', async () => {
    const server = await loadApp()
    await clickCardButton(8, 'Editar')
    fillForm({ price: '22', comments: 'Como nuevo' })
    await clickSave()
    expect(changeCalls(server, 8)).toHaveLength(1)
    expect(server.db.books.find(b => b.id === 8)).toMatchObject({ price: 22, comments: 'Como nuevo' })
    expect(server.calls.some(c => c.method === 'POST')).toBe(false)
    expect(cards()).toHaveLength(BOOKS.length)
    expect(card(8).textContent).toContain('22 €')
    expect(card(8).textContent).toContain('Como nuevo')
    expect(alerts('info')).toHaveLength(1)
    expect(location.hash).toBe('#list')
    expect(visiblePages()).toEqual(['list'])
  })

  test('al guardar no se pierden el userId ni la fecha de venta', async () => {
    const server = await loadApp()
    await navigate('#edit/1')
    fillForm({ publisher: 'Apunts 2' })
    await submitForm()
    const saved = server.db.books.find(b => b.id === 1)
    expect(saved.publisher).toBe('Apunts 2')
    expect(saved.userId).toBe(USER_ID)
    expect(saved.soldDate).toBe('2023-02-01')
  })

  test('Reset mientras se edita deja el formulario vacío y en modo añadir', async () => {
    const server = await loadApp()
    await navigate('#edit/8')
    await clickReset()
    expect(location.hash).toBe('#form')
    expect(titleOf()).toBe('Añadir libro')
    expect(isHidden($('#bookForm').elements.namedItem('id'))).toBe(true)
    expect(formValues().publisher).toBe('')
    fillForm()
    await submitForm()
    expect(changeCalls(server, 8)).toHaveLength(0)
    expect(server.calls.filter(c => c.method === 'POST')).toHaveLength(1)
  })

  test('ir a "Añadir libro" mientras se edita deja el formulario vacío y en modo añadir', async () => {
    const server = await loadApp()
    await clickCardButton(8, 'Editar')
    await clickMenu('#form')
    expect(titleOf()).toBe('Añadir libro')
    expect(formValues().publisher).toBe('')
    expect(formValues().id).toBe('')
    fillForm()
    await submitForm()
    expect(changeCalls(server, 8)).toHaveLength(0)
    expect(server.calls.filter(c => c.method === 'POST')).toHaveLength(1)
  })
})

describe('Añadir un libro', () => {
  test('se guarda con nuestro userId, aparece con sus botones y se vuelve a la lista', async () => {
    const server = await loadApp()
    await clickMenu('#form')
    fillForm()
    await clickSave()
    const post = server.calls.find(c => c.method === 'POST')
    expect(post.body.userId).toBe(USER_ID)
    expect(cards()).toHaveLength(BOOKS.length + 1)
    expect(cardButton(11, 'Editar')).not.toBeNull()
    expect(cardButton(11, 'Borrar')).not.toBeNull()
    expect(location.hash).toBe('#list')
    expect(visiblePages()).toEqual(['list'])
  })

  test('los botones del libro añadido funcionan', async () => {
    const server = await loadApp({ hash: '#form' })
    fillForm()
    await submitForm()
    await clickCardButton(11, 'Borrar')
    expect(server.calls.some(c => c.method === 'DELETE' && c.path.endsWith('/books/11'))).toBe(true)
    expect(card(11)).toBeNull()
  })
})

describe('Borrar un libro', () => {
  test('pide confirmación con la id y el módulo, y si se acepta lo borra', async () => {
    const server = await loadApp()
    await clickCardButton(8, 'Borrar')
    expect(server.confirm).toHaveBeenCalledTimes(1)
    const text = server.confirm.mock.calls[0][0]
    expect(text).toContain('8')
    expect(text).toContain(moduleName('0612'))
    expect(server.calls.some(c => c.method === 'DELETE' && c.path.endsWith('/books/8'))).toBe(true)
    expect(card(8)).toBeNull()
    expect(alerts('info')).toHaveLength(1)
  })

  test('si no se acepta no se borra', async () => {
    const server = await loadApp({ confirm: false })
    await clickCardButton(8, 'Borrar')
    expect(server.confirm).toHaveBeenCalledTimes(1)
    expect(server.calls.some(c => c.method === 'DELETE')).toBe(false)
    expect(card(8)).not.toBeNull()
  })

  test('también funciona al pulsar sobre el icono del botón', async () => {
    const server = await loadApp()
    await clickCardButton(8, 'Borrar', { onIcon: true })
    expect(server.calls.some(c => c.method === 'DELETE' && c.path.endsWith('/books/8'))).toBe(true)
    expect(card(8)).toBeNull()
  })

  test('si el servidor da error el libro sigue en la lista', async () => {
    await loadApp({ fail: { 'DELETE /books': 500 } })
    await clickCardButton(8, 'Borrar')
    expect(card(8)).not.toBeNull()
    expect(alerts('danger')).toHaveLength(1)
  })
})

describe('Carrito', () => {
  test('añadir un libro muestra un mensaje y aumenta el contador', async () => {
    await loadApp()
    await clickCardButton(6, 'Añadir al carrito')
    expect(alerts('info')).toHaveLength(1)
    expect(cartCount()).toBe('1')
    await clickCardButton(7, 'Añadir al carrito')
    expect(cartCount()).toBe('2')
  })

  test('también funciona al pulsar sobre el icono del botón', async () => {
    await loadApp()
    await clickCardButton(6, 'Añadir al carrito', { onIcon: true })
    expect(cartCount()).toBe('1')
  })

  test('añadir un libro que ya está en el carrito da un error y no cambia el contador', async () => {
    await loadApp()
    await clickCardButton(6, 'Añadir al carrito')
    await clickCardButton(6, 'Añadir al carrito')
    expect(alerts('danger')).toHaveLength(1)
    expect(cartCount()).toBe('1')
  })

  test('añadir un libro vendido da un error y no cambia el contador', async () => {
    const books = [...BOOKS, { id: 12, userId: 5, moduleCode: '0615', publisher: 'Anaya', price: 9, pages: 90, status: 'good', photo: '', comments: '', soldDate: '2024-06-10' }]
    await loadApp({ books })
    await clickCardButton(12, 'Añadir al carrito')
    expect(alerts('danger')).toHaveLength(1)
    expect(alerts('info')).toHaveLength(0)
    expect(cartCount()).toBe('0')
  })
})
