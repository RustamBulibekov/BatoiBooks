// @vitest-environment jsdom
// Tests de la rama 7-validacion.
// Comprueban lo que ve y hace el usuario, no cómo está organizado el código.
import { describe, test, expect } from 'vitest'
import {
  loadApp, flush, navigate, fillForm, submitForm, clickReset, selectModule, visiblePages, alerts,
  errorText, existsCalls, writeCalls, changeCalls, FIELDS, JSDOM_MESSAGE, NEW_BOOK, USER_ID
} from './helpers.js'

// Abre el formulario de añadir con un formulario correcto salvo lo que se cambie
async function openForm (changes = {}, options = {}) {
  const server = await loadApp({ hash: '#form', ...options })
  const data = { ...NEW_BOOK, ...changes }
  // Los campos que se quieren vacíos no se tocan
  for (const [name, value] of Object.entries(data)) if (value === undefined) delete data[name]
  fillForm(data)
  await flush()   // da tiempo a que responda el servidor si se ha comprobado el módulo
  return server
}

const posts = (server) => server.calls.filter(c => c.method === 'POST')

describe('El formulario no se envía si hay errores', () => {
  test('enviado vacío no hace ninguna petición, sigue en el formulario y muestra un error en cada campo', async () => {
    const server = await loadApp({ hash: '#form' })
    await submitForm()
    expect(writeCalls(server)).toHaveLength(0)
    expect(visiblePages()).toEqual(['form'])
    for (const name of FIELDS) expect(errorText(name), `error de ${name}`).not.toBe('')
  })

  test('los mensajes son nuestros y en castellano, no los del navegador', async () => {
    await loadApp({ hash: '#form' })
    await submitForm()
    for (const name of FIELDS) expect(errorText(name), `error de ${name}`).not.toBe(JSDOM_MESSAGE)
  })

  test('sólo muestran error los campos que lo tienen', async () => {
    await openForm({ price: '' })
    await submitForm()
    expect(errorText('price')).not.toBe('')
    for (const name of FIELDS.filter(n => n !== 'price')) expect(errorText(name), `error de ${name}`).toBe('')
  })

  test('sin estado elegido no se envía', async () => {
    const server = await openForm({ status: undefined })
    await submitForm()
    expect(posts(server)).toHaveLength(0)
    expect(errorText('status')).not.toBe('')
  })

  test('con todo correcto se guarda y no se ve ningún error', async () => {
    const server = await openForm()
    await submitForm()
    expect(posts(server)).toHaveLength(1)
    for (const name of FIELDS) expect(errorText(name), `error de ${name}`).toBe('')
  })

  test('al editar tampoco se guarda si hay errores', async () => {
    const server = await loadApp({ hash: '#edit/8' })
    fillForm({ publisher: '' })
    await submitForm()
    expect(changeCalls(server, 8)).toHaveLength(0)
    expect(errorText('publisher')).not.toBe('')
  })
})

describe('Precio y páginas', () => {
  test.each([
    ['-1', false], ['0', true], ['12', true], ['12.5', true], ['12.55', true], ['12.555', false]
  ])('precio %s: %s', async (price, valid) => {
    const server = await openForm({ price })
    await submitForm()
    expect(posts(server)).toHaveLength(valid ? 1 : 0)
    expect(errorText('price') === '').toBe(valid)
  })

  test.each([
    ['0', false], ['-3', false], ['1', true], ['150', true], ['10.5', false]
  ])('páginas %s: %s', async (pages, valid) => {
    const server = await openForm({ pages })
    await submitForm()
    expect(posts(server)).toHaveLength(valid ? 1 : 0)
    expect(errorText('pages') === '').toBe(valid)
  })

  test('el mensaje dice qué falla: no es el mismo vacío, negativo o con demasiados decimales', async () => {
    const messages = []
    for (const price of ['', '-1', '12.555']) {
      await openForm({ price })
      await submitForm()
      messages.push(errorText('price'))
    }
    expect(new Set(messages).size).toBe(3)
  })

  test('el precio con céntimos se guarda como número', async () => {
    const server = await openForm({ price: '12.5' })
    await submitForm()
    expect(posts(server)[0].body.price).toBe(12.5)
  })
})

describe('Corregir los errores', () => {
  test('al corregir un campo su error desaparece sin tener que volver a enviar', async () => {
    await openForm({ publisher: '' })
    await submitForm()
    expect(errorText('publisher')).not.toBe('')
    fillForm({ publisher: 'Anaya' })
    expect(errorText('publisher')).toBe('')
  })

  test('después de corregirlo todo se puede guardar', async () => {
    const server = await loadApp({ hash: '#form' })
    await submitForm()
    fillForm(NEW_BOOK)
    await submitForm()
    expect(posts(server)).toHaveLength(1)
  })

  test('al pulsar Reset desaparecen los errores', async () => {
    await loadApp({ hash: '#form' })
    await submitForm()
    await clickReset()
    for (const name of FIELDS) expect(errorText(name), `error de ${name}`).toBe('')
  })

  test('al volver a Añadir libro no se ven los errores de antes', async () => {
    await loadApp({ hash: '#form' })
    await submitForm()
    await navigate('#list')
    await navigate('#form')
    for (const name of FIELDS) expect(errorText(name), `error de ${name}`).toBe('')
  })
})

describe('Un solo libro de cada módulo', () => {
  test('al elegir un módulo se pregunta al servidor si ya tenemos un libro de ese módulo', async () => {
    const server = await loadApp({ hash: '#form' })
    await selectModule('0615')
    const calls = existsCalls(server)
    expect(calls.length).toBeGreaterThan(0)
    expect(calls.at(-1).query).toEqual({ userId: String(USER_ID), moduleCode: '0615' })
  })

  test('si ya tenemos un libro de ese módulo, el módulo da error y no se puede guardar', async () => {
    const server = await openForm({ moduleCode: '0612' })
    await submitForm()
    expect(errorText('moduleCode')).not.toBe('')
    expect(posts(server)).toHaveLength(0)
  })

  test('el error se ve en cuanto se elige el módulo, sin enviar', async () => {
    await loadApp({ hash: '#form' })
    await selectModule('0612')
    expect(errorText('moduleCode')).not.toBe('')
  })

  test('el mensaje no es el de campo obligatorio', async () => {
    await loadApp({ hash: '#form' })
    await submitForm()
    const empty = errorText('moduleCode')
    await selectModule('0612')
    expect(errorText('moduleCode')).not.toBe(empty)
  })

  test('al elegir el módulo sólo se marca el error del módulo, no el de los campos que aún no se han rellenado', async () => {
    await loadApp({ hash: '#form' })
    await selectModule('0612')
    for (const name of FIELDS.filter(n => n !== 'moduleCode')) expect(errorText(name), `error de ${name}`).toBe('')
  })

  test('si se cambia a un módulo que no tenemos, el error desaparece y se puede guardar', async () => {
    const server = await openForm({ moduleCode: '0612' })
    await selectModule('0615')
    expect(errorText('moduleCode')).toBe('')
    await submitForm()
    expect(posts(server)).toHaveLength(1)
  })

  test('un módulo del que sólo tienen libros otros usuarios no da error', async () => {
    await loadApp({ hash: '#form' })
    await selectModule('0614')
    expect(errorText('moduleCode')).toBe('')
  })

  test('si no se puede comprobar, se muestra un mensaje de error y el módulo no se marca como repetido', async () => {
    await loadApp({ hash: '#form', fail: {} })
    // Hacemos que falle sólo la comprobación, no la carga inicial
    globalThis.fetch.mockImplementationOnce(async () => { throw new TypeError('Failed to fetch') })
    await selectModule('0615')
    expect(alerts('danger')).toHaveLength(1)
    expect(errorText('moduleCode')).toBe('')
  })
})
