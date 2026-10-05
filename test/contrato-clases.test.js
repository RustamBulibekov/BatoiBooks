// contrato-clases.test.js
//
// Cópialo a la carpeta test/ y ejecútalo antes de entregar:
//
//   npm run test
//
// Comprueba que tus seis clases están donde y como pide el enunciado, con los
// nombres EXACTOS de fichero y de método. Si algo sale en rojo aquí, la
// corrección automática no lo reconocerá aunque tu lógica sea correcta.

import { describe, it, expect } from 'vitest'

// import.meta.glob solo devuelve los ficheros que existen: si te falta uno o
// lo has llamado distinto, el test correspondiente falla con un mensaje claro
// en vez de romper todo el fichero con un error de importación.
const modelo = import.meta.glob('../src/model/*.class.js', { eager: true })
const claseDe = (fichero) => modelo[`../src/model/${fichero}.class.js`]?.default

// typeof por sí solo no basta para "toString": TODAS las clases de JS heredan
// un toString de Object.prototype (el de "[object Object]"), así que una
// clase vacía también lo "tendría" según typeof. Comprobamos que el método
// es PROPIO de la clase (definido en su cuerpo), no heredado.
function tieneMetodoPropio(Clase, metodo) {
  return (
    typeof Clase?.prototype?.[metodo] === 'function' &&
    Object.prototype.hasOwnProperty.call(Clase.prototype, metodo)
  )
}

const CONTRATO = {
  book: ['toString'],
  user: ['toString'],
  module: ['toString'],
  books: [
    'populate', 'addBook', 'removeBook', 'changeBook', 'toString',
    'getBookById', 'getBookIndexById', 'bookExists', 'booksFromUser',
    'booksFromModule', 'booksCheeperThan', 'booksWithStatus',
    'averagePriceOfBooks', 'booksOfTypeNotes', 'booksNotSold',
    'incrementPriceOfBooks'
  ],
  users: [
    'populate', 'addUser', 'removeUser', 'changeUser', 'toString',
    'getUserById', 'getUserIndexById', 'getUserByNickName'
  ],
  modules: ['populate', 'toString', 'getModuleByCode']
}

describe('Contrato: ficheros y clases', () => {
  for (const fichero of Object.keys(CONTRATO)) {
    it(`src/model/${fichero}.class.js existe y exporta por defecto una clase`, () => {
      expect(
        typeof claseDe(fichero),
        `No se encuentra src/model/${fichero}.class.js o no hace "export default class". ` +
        `Revisa el nombre del fichero (todo minúsculas) y el export.`
      ).toBe('function')
    })
  }
})

describe('Contrato: métodos de cada clase', () => {
  for (const [fichero, metodos] of Object.entries(CONTRATO)) {
    for (const metodo of metodos) {
      it(`${fichero}.class.js tiene el método "${metodo}"`, () => {
        expect(
          tieneMetodoPropio(claseDe(fichero), metodo),
          `Falta el método "${metodo}" en ${fichero}.class.js (o lo hereda de Object.prototype ` +
          `en vez de definirlo tú, como pasa con un toString no escrito). Revisa mayúsculas y ortografía.`
        ).toBe(true)
      })
    }
  }
})

describe('Contrato: limpieza de la práctica anterior', () => {
  it('src/functions.js ya no existe (sus métodos están en las clases)', () => {
    expect(Object.keys(import.meta.glob('../src/functions.js'))).toHaveLength(0)
  })

  it('test/functions.test.js y test/contrato.test.js de Arrays ya no existen', () => {
    const restos = Object.keys(import.meta.glob(['./functions.test.js', './contrato.test.js']))
    expect(restos, `Borra estos ficheros de la práctica anterior: ${restos.join(', ')}`).toHaveLength(0)
  })
})