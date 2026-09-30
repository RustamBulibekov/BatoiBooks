// contrato.test.js
//
// Comprueba que tu functions.js exporta EXACTAMENTE las funciones que pide
// el enunciado, con el nombre exacto. Ejecuta los tests antes de entregar.

import { describe, it, expect } from 'vitest'
import * as functions from '../src/functions'

const FUNCIONES_REQUERIDAS = [
  'getBookById',
  'getBookIndexById',
  'bookExists',
  'booksFromUser',
  'booksFromModule',
  'booksCheeperThan',
  'booksWithStatus',
  'averagePriceOfBooks',
  'booksOfTypeNotes',
  'booksNotSold',
  'incrementPriceOfBooks',
  'getUserById',
  'getUserIndexById',
  'getUserByNickName',
  'getModuleByCode',
]

describe('Contrato de nombres exigido por el enunciado', () => {
  for (const nombre of FUNCIONES_REQUERIDAS) {
    it(`exporta una funciÃ³n llamada exactamente "${nombre}"`, () => {
      expect(
        typeof functions[nombre],
        `No se encuentra "${nombre}" en functions.js. Revisa mayÃºsculas, ` +
        `guiones/guiones bajos y que estÃ© en el export final.`
      ).toBe('function')
    })
  }
})