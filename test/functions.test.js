import { describe, it, expect } from 'vitest'
import * as functions from '../src/functions'
import data from '../src/services/datos'

const { books, users, modules } = data



describe('function getBookById', () => {
  it('devuelve el libro con id 1', () => {
    const response = functions.getBookById(books, 1)
    expect(response.id).toBe(1)
  })


  it('lanza error si el libro no existe', () => {
expect(() => functions.getBookById(books, 999)).toThrow()
})
})

describe('function getBookIndexById', () => {
it('devuelve el índice del libro con id 1', () => {
expect(functions.getBookIndexById(books, 1)).toBe(0)
})

it('devuelve el índice del libro con id 7', () => {
const index = functions.getBookIndexById(books, 7)
expect(books[index].id).toBe(7)
})

it('lanza error si el libro no existe', () => {
expect(() => functions.getBookIndexById(books, 999)).toThrow()
})
})

describe('function booksFromUser', () => {
it('devuelve los libros del usuario 4', () => {
const result = functions.booksFromUser(books, 4)
expect(result.length).toBe(3)
expect(result.every(b => b.userId === 4)).toBe(true)
})

it('devuelve array vacío si el usuario no tiene libros', () => {
expect(functions.booksFromUser(books, 999)).toEqual([])
})

it('no muta el array original', () => {
const originalLength = books.length
functions.booksFromUser(books, 4)
expect(books.length).toBe(originalLength)
})
})

describe('function booksFromModule', () => {
it('devuelve los libros del módulo 5021', () => {
const result = functions.booksFromModule(books, '5021')
expect(result.length).toBe(3)
expect(result.every(b => b.moduleCode === '5021')).toBe(true)
})

it('devuelve los libros del módulo 5025', () => {
const result = functions.booksFromModule(books, '5025')
expect(result.length).toBe(3)
})

it('devuelve array vacío si el módulo no tiene libros', () => {
expect(functions.booksFromModule(books, '9999')).toEqual([])
})
})

describe('function booksCheeperThan', () => {
it('devuelve libros con precio <= 15', () => {
const result = functions.booksCheeperThan(books, 15)
expect(result.every(b => b.price <= 15)).toBe(true)
})

it('incluye libros con precio exactamente igual', () => {
const result = functions.booksCheeperThan(books, 15)
expect(result.some(b => b.price === 15)).toBe(true)
})

it('devuelve array vacío si el precio es 0', () => {
expect(functions.booksCheeperThan(books, 0)).toEqual([])
})
})

describe('function booksWithStatus', () => {
it('devuelve libros con status "good"', () => {
const result = functions.booksWithStatus(books, 'good')
expect(result.every(b => b.status === 'good')).toBe(true)
})

it('devuelve libros con status "new"', () => {
const result = functions.booksWithStatus(books, 'new')
expect(result.every(b => b.status === 'new')).toBe(true)
})

it('devuelve array vacío para un status inexistente', () => {
expect(functions.booksWithStatus(books, 'unknown')).toEqual([])
})
})

describe('function averagePriceOfbooks', () => {
it('devuelve una cadena con formato "X.XX €"', () => {
expect(functions.averagePriceOfBooks(books)).toMatch(/^\d+\.\d{2} €$/)
})

it('calcula correctamente la media', () => {
const total = books.reduce((sum, b) => sum + b.price, 0)
const expected = (total / books.length).toFixed(2) + ' €'
expect(functions.averagePriceOfBooks(books)).toBe(expected)
})

it('devuelve "0.00 €" para array vacío', () => {
expect(functions.averagePriceOfBooks([])).toBe('0.00 €')
})
})

describe('function booksOfTypeNotes', () => {
it('devuelve solo libros con publisher "Apunts"', () => {
const result = functions.booksOfTypeNotes(books)
expect(result.every(b => b.publisher === 'Apunts')).toBe(true)
})

it('no devuelve libros de editoriales', () => {
const result = functions.booksOfTypeNotes(books)
expect(result.some(b => b.publisher === 'McGraw-Hill')).toBe(false)
})

it('no muta el array original', () => {
const originalLength = books.length
functions.booksOfTypeNotes(books)
expect(books.length).toBe(originalLength)
})
})

describe('function bookExists', () => {
it('devuelve true si el libro existe', () => {
expect(functions.bookExists(books, 1)).toBe(true)
})

it('devuelve false si el libro no existe', () => {
expect(functions.bookExists(books, 999)).toBe(false)
})

it('devuelve un booleano', () => {
expect(typeof functions.bookExists(books, 1)).toBe('boolean')
})
})

describe('function booksNotSold', () => {
it('devuelve solo libros sin soldDate', () => {
const result = functions.booksNotSold(books)
expect(result.every(b => !b.soldDate)).toBe(true)
})

it('excluye el libro vendido (id 1)', () => {
const result = functions.booksNotSold(books)
expect(result.some(b => b.id === 1)).toBe(false)
})

it('no muta el array original', () => {
const originalLength = books.length
functions.booksNotSold(books)
expect(books.length).toBe(originalLength)
})
})

describe('function incrementPriceOfBooks', () => {
it('incrementa todos los precios un 10%', () => {
const result = functions.incrementPriceOfBooks(books, 10)
books.forEach((b, i) => {
expect(result[i].price).toBe(+(b.price * 1.1).toFixed(2))
})
})

it('NO muta el array original', () => {
const originalPrices = books.map(b => b.price)
functions.incrementPriceOfBooks(books, 10)
expect(books.map(b => b.price)).toEqual(originalPrices)
})

it('devuelve un array nuevo (no la misma referencia)', () => {
const result = functions.incrementPriceOfBooks(books, 10)
expect(result).not.toBe(books)
})

it('incrementa un 0% sin cambios', () => {
const result = functions.incrementPriceOfBooks(books, 0)
books.forEach((b, i) => {
expect(result[i].price).toBe(b.price)
})
})
})

// ============================================================
// USERS
// ============================================================

describe('function getUserById', () => {
it('devuelve el usuario con id 2', () => {
const response = functions.getUserById(users, 2)
expect(response.id).toBe(2)
})

it('devuelve el usuario con id 4', () => {
const response = functions.getUserById(users, 4)
expect(response.nick).toBe('Marta')
})

it('lanza error si el usuario no existe', () => {
expect(() => functions.getUserById(users, 999)).toThrow()
})
})

describe('function getUserIndexById', () => {
it('devuelve el índice del usuario con id 2', () => {
expect(functions.getUserIndexById(users, 2)).toBe(0)
})

it('devuelve el índice del usuario con id 4', () => {
const index = functions.getUserIndexById(users, 4)
expect(users[index].id).toBe(4)
})

it('lanza error si el usuario no existe', () => {
expect(() => functions.getUserIndexById(users, 999)).toThrow()
})
})

describe('function getUserByNickName', () => {
it('devuelve el usuario con nick "Ignasi"', () => {
const response = functions.getUserByNickName(users, 'Ignasi')
expect(response.nick).toBe('Ignasi')
expect(response.id).toBe(2)
})

it('devuelve el usuario con nick "Marta"', () => {
const response = functions.getUserByNickName(users, 'Marta')
expect(response.id).toBe(4)
})

it('lanza error si el nick no existe', () => {
expect(() => functions.getUserByNickName(users, 'NoExiste')).toThrow()
})
})

// ============================================================
// MODULES
// ============================================================

describe('function getModuleByCode', () => {
it('devuelve el módulo con código 5021', () => {
const response = functions.getModuleByCode(modules, '5021')
expect(response.code).toBe('5021')
expect(response.courseId).toBe('59')
})

it('devuelve el módulo con código 0011', () => {
const response = functions.getModuleByCode(modules, '0011')
expect(response.code).toBe('0011')
})

it('lanza error si el módulo no existe', () => {
expect(() => functions.getModuleByCode(modules, '9999')).toThrow()
})
})
  




