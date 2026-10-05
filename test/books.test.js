import { describe, it, expect, beforeEach } from 'vitest'
import Books from '../src/model/books.class'
import Book from '../src/model/book.class'

const booksFixture = [
  { id: 1, userId: 2, moduleCode: '5025', publisher: 'Apunts', price: 12, pages: 25, status: 'good', soldDate: '2023-02-01', photo: '', comments: '' },
  { id: 2, userId: 3, moduleCode: '5021', publisher: 'McGraw-Hill', price: 75, pages: 273, status: 'new', soldDate: '', photo: '', comments: 'Sense obrir' },
  { id: 3, userId: 4, moduleCode: '5021', publisher: 'McGraw-Hill', price: 15, pages: 173, status: 'bad', soldDate: '', photo: '', comments: 'Fet pols' },
  { id: 4, userId: 4, moduleCode: '5025', publisher: 'Apunts', price: 35, pages: 73, status: 'good', soldDate: '', photo: '', comments: '' }
]

describe('Clase Books', () => {
  let books

  beforeEach(() => {
    books = new Books()
    books.populate(booksFixture)
  })

  // ========== CONSTRUCTOR / POPULATE ==========
  it('constructor inicializa data como array vacío', () => {
    const empty = new Books()
    expect(empty.data).toEqual([])
  })

  it('populate carga instancias de Book', () => {
    expect(books.data.length).toBe(4)
    expect(books.data[0]).toBeInstanceOf(Book)
    expect(books.data[3]).toBeInstanceOf(Book)
  })

  it('populate no deja objetos planos', () => {
    expect(books.data.every(b => b instanceof Book)).toBe(true)
  })

  // ========== addBook ==========
  it('addBook añade un libro con id nuevo', () => {
    const nuevo = books.addBook({
      userId: 2, moduleCode: '5025', publisher: 'Apunts',
      price: 10, pages: 50, status: 'good'
    })
    expect(nuevo).toBeInstanceOf(Book)
    expect(nuevo.id).toBe(5)
    expect(books.data.length).toBe(5)
  })

  it('addBook genera id aunque se haya borrado uno intermedio', () => {
    books.removeBook(2)
    const nuevo = books.addBook({
      userId: 2, moduleCode: '5025', publisher: 'Apunts',
      price: 10, pages: 50, status: 'good'
    })
    expect(nuevo.id).toBe(5)   // Math.max(1,3,4) + 1
  })

  // ========== removeBook ==========
  it('removeBook elimina el libro', () => {
    books.removeBook(2)
    expect(books.data.length).toBe(3)
    expect(books.bookExists(2)).toBe(false)
  })

  it('removeBook lanza error si no existe', () => {
    expect(() => books.removeBook(999)).toThrow()
    expect(books.data.length).toBe(4)
  })

  // ========== changeBook ==========
  it('changeBook sustituye y devuelve instancia de Book', () => {
    const changed = books.changeBook({
      id: 2, userId: 3, moduleCode: '5021', publisher: 'McGraw-Hill',
      price: 80, pages: 273, status: 'new', soldDate: '', photo: '', comments: ''
    })
    expect(changed).toBeInstanceOf(Book)
    expect(changed.price).toBe(80)
    expect(books.getBookById(2).price).toBe(80)
  })

  it('changeBook lanza error si no existe', () => {
    expect(() => books.changeBook({ id: 999, price: 100 })).toThrow()
  })

  // ========== consultas heredadas ==========
  it('getBookById devuelve el libro', () => {
    expect(books.getBookById(1).id).toBe(1)
  })

  it('getBookById lanza error si no existe', () => {
    expect(() => books.getBookById(999)).toThrow()
  })

  it('getBookIndexById devuelve el índice correcto', () => {
    expect(books.getBookIndexById(3)).toBe(2)
  })

  it('getBookIndexById lanza error si no existe', () => {
    expect(() => books.getBookIndexById(999)).toThrow()
  })

  it('bookExists devuelve true/false', () => {
    expect(books.bookExists(1)).toBe(true)
    expect(books.bookExists(999)).toBe(false)
  })

  it('booksFromUser filtra por userId', () => {
    const result = books.booksFromUser(4)
    expect(result.length).toBe(2)
    expect(result.every(b => b.userId === 4)).toBe(true)
  })

  it('booksFromModule filtra por moduleCode', () => {
    expect(books.booksFromModule('5021').length).toBe(2)
  })

  it('booksCheeperThan filtra por precio <=', () => {
    const result = books.booksCheeperThan(15)
    expect(result.every(b => b.price <= 15)).toBe(true)
  })

  it('booksWithStatus filtra por estado', () => {
    expect(books.booksWithStatus('new').length).toBe(1)
    expect(books.booksWithStatus('good').length).toBe(2)
  })

  it('booksOfTypeNotes filtra por publisher "Apunts"', () => {
    const result = books.booksOfTypeNotes()
    expect(result.every(b => b.publisher === 'Apunts')).toBe(true)
    expect(result.length).toBe(2)
  })

  it('booksNotSold filtra sin soldDate', () => {
    const result = books.booksNotSold()
    expect(result.every(b => !b.soldDate)).toBe(true)
    expect(result.length).toBe(3)
  })

  it('averagePriceOfBooks devuelve string formateado', () => {
    expect(books.averagePriceOfBooks()).toMatch(/^\d+\.\d{2} €$/)
  })

  it('averagePriceOfBooks devuelve "0.00 €" con array vacío', () => {
    const empty = new Books()
    expect(empty.averagePriceOfBooks()).toBe('0.00 €')
  })

  it('incrementPriceOfBooks devuelve nuevo array sin mutar', () => {
    const originalPrices = books.data.map(b => b.price)
    const result = books.incrementPriceOfBooks(10)
    expect(result).not.toBe(books.data)
    expect(books.data.map(b => b.price)).toEqual(originalPrices)
    expect(result[0].price).toBe(+(booksFixture[0].price * 1.1).toFixed(2))
  })

  // ========== toString ==========
  it('toString devuelve una cadena con todos los libros', () => {
    const texto = books.toString()
    expect(typeof texto).toBe('string')
    expect(texto).toContain('Apunts')
    expect(texto).toContain('McGraw-Hill')
  })
})