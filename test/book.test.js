import { describe, it, expect } from 'vitest'
import Book from '../src/model/book.class'

const booksFixture = [
  {
    id: 31, userId: 2, moduleCode: '2150', publisher: 'Apunts',
    price: 14, pages: 76, status: 'bad',
    soldDate: '2023-03-25', photo: 'book31img1.png', comments: 'Muy buen estado'
  },
  {
    id: 35, userId: 2, moduleCode: '7021', publisher: 'McGraw-Hill',
    price: 34, pages: 116, status: 'good'
  }
]

describe('Clase Book', () => {
  it('constructor crea un libro vendido', () => {
    const newBook = new Book(booksFixture[0])
    expect(newBook).toBeInstanceOf(Book)
    expect(newBook).toEqual(booksFixture[0])
  })

  it('constructor crea un libro no vendido con campos opcionales vacíos', () => {
    const newBook = new Book(booksFixture[1])
    expect(newBook).toEqual({
      ...booksFixture[1],
      soldDate: '',
      photo: '',
      comments: ''
    })
  })

  it('constructor asigna todos los campos obligatorios', () => {
    const newBook = new Book(booksFixture[0])
    expect(newBook.id).toBe(31)
    expect(newBook.userId).toBe(2)
    expect(newBook.moduleCode).toBe('2150')
    expect(newBook.publisher).toBe('Apunts')
    expect(newBook.price).toBe(14)
    expect(newBook.pages).toBe(76)
    expect(newBook.status).toBe('bad')
  })

  it('toString contiene id, publisher y status', () => {
    const newBook = new Book(booksFixture[0])
    const texto = newBook.toString()
    expect(texto).toContain(String(booksFixture[0].id))
    expect(texto).toContain(booksFixture[0].publisher)
    expect(texto).toContain(booksFixture[0].status)
  })

  it('toString devuelve una cadena', () => {
    const newBook = new Book(booksFixture[0])
    expect(typeof newBook.toString()).toBe('string')
  })
})