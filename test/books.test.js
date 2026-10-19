import { describe, it, expect, beforeAll, afterEach, afterAll, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../src/mocks/server'
import Books from '../src/model/books.class'
import Book from '../src/model/book.class'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Books — persistencia', () => {
  let books

  beforeEach(async () => {
    books = new Books()
    await books.fetchAll()
  })

  it('fetchAll carga libros', () => {
    expect(books.data.length).toBe(2)
    expect(books.data[0]).toBeInstanceOf(Book)
  })

  it('fetchAll rechaza si el servidor falla', async () => {
    server.use(http.get('http://localhost:3000/books', () => new HttpResponse(null, { status: 500 })))
    const emptyBooks = new Books()
    await expect(emptyBooks.fetchAll()).rejects.toThrow()
    expect(emptyBooks.data).toHaveLength(0)
  })

  it('removeBook elimina en servidor y en memoria', async () => {
    const id = books.data[0].id
    await books.removeBook(id)
    expect(books.bookExists(id)).toBe(false)
  })

  it('removeBook rechaza y NO modifica data si falla', async () => {
    server.use(http.delete('http://localhost:3000/books/:id', () => new HttpResponse(null, { status: 500 })))
    const id = books.data[0].id
    await expect(books.removeBook(id)).rejects.toThrow()
    expect(books.data.length).toBe(2)
  })
})