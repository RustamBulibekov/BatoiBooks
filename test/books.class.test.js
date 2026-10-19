// test/books.class.test.js

import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../src/mocks/server'
import Books from '../src/model/books.class'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Books — persistencia', () => {
    it('addBook crea un libro en el servidor y lo añade a this.data', async () => {
        const books = new Books()
        const nuevo = {
            userId: 2,
            moduleCode: 'ABCD',
            publisher: 'Apunts',
            price: 12,
            pages: 40,
            status: 'good'
        }
        const response = await books.addBook(nuevo)

        expect(response.id).toBeDefined()
        expect(response).toEqual({ photo: '', comments: '', soldDate: '', ...nuevo, id: response.id })

        expect(books.data).toHaveLength(1)
        expect(books.data[0].id).toBe(response.id)
    })
})