// src/mocks/handlers.js
// SE TE DA HECHO — infraestructura, no forma parte del aprendizaje de esta práctica.
// No hace falta que entiendas esto línea a línea, pero sí que sepas qué hace:
// cada elemento de esta lista intercepta una URL y un método HTTP concretos
// y devuelve una respuesta simulada, sin que haga falta tener json-server
// arrancado de verdad.
import { http, HttpResponse } from 'msw'

const API_URL = 'http://localhost:3000'

// Datos de prueba propios de los mocks. NO importan datos.js: en esta
// práctica ese fichero se borra, y aunque no se borrara, los tests no
// deben depender de datos que pueden cambiar.
const data = {
    books: [
        { id: 1, userId: 4, moduleCode: '5021', publisher: 'Apunts', price: 10, pages: 20, status: 'good', photo: '', comments: '', soldDate: '' },
        { id: 2, userId: 2, moduleCode: '5025', publisher: 'McGraw-Hill', price: 25, pages: 200, status: 'new', photo: '', comments: '', soldDate: '2023-01-01' },
    ],
    users: [
        { id: 2, nick: 'Ignasi', email: 'ignasi@x.com', password: '1234' },
        { id: 4, nick: 'Maria', email: 'maria@x.com', password: '1234' },
    ],
    modules: [
        { code: '5021', cliteral: 'Módulo A', vliteral: 'Mòdul A', courseId: '39' },
        { code: '5025', cliteral: 'Módulo B', vliteral: 'Mòdul B', courseId: '39' },
    ],
}

export const handlers = [
    http.get(`${API_URL}/users`, () => HttpResponse.json(data.users)),

    http.get(`${API_URL}/modules`, () => HttpResponse.json(data.modules)),

    http.get(`${API_URL}/books`, () => {
        return HttpResponse.json(data.books)
    }),

    http.get(`${API_URL}/books/:id`, ({ params }) => {
        const book = data.books.find(b => b.id === Number(params.id))
        if (!book) {
            return new HttpResponse(null, { status: 404 })
        }
        return HttpResponse.json(book)
    }),

    http.post(`${API_URL}/books`, async ({ request }) => {
        const newBook = await request.json()
        return HttpResponse.json({ ...newBook, id: 999 }, { status: 201 })
    }),

    http.patch(`${API_URL}/books/:id`, async ({ request, params }) => {
        const changes = await request.json()
        return HttpResponse.json({ id: Number(params.id), ...changes })
    }),

    // PUT y PATCH: el enunciado no fija cuál usar al modificar, y json-server admite los dos
    http.put(`${API_URL}/books/:id`, async ({ request, params }) => {
        const changes = await request.json()
        return HttpResponse.json({ id: Number(params.id), ...changes })
    }),

    http.delete(`${API_URL}/books/:id`, () => {
        // json-server devuelve un JSON también al borrar: con un cuerpo vacío, quien haga
        // response.json() fallaría solo con este mock y no con el servidor real
        return HttpResponse.json({})
    }),

    // Escritura de users (addUser, changeUser, removeUser)
    http.post(`${API_URL}/users`, async ({ request }) => {
        const newUser = await request.json()
        return HttpResponse.json({ ...newUser, id: 999 }, { status: 201 })
    }),

    http.patch(`${API_URL}/users/:id`, async ({ request, params }) => {
        const changes = await request.json()
        return HttpResponse.json({ id: Number(params.id), ...changes })
    }),

    http.put(`${API_URL}/users/:id`, async ({ request, params }) => {
        const changes = await request.json()
        return HttpResponse.json({ id: Number(params.id), ...changes })
    }),

    http.delete(`${API_URL}/users/:id`, () => {
        // json-server devuelve un JSON también al borrar: con un cuerpo vacío, quien haga
        // response.json() fallaría solo con este mock y no con el servidor real
        return HttpResponse.json({})
    }),
]