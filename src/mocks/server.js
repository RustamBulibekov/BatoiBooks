// src/mocks/server.js
// SE TE DA HECHO — infraestructura, no forma parte del aprendizaje de esta práctica.
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)