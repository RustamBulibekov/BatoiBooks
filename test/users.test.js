import { describe, it, expect, beforeAll, afterEach, afterAll, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../src/mocks/server'
import Users from '../src/model/users.class'
import User from '../src/model/user.class'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Users — persistencia', () => {
  let users

  beforeEach(async () => {
    users = new Users()
    await users.fetchAll()
  })

  it('fetchAll carga usuarios', () => {
    expect(users.data.length).toBe(2)
    expect(users.data[0]).toBeInstanceOf(User)
  })

  it('addUser añade y devuelve usuario', async () => {
    const nuevo = await users.addUser({ nick: 'test', email: 'test@x.com', password: '1234' })
    expect(nuevo.id).toBeDefined()
    expect(users.data.length).toBe(3)
  })

  it('addUser rechaza si falla el servidor', async () => {
    server.use(http.post('http://localhost:3000/users', () => new HttpResponse(null, { status: 500 })))
    await expect(users.addUser({ nick: 'test' })).rejects.toThrow()
    expect(users.data.length).toBe(2)
  })

  it('removeUser elimina del servidor y de data', async () => {
    const id = users.data[0].id
    await users.removeUser(id)
    expect(users.data.length).toBe(1)
  })

  it('removeUser rechaza y NO borra si falla', async () => {
    server.use(http.delete('http://localhost:3000/users/:id', () => new HttpResponse(null, { status: 404 })))
    const id = users.data[0].id
    await expect(users.removeUser(id)).rejects.toThrow()
    expect(users.data.length).toBe(2)
  })
})