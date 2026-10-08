import { describe, it, expect } from 'vitest'
import User from '../src/model/user.class'

const usersFixture = [
  { id: 2, email: 'ignasi.gomis@gmail.com', nick: 'Ignasi', password: '1234' },
  { id: 4, email: 'marta@gmail.lan', nick: 'Marta', password: '1234' }
]

describe('Clase User', () => {
  it('constructor crea un usuario con todos los campos', () => {
    const newUser = new User(usersFixture[0])
    expect(newUser).toBeInstanceOf(User)
    expect(newUser).toEqual(usersFixture[0])
  })

  it('constructor asigna correctamente cada campo', () => {
    const newUser = new User(usersFixture[1])
    expect(newUser.id).toBe(4)
    expect(newUser.nick).toBe('Marta')
    expect(newUser.email).toBe('marta@gmail.lan')
    expect(newUser.password).toBe('1234')
  })

  it('toString contiene id y nick', () => {
    const newUser = new User(usersFixture[0])
    const texto = newUser.toString()
    expect(texto).toContain(String(usersFixture[0].id))
    expect(texto).toContain(usersFixture[0].nick)
  })

  it('toString devuelve una cadena', () => {
    const newUser = new User(usersFixture[0])
    expect(typeof newUser.toString()).toBe('string')
  })
})