import { describe, it, expect, beforeEach } from 'vitest'
import Users from '../src/model/users.class'
import User from '../src/model/user.class'

const usersFixture = [
  { id: 2, email: 'ignasi.gomis@gmail.com', nick: 'Ignasi', password: '1234' },
  { id: 3, email: 'juanseguravasco@gmail.com', nick: 'Juan', password: '1234' },
  { id: 4, email: 'marta@gmail.lan', nick: 'Marta', password: '1234' }
]

describe('Clase Users', () => {
  let users

  beforeEach(() => {
    users = new Users()
    users.populate(usersFixture)
  })

  // ========== CONSTRUCTOR / POPULATE ==========
  it('constructor inicializa data como array vacío', () => {
    const empty = new Users()
    expect(empty.data).toEqual([])
  })

  it('populate carga instancias de User', () => {
    expect(users.data.length).toBe(3)
    expect(users.data[0]).toBeInstanceOf(User)
    expect(users.data.every(u => u instanceof User)).toBe(true)
  })

  // ========== addUser ==========
  it('addUser añade un usuario con id nuevo', () => {
    const nuevo = users.addUser({
      nick: 'Ximo', email: 'ximo@gmail.lan', password: '1234'
    })
    expect(nuevo).toBeInstanceOf(User)
    expect(nuevo.id).toBe(5)
    expect(users.data.length).toBe(4)
  })

  it('addUser genera id aunque se haya borrado uno intermedio', () => {
    users.removeUser(3)
    const nuevo = users.addUser({
      nick: 'Ximo', email: 'ximo@gmail.lan', password: '1234'
    })
    expect(nuevo.id).toBe(5)   // Math.max(2,4) + 1
  })

  // ========== removeUser ==========
  it('removeUser elimina el usuario', () => {
    users.removeUser(2)
    expect(users.data.length).toBe(2)
    
  })

  it('removeUser realmente elimina el usuario', () => {
    users.removeUser(2)
    expect(() => users.getUserById(2)).toThrow()
  })

  it('removeUser lanza error si no existe', () => {
    expect(() => users.removeUser(999)).toThrow()
    expect(users.data.length).toBe(3)
  })

  // ========== changeUser ==========
  it('changeUser sustituye y devuelve instancia de User', () => {
    const changed = users.changeUser({
      id: 3, nick: 'JuanModificado', email: 'juan@gmail.lan', password: '5678'
    })
    expect(changed).toBeInstanceOf(User)
    expect(changed.nick).toBe('JuanModificado')
    expect(users.getUserById(3).nick).toBe('JuanModificado')
  })

  it('changeUser lanza error si no existe', () => {
    expect(() => users.changeUser({ id: 999, nick: 'Fantasma' })).toThrow()
  })

  // ========== consultas ==========
  it('getUserById devuelve el usuario', () => {
    expect(users.getUserById(2).nick).toBe('Ignasi')
  })

  it('getUserById lanza error si no existe', () => {
    expect(() => users.getUserById(999)).toThrow()
  })

  it('getUserIndexById devuelve el índice correcto', () => {
    expect(users.getUserIndexById(4)).toBe(2)
  })

  it('getUserIndexById lanza error si no existe', () => {
    expect(() => users.getUserIndexById(999)).toThrow()
  })

  it('getUserByNickName devuelve el usuario por nick', () => {
    expect(users.getUserByNickName('Marta').id).toBe(4)
  })

  it('getUserByNickName lanza error si el nick no existe', () => {
    expect(() => users.getUserByNickName('NoExiste')).toThrow()
  })

  // ========== toString ==========
  it('toString devuelve una cadena con todos los usuarios', () => {
    const texto = users.toString()
    expect(typeof texto).toBe('string')
    expect(texto).toContain('Ignasi')
    expect(texto).toContain('Marta')
  })
})