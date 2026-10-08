import { describe, it, expect } from 'vitest'
import Module from '../src/model/module.class'

const modulesFixture = [
  { code: '5021', cliteral: 'Incidentes de ciberseguridad', vliteral: 'Incidents de ciberseguretat', courseId: '59' },
  { code: '0011', cliteral: 'Didáctica de la educación infantil', vliteral: "Didàctica de l'educación infantil", courseId: '39' }
]

describe('Clase Module', () => {
  it('constructor crea un módulo con todos los campos', () => {
    const newModule = new Module(modulesFixture[0])
    expect(newModule).toBeInstanceOf(Module)
    expect(newModule).toEqual(modulesFixture[0])
  })

  it('constructor asigna correctamente cada campo', () => {
    const newModule = new Module(modulesFixture[1])
    expect(newModule.code).toBe('0011')
    expect(newModule.cliteral).toBe('Didáctica de la educación infantil')
    expect(newModule.vliteral).toBe("Didàctica de l'educación infantil")
    expect(newModule.courseId).toBe('39')
  })

  it('toString contiene code y cliteral', () => {
    const newModule = new Module(modulesFixture[0])
    const texto = newModule.toString()
    expect(texto).toContain(modulesFixture[0].code)
    expect(texto).toContain(modulesFixture[0].cliteral)
  })

  it('toString devuelve una cadena', () => {
    const newModule = new Module(modulesFixture[0])
    expect(typeof newModule.toString()).toBe('string')
  })
})