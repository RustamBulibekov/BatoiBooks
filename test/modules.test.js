import { describe, it, expect, beforeEach } from 'vitest'
import Modules from '../src/model/modules.class'
import Module from '../src/model/module.class'

const modulesFixture = [
  { code: '5021', cliteral: 'Incidentes de ciberseguridad', vliteral: 'Incidents de ciberseguretat', courseId: '59' },
  { code: '0011', cliteral: 'Didáctica de la educación infantil', vliteral: "Didàctica de l'educación infantil", courseId: '39' },
  { code: '0222', cliteral: 'Sistemas operativos monopuesto', vliteral: 'Sistemes operatius monolloc', courseId: '24' }
]

describe('Clase Modules', () => {
  let modules

  beforeEach(() => {
    modules = new Modules()
    modules.populate(modulesFixture)
  })

  // ========== CONSTRUCTOR / POPULATE ==========
  it('constructor inicializa data como array vacío', () => {
    const empty = new Modules()
    expect(empty.data).toEqual([])
  })

  it('populate carga instancias de Module', () => {
    expect(modules.data.length).toBe(3)
    expect(modules.data[0]).toBeInstanceOf(Module)
    expect(modules.data.every(m => m instanceof Module)).toBe(true)
  })

  // ========== getModuleByCode ==========
  it('getModuleByCode devuelve el módulo correcto', () => {
    const modulo = modules.getModuleByCode('5021')
    expect(modulo.code).toBe('5021')
    expect(modulo.cliteral).toBe('Incidentes de ciberseguridad')
  })

  it('getModuleByCode lanza error si no existe', () => {
    expect(() => modules.getModuleByCode('9999')).toThrow()
  })

  it('getModuleByCode devuelve instancia de Module', () => {
    expect(modules.getModuleByCode('0011')).toBeInstanceOf(Module)
  })

  // ========== toString ==========
  it('toString devuelve una cadena con todos los módulos', () => {
    const texto = modules.toString()
    expect(typeof texto).toBe('string')
    expect(texto).toContain('5021')
    expect(texto).toContain('0011')
  })
})