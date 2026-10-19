import { describe, it, expect, beforeAll, afterEach, afterAll, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../src/mocks/server'
import Modules from '../src/model/modules.class'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Modules — persistencia', () => {
    let modules

    beforeEach(async () => {
        modules = new Modules()
        await modules.fetchAll()
    })

    it('fetchAll carga los módulos del servidor', () => {
        expect(modules.data.length).toBe(2)
    })

    it('fetchAll rechaza si el servidor falla', async () => {
        server.use(http.get('http://localhost:3000/modules', () => new HttpResponse(null, { status: 500 })))
        const empty = new Modules()
        await expect(empty.fetchAll()).rejects.toThrow()
        expect(empty.data).toHaveLength(0)
    })

    it('getModuleByCode devuelve el módulo', () => {
        const mod = modules.getModuleByCode('5021')
        expect(mod.cliteral).toBe('Módulo A')
    })
})