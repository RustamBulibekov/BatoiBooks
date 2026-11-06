// @vitest-environment jsdom
import { test, expect } from 'vitest'
import { loadApp, card, BOOKS } from './helpers.js'

test('Muestra "Vendido el ..." para un libro con soldDate', async () => {
  
    await loadApp({ books: [{ ...BOOKS[0], soldDate: '2023-02-01' }] })

    
    expect(card(1).textContent).toContain('Vendido el 01/02/2023')
})