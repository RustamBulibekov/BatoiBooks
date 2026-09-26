import './style.css'
import batoiLogo from './assets/logoBatoi.png'
import data from './/services/datos.js'
import * as f from './functions.js'

// 1. Render de la página
document.querySelector('#app').innerHTML = `
<section id="center">
  <div class="hero">
    <img src="${batoiLogo}" class="base" width="200" height="200">
    <h1>BatoiBooks</h1>
    <h2>Abre la consola para ver el resultado</h2>
  </div>
</section>
`

// 2. Datos
const { books } = data

// 3. Salidas por consola
console.log('=== Libros del usuario 4 ===')
console.log(f.booksFromUser(books, 4))

console.log('\n=== Módulo 5021 en estado "good" ===')
const fromModule = f.booksFromModule(books, '5021')
console.log(f.booksWithStatus(fromModule, 'good'))

console.log('\n=== Precios +10% ===')
console.log(f.incrementPriceOfbooks(books, 10))

console.log('\n=== Comprobación de no-mutación ===')
console.log('Precio original del libro 7:', books.find(b => b.id === 7).price)
// Debe mostrar 15, NO 16.5