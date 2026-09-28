import './style.css'
import batoiLogo from './assets/logoBatoi.png'
import data from './services/datos.js'
import * as f from './functions.js'


document.querySelector('#app').innerHTML = `
<section id="center">
  <div class="hero">
    <img src="${batoiLogo}" class="base" width="200" height="200">
    <h1>BatoiBooks</h1>
    <h2>Abre la consola para ver el resultado</h2>
  </div>
</section>
`


const { books } = data


console.log('=== Books ofuuser 4 ===')
console.log(f.booksFromUser(books, 4))

console.log('\n=== Módule 5021 en estara "good" ===')
const fromModule = f.booksFromModule(books, '5021')
console.log(f.booksWithStatus(fromModule, 'good'))

console.log('\n=== Precios +10% ===')
console.log(f.incrementPriceOfBooks(books, 10))

console.log('\n=== pruebas de no se cambia  ===')
console.log('Precio del libro 7:', books.find(b => b.id === 7).price)
