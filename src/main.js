import './style.css'
import batoiLogo from './assets/logoBatoi.png'
import data from './services/datos.js'
import Books from './model/books.class.js'
import Users from './model/users.class.js'
import Modules from './model/modules.class.js'

// 1. Render
document.querySelector('#app').innerHTML = `
<section id="center">
  <div class="hero">
    <img src="${batoiLogo}" class="base" width="200" height="200">
    <h1>BatoiBooks</h1>
    <h2>Abre la consola para ver el resultado</h2>
  </div>
</section>
`

// 2. Crear instancias y rellenar
const books = new Books()
const users = new Users()
const modules = new Modules()

books.populate(data.books)
users.populate(data.users)
modules.populate(data.modules)

// 3. Salidas por consola
console.log('=== Libros del módulo 5021 ===')
console.log(books.booksFromModule('5021'))

console.log('\n=== Libros en estado "new" ===')
console.log(books.booksWithStatus('new'))

console.log('\n=== Precios +10% ===')
console.log(books.incrementPriceOfBooks(10))