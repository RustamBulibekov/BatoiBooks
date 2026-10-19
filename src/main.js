import './style.css'
import batoiLogo from './assets/logoBatoi.png'

import Books from './model/books.class.js'
import Users from './model/users.class.js'
import Modules from './model/modules.class.js'


document.querySelector('#app').innerHTML = `
<section id="center">
  <div class="hero">
    <img src="${batoiLogo}" class="base" width="200" height="200">
    <h1>BatoiBooks</h1>
    <h2>Abre la consola para ver el resultado</h2>
  </div>
</section>
`


async function init() {
  try {
    const books = new Books()
    const users = new Users()
    const modules = new Modules()

    // 1. Cargar todo
    await books.fetchAll()
    await users.fetchAll()
    await modules.fetchAll()
    console.log(`Cargados: ${modules.data.length} módulos, ${users.data.length} usuarios, ${books.data.length} libros.`)

    // 2. Añadir usuario prueba
    const nuevoUser = await users.addUser({ nick: 'prueba', email: 'prueba@example.com', password: '1234' })
    console.log('Usuario devuelto:', nuevoUser)
    console.log(`Ahora hay ${users.data.length} usuarios.`)

    // 3. Borrar el usuario prueba
    await users.removeUser(nuevoUser.id)
    console.log(`Usuario borrado. Ahora hay ${users.data.length} usuarios.`)

  } catch (error) {
    console.error('Error en la operación:', error.message)
  }
}

init()