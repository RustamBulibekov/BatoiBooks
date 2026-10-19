import './style.css'
import batoiLogo from './assets/logoBatoi.png'

import Books from './model/books.class.js'
import Users from './model/users.class.js'
import Modules from './model/modules.class.js'
import {fetchBooks, fetchModels, fetchUsers} from  './services/api.js'
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


const res1 = fetchBooks();
console.log(res1)