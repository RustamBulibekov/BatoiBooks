import './style.css'
import batoiLogo from './assets/logoBatoi.png'
import Books from './model/books.class.js'
import Modules from './model/modules.class.js'

// 1. HTML-скелет
document.querySelector('#app').innerHTML = `
  <header>
    <img src="${batoiLogo}" width="80" alt="Logo">
    <h1>BatoiBooks</h1>
  </header>
  <nav>
    <ul>
      <li><a href="#list">Ver Libros</a></li>
      <li><a href="#form">Añadir Libro</a></li>
      <li><a href="#about">Acerca de...</a></li>
    </ul>
  </nav>
  <div id="messages"></div>
  
  <main>
    <div id="list"></div>
    
    <div id="remove">
      <label>ID del libro a borrar:</label>
      <input type="number" id="id-remove">
      <button id="remove-btn">Borrar</button>
    </div>

    <div id="form">
      <form id="bookForm">
        <input type="text" id="publisher" name="publisher" placeholder="Editorial" required>
        <input type="number" id="price" name="price" placeholder="Precio" required>
        <input type="number" id="pages" name="pages" placeholder="Páginas" required>
        
        <select id="moduleCode" name="moduleCode" required></select>
        
        <div>
          <label><input type="radio" name="status" value="new" required> Nuevo</label>
          <label><input type="radio" name="status" value="good"> Bueno</label>
          <label><input type="radio" name="status" value="used"> Usado</label>
          <label><input type="radio" name="status" value="bad"> Malo</label>
          <label><input type="radio" name="status" value="digital"> Digital</label>
        </div>
        
        <input type="text" id="photo" name="photo" placeholder="URL de la foto">
        <textarea id="comments" name="comments" placeholder="Comentarios"></textarea>
        
        <button type="submit">Guardar</button>
        <button type="reset">Reset</button>
      </form>
    </div>

    <div id="about"><p>Lorem ipsum...</p></div>
  </main>
  <footer>RUSTAM BULIBEKOV</footer>
`

// 2. Функция сообщений (с role="alert" для тестов)
function addMessages(text, type = 'info') {
  const messagesDiv = document.querySelector("#messages")
  const div = document.createElement('div')

  const bsClass = type === 'error' ? 'danger' : 'info'
  div.className = `alert alert-${bsClass}`
  div.setAttribute('role', 'alert') // Это проверяет тест!

  div.innerHTML = `
    ${text}
    <button type="button" class="btn-close" aria-label="Cerrar"></button>
  `

  div.querySelector('.btn-close').addEventListener('click', () => div.remove())
  messagesDiv.appendChild(div)

  if (type === 'info') {
    setTimeout(() => div.remove(), 3000)
  }
}

// 3. Функция отрисовки карточки (с форматированием даты)
function showAllBooks(book, moduleName) {
  const list = document.querySelector("#list")
  const div = document.createElement("div")
  div.className = "card"
  div.dataset.id = book.id

  // Форматируем дату из YYYY-MM-DD в DD/MM/YYYY
  let soldText = "En venta"
  if (book.soldDate) {
    const [year, month, day] = book.soldDate.split('-')
    soldText = `Vendido el ${day}/${month}/${year}`
  }

  // Если фото нет, ставим заглушку (чтобы не было битых картинок)
  const photoUrl = book.photo || 'https://via.placeholder.com/150'

  div.innerHTML = `
    <img src="${photoUrl}" alt="Libro: ${book.id}">
    <div>
      <h3>${moduleName} (${book.id})</h3>
      <h4>${book.publisher}</h4>
      <p>${book.pages} páginas</p>
      <p>Estado: ${book.status}</p>
      <p>${soldText}</p>
      <p>${book.comments}</p>
      <h4>${book.price} €</h4>
    </div>
  `
  list.appendChild(div)
}

// 4. Инициализация
const books = new Books()
const modules = new Modules()
const USER_ID = 2

async function init() {
  try {
    await modules.fetchAll()
    await books.fetchAll()

    const select = document.querySelector('#moduleCode')
    modules.data.forEach(m => {
      const opt = document.createElement('option')
      opt.value = m.code
      opt.textContent = m.cliteral
      select.appendChild(opt)
    })

    books.data.forEach(book => {
      const mod = modules.data.find(m => m.code === book.moduleCode)
      showAllBooks(book, mod ? mod.cliteral : book.moduleCode)
    })

  } catch (err) {
    addMessages('Error al cargar los datos', 'error')
  }
}

document.addEventListener('DOMContentLoaded', init)

// 5. Обработка добавления
document.querySelector('#bookForm').addEventListener('submit', async (e) => {
  e.preventDefault()

  const formData = new FormData(e.target)
  const bookData = {
    userId: USER_ID,
    publisher: formData.get('publisher'),
    price: Number(formData.get('price')),
    pages: Number(formData.get('pages')),
    moduleCode: formData.get('moduleCode'),
    status: formData.get('status'),
    photo: formData.get('photo') || '',
    comments: formData.get('comments') || ''
  }

  try {
    const newBook = await books.addBook(bookData)
    const mod = modules.data.find(m => m.code === newBook.moduleCode)
    showAllBooks(newBook, mod ? mod.cliteral : newBook.moduleCode)

    addMessages('Libro añadido correctamente', 'info')
    e.target.reset()

  } catch (err) {
    addMessages('Error al añadir libro', 'error')
  }
})

// 6. Обработка удаления
document.querySelector('#remove-btn').addEventListener('click', async () => {
  const idInput = document.querySelector('#id-remove').value
  const bookId = Number(idInput)

  if (!bookId) return // Если пусто, ничего не делаем

  try {
    await books.removeBook(bookId)

    const cardToRemove = document.querySelector(`.card[data-id="${bookId}"]`)
    if (cardToRemove) cardToRemove.remove()

    addMessages('Libro eliminado correctamente', 'info')
    document.querySelector('#id-remove').value = ''

  } catch (err) {
    addMessages('No se pudo borrar el libro (puede que no exista)', 'error')
  }
})