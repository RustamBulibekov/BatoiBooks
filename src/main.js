import './style.css'
import batoiLogo from './assets/logoBatoi.png'
import Books from './model/books.class.js'
import Modules from './model/modules.class.js'
import View from './view/view.class.js'
import Controller from './controller/controller.class.js'

document.addEventListener('DOMContentLoaded', async () => {
  const view = new View()
  const books = new Books()
  const modules = new Modules()

  view.renderPage(batoiLogo)

  const controller = new Controller(view, books, modules)
  await controller.init()
})