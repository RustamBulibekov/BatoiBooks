import './style.css'
import batoiLogo from './assets/logoBatoi.png'
import View from './view/view.class.js'
import Controller from './controller/controller.class.js'

document.addEventListener('DOMContentLoaded', () => {
  const view = new View()
  view.renderPage(batoiLogo) // <--- ВОТ ЭТА СТРОКА СОЗДАЕТ HTML!
  const controller = new Controller(view)
  controller.init()
})