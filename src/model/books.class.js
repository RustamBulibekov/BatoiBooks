import Book from './book.class'
import { fetchBooks, createBook, deleteBook, updateBook, checkBookExists } from '../services/api'

export default class Books {
  constructor() {
    this.data = []
  }

  async fetchAll() {
    const data = await fetchBooks()
    this.data = data.map(b => new Book(b))
  }

  async addBook(bookData) {
    const newId = this.data.length > 0 ? Math.max(...this.data.map(b => b.id)) + 1 : 1
    const created = await createBook({ ...bookData, id: newId })
    const newBook = new Book(created)
    this.data.push(newBook)
    return newBook
  }

  async removeBook(bookId) {
    const index = this.getBookIndexById(bookId)
    await deleteBook(bookId)
    this.data.splice(index, 1)
  }

  async changeBook(bookData) {
    const index = this.getBookIndexById(bookData.id)
    const updated = await updateBook(bookData.id, bookData)
    const updatedBook = new Book(updated)
    this.data[index] = updatedBook
    return updatedBook
  }

  // ВАЛИДАЦИЯ: Асинхронный метод
  async bookExists(userId, moduleCode) {
    return await checkBookExists(userId, moduleCode)
  }

  // Consultas síncronas en memoria
  getBookIndexById(bookId) {
    const index = this.data.findIndex(b => b.id === bookId)
    if (index === -1) throw new Error(`No existe el libro con id ${bookId}`)
    return index
  }

  getBookById(bookId) {
    return this.data[this.getBookIndexById(bookId)]
  }

  bookExistsInMemory(bookId) {
    return this.data.some(b => b.id === bookId)
  }

  booksFromUser(userId) { return this.data.filter(b => b.userId === userId) }
  booksFromModule(moduleCode) { return this.data.filter(b => b.moduleCode === moduleCode) }
  booksCheeperThan(price) { return this.data.filter(b => b.price <= price) }
  booksWithStatus(status) { return this.data.filter(b => b.status === status) }
  averagePriceOfBooks() {
    if (this.data.length === 0) return '0.00 €'
    const total = this.data.reduce((sum, b) => sum + b.price, 0)
    return `${(total / this.data.length).toFixed(2)} €`
  }
  booksOfTypeNotes() { return this.data.filter(b => b.publisher === 'Apunts') }
  booksNotSold() { return this.data.filter(b => !b.soldDate) }
  toString() { return this.data.map(b => b.toString()).join('\n') }
}