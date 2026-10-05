import Book from './book.class'

export default class Books {
  constructor() {
    this.data = []
  }

  populate(booksArray) {
    this.data = booksArray.map(b => new Book(b))
  }

  addBook(bookData) {
    const newId = this.data.length > 0
      ? Math.max(...this.data.map(b => b.id)) + 1
      : 1
    const newBook = new Book({ ...bookData, id: newId })
    this.data.push(newBook)
    return newBook
  }

  removeBook(bookId) {
    const index = this.data.findIndex(b => b.id === bookId)
    if (index === -1) throw new Error(`No existe el libro con id ${bookId}`)
    this.data.splice(index, 1)
  }

  changeBook(bookData) {
    const index = this.data.findIndex(b => b.id === bookData.id)
    if (index === -1) throw new Error(`No existe el libro con id ${bookData.id}`)
    const updatedBook = new Book(bookData)
    this.data[index] = updatedBook
    return updatedBook
  }

  toString() {
    return this.data.map(b => b.toString()).join('\n')
  }

  // ===== consultas heredadas de la práctica 2 =====
  getBookById(bookId) {
    const book = this.data.find(b => b.id === bookId)
    if (!book) throw new Error(`No existe el libro con id ${bookId}`)
    return book
  }

  getBookIndexById(bookId) {
    const index = this.data.findIndex(b => b.id === bookId)
    if (index === -1) throw new Error(`No existe el libro con id ${bookId}`)
    return index
  }

  bookExists(bookId) {
    return this.data.some(b => b.id === bookId)
  }

  booksFromUser(userId) {
    return this.data.filter(b => b.userId === userId)
  }

  booksFromModule(moduleCode) {
    return this.data.filter(b => b.moduleCode === moduleCode)
  }

  booksCheeperThan(price) {
    return this.data.filter(b => b.price <= price)
  }

  booksWithStatus(status) {
    return this.data.filter(b => b.status === status)
  }

  averagePriceOfBooks() {
    if (this.data.length === 0) return '0.00 €'
    const total = this.data.reduce((sum, b) => sum + b.price, 0)
    return `${(total / this.data.length).toFixed(2)} €`
  }

  booksOfTypeNotes() {
    return this.data.filter(b => b.publisher === 'Apunts')
  }

  booksNotSold() {
    return this.data.filter(b => !b.soldDate)
  }

  incrementPriceOfBooks(percent) {
    return this.data.map(b => new Book({
      ...b,
      price: +(b.price * (1 + percent / 100)).toFixed(2)
    }))
  }
}