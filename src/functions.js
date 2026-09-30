


export function getBookById(books, bookId) {
  const book = books.find(b => b.id === bookId)
  if (!book) throw new Error(`No existe el libro con id ${bookId}`)
  return book
}

export function getBookIndexById(books, bookId) {
  const index = books.findIndex(b => b.id === bookId)
  if (index === -1) throw new Error(`No existe el libro con id ${bookId}`)
  return index
}
 
export function booksFromUser(books, userId) {
return books.filter(b => b.userId === userId)
}

export function booksFromModule(books, moduleCode) {
return books.filter(b => b.moduleCode === moduleCode)
}

export function booksCheeperThan(books, price) {
return books.filter(b => b.price <= price)
}

export function booksWithStatus(books, status) {
return books.filter(b => b.status === status)
}

export function averagePriceOfBooks(books) {
if (books.length === 0) return '0.00 €'
const total = books.reduce((sum, b) => sum + b.price, 0)
const avg = total / books.length
return `${avg.toFixed(2)} €`
}

export function booksOfTypeNotes(books) {
return books.filter(b => b.publisher === 'Apunts')
}

export function bookExists(books, bookId) {
return books.some(b => b.id === bookId)
}

export function booksNotSold(books) {
return books.filter(b => !b.soldDate)
}

export function incrementPriceOfBooks(books, percent) {
return books.map(b => ({
...b,
price: +(b.price * (1 + percent / 100)).toFixed(2)
}))
}

// ========== USERS ==========

export function getUserById(users, userId) {
const user = users.find(u => u.id === userId)
if (!user) throw new Error(`No existe el usuario con id ${userId}`)
return user
}

export function getUserIndexById(users, userId) {
const index = users.findIndex(u => u.id === userId)
if (index === -1) throw new Error(`No existe el usuario con id ${userId}`)
return index
}

export function getUserByNickName(users, nick) {
const user = users.find(u => u.nick === nick)
if (!user) throw new Error(`No existe el usuario con nick ${nick}`)
return user
}

// ========== MODULES ==========

export function getModuleByCode(modules, code) {
const module = modules.find(m => m.code === code)
if (!module) throw new Error(`No existe el módulo con código ${code}`)
return module
}




