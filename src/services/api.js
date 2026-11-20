const BASE_URL = 'http://localhost:3000'

// ========== BOOKS ==========
export async function fetchBooks() {
    const res = await fetch(`${BASE_URL}/books`)
    if (!res.ok) throw new Error(`Error ${res.status}: no se pudieron cargar los libros`)
    return res.json()
}

export async function createBook(bookData) {
    const res = await fetch(`${BASE_URL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData)
    })
    if (!res.ok) throw new Error(`Error ${res.status}: no se pudo crear el libro`)
    return res.json()
}

export async function deleteBook(bookId) {
    const res = await fetch(`${BASE_URL}/books/${bookId}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`Error ${res.status}: no se pudo borrar el libro`)
    return res.json()
}

export async function updateBook(bookId, bookData) {
    const res = await fetch(`${BASE_URL}/books/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData)
    })
    if (!res.ok) throw new Error(`Error ${res.status}: no se pudo modificar el libro`)
    return res.json()
}

// ВАЛИДАЦИЯ: Проверяем, есть ли у пользователя книга этого модуля
export async function checkBookExists(userId, moduleCode) {
    const res = await fetch(`${BASE_URL}/books?userId=${userId}&moduleCode=${moduleCode}`)
    if (!res.ok) throw new Error(`Error ${res.status}: no se pudo comprobar el módulo`)
    const data = await res.json()
    return data.length > 0
}

// ========== USERS ==========
export async function fetchUsers() {
    const res = await fetch(`${BASE_URL}/users`)
    if (!res.ok) throw new Error(`Error ${res.status}`)
    return res.json()
}

// ========== MODULES ==========
export async function fetchModules() {
    const res = await fetch(`${BASE_URL}/modules`)
    if (!res.ok) throw new Error(`Error ${res.status}`)
    return res.json()
}