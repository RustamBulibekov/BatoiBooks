const BASE_URL = 'http://localhost:3000'

// ================= BOOKS =================
export async function fetchBooks() {
    const res = await fetch(`${BASE_URL}/books`)
    if (!res.ok) throw new Error(`Error ${res.status}: fallo al cargar libros`)
    return res.json()
}

export async function createBook(bookData) {
    const res = await fetch(`${BASE_URL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData)
    })
    if (!res.ok) throw new Error(`Error ${res.status}: fallo al crear libro`)
    return res.json()
}

export async function deleteBook(id) {
    const res = await fetch(`${BASE_URL}/books/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`Error ${res.status}: fallo al borrar libro`)
    return res.json()
}

export async function updateBook(id, bookData) {
    const res = await fetch(`${BASE_URL}/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData)
    })
    if (!res.ok) throw new Error(`Error ${res.status}: fallo al actualizar libro`)
    return res.json()
}

// ================= USERS =================
export async function fetchUsers() {
    const res = await fetch(`${BASE_URL}/users`)
    if (!res.ok) throw new Error(`Error ${res.status}: fallo al cargar usuarios`)
    return res.json()
}

export async function createUser(userData) {
    const res = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    })
    if (!res.ok) throw new Error(`Error ${res.status}: fallo al crear usuario`)
    return res.json()
}

export async function deleteUser(id) {
    const res = await fetch(`${BASE_URL}/users/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`Error ${res.status}: fallo al borrar usuario`)
    return res.json()
}

export async function updateUser(id, userData) {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    })
    if (!res.ok) throw new Error(`Error ${res.status}: fallo al actualizar usuario`)
    return res.json()
}

// ================= MODELS =================
export async function fetchModules() {
    const res = await fetch(`${BASE_URL}/modules`)
    if (!res.ok) throw new Error(`Error ${res.status}: fallo al cargar modulos`)
    return res.json()
}