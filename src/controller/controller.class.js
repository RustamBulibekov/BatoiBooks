export default class Controller {
    constructor(view, books, modules) {
        this.view = view
        this.books = books
        this.modules = modules
        this.USER_ID = 2
    }


    async init() {
        try {
            await this.modules.fetchAll()
            await this.books.fetchAll()

            this.view.renderModules(this.modules.data)
            this.books.data.forEach(book => {
                const mod = this.modules.data.find(m => m.code === book.moduleCode)
                this.view.renderBook(book, mod ? mod.cliteral : book.moduleCode)
            })
        } catch (err) {
            this.view.addMessage('Error al cargar los datos', 'error')
        }

        // Связываем View с Controller (используем bind, чтобы this указывал на контроллер)
        this.view.bindSubmitForm(this.handleAddBook.bind(this))
        this.view.bindClickRemove(this.handleRemoveBook.bind(this))
    }
    async handleAddBook(bookData, formElement) {
        bookData.userId = this.USER_ID
        try {
            const newBook = await this.books.addBook(bookData)
            const mod = this.modules.data.find(m => m.code === newBook.moduleCode)
            this.view.renderBook(newBook, mod ? mod.cliteral : newBook.moduleCode)
            this.view.addMessage('Libro añadido correctamente', 'info')
            this.view.resetForm()
        } catch (err) {
            this.view.addMessage('Error al añadir libro', 'error')
        }
    }

    async handleRemoveBook(bookId) {
        if (!bookId) return
        try {
            await this.books.removeBook(bookId)
            this.view.removeBookCard(bookId)
            this.view.addMessage('Libro eliminado correctamente', 'info')
            this.view.clearRemoveInput()
        } catch (err) {
            this.view.addMessage('No se pudo borrar el libro', 'error')
        }
    }




}