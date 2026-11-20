import Books from '../model/books.class.js'
import Modules from '../model/modules.class.js'
import Cart from '../model/cart.class.js'

export default class Controller {
    constructor(view) {
        this.view = view
        this.books = new Books()
        this.modules = new Modules()
        this.cart = new Cart()
        this.USER_ID = 2
    }

    async init() {
        try {
            await this.modules.fetchAll()
            await this.books.fetchAll()

            this.view.renderModules(this.modules.data)
            this.renderList()

            this.view.bindSubmitForm((data) => this.handleSave(data))
            this.view.bindInputChanges()

            this.view.bindModuleChange(async (moduleCode, currentId) => {
                this.view.setModuleError('');
                if (!moduleCode) return;

                try {
                    const exists = await this.books.bookExists(this.USER_ID, moduleCode);

                    if (exists) {
                        // Если мы редактируем ту же самую книгу, не считаем это дубликатом
                        if (currentId) {
                            // Безопасно ищем книгу в локальном массиве (без выброса ошибки)
                            const currentBook = this.books.data.find(b => b.id === Number(currentId));
                            if (currentBook && currentBook.moduleCode === moduleCode) return;
                        }
                        this.view.setModuleError('Ya tienes un libro de este módulo');
                    }
                } catch (err) {
                    this.view.addMessage('No se pudo comprobar el módulo', 'error');
                }
                
            });

            this.view.bindListActions(
                (id) => { window.location.hash = `#edit/${id}` },
                (id) => this.handleDelete(id),
                (id) => this.handleAddToCart(id)
            )

            window.addEventListener('hashchange', () => this.handleRoute())
            this.handleRoute()
            this.view.bindResetForm(() => { window.location.hash = '#form'; });
            
        } catch (err) {
            this.view.addMessage('Error al cargar los datos', 'error')
        }
    }

    handleRoute() {
        const hash = window.location.hash || '#list';
        const [route, id] = hash.split('/');
        this.view.hideAllPages();
        this.view.clearErrors();

        if (route === '#list') {
            this.view.showPage('list');
        } else if (route === '#form') {
            this.view.showPage('form', 'Añadir libro');
            this.view.setFormMode('add');
        } else if (route === '#about') {
            this.view.showPage('about');
        } else if (route === '#edit' && id) {
            // ВОТ ИСПРАВЛЕНИЕ: используем .find() вместо getBookById(), чтобы не было throw
            const book = this.books.data.find(b => b.id === Number(id));

            if (!book) {
                this.view.showPage('not-found');
            }
            else if (book.userId !== this.USER_ID) {
                this.view.addMessage('No puedes editar este libro', 'error');
                window.location.hash = '#list';
            } else {
                this.view.showPage('form', 'Editar libro');
                this.view.setFormMode('edit');
                this.view.fillForm(book);
            }
        } else {
            this.view.showPage('not-found');
        }
    }

    renderList() {
        this.view.clearList()
        this.books.data.forEach(book => {
            const mod = this.modules.data.find(m => m.code === book.moduleCode)
            this.view.renderBook(book, mod ? mod.cliteral : book.moduleCode, this.USER_ID)
        })
    }

    async handleSave(bookData) {
        const isEditing = bookData.id !== undefined;
        try {
            if (isEditing) {
                const oldBook = this.books.data.find(b => b.id === bookData.id);
                bookData.userId = oldBook.userId;
                bookData.soldDate = oldBook.soldDate;
                await this.books.changeBook(bookData);
                this.view.addMessage('Libro modificado', 'info');
            } else {
                bookData.userId = this.USER_ID;
                await this.books.addBook(bookData);
                this.view.addMessage('Libro añadido', 'info');
            }
            window.location.hash = '#list';
            this.renderList();
        } catch (err) { this.view.addMessage('Error al guardar', 'error'); }
    }

    async handleDelete(id) {
        const book = this.books.data.find(b => b.id === id);
        const mod = this.modules.data.find(m => m.code === book.moduleCode);
        const name = mod ? mod.cliteral : book.moduleCode;
        if (confirm(`¿Seguro que quieres borrar el libro ${book.id} (${name})?`)) {
            try {
                await this.books.removeBook(id);
                this.renderList();
                this.view.addMessage('Libro borrado', 'info');
            } catch (err) { this.view.addMessage('Error al borrar', 'error'); }
        }
    }

    handleAddToCart(id) {
        const book = this.books.data.find(b => b.id === id);
        if (this.cart.add(book)) {
            this.view.updateCartCount(this.cart.count());
            console.log('Carrito:', this.cart.items);
            this.view.addMessage('Añadido al carrito', 'info');
        } else {
            this.view.addMessage('Ya está en el carrito o está vendido', 'error');
        }
    }
}