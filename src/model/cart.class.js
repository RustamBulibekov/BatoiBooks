export default class Cart {
    constructor() {
        this.items = [];
    }

    add(book) {
        if (book.soldDate) return false;
        if (this.items.some(b => b.id === book.id)) return false;
        this.items.push({ ...book });
        return true;
    }

    count() {
        return this.items.length;
    }
}