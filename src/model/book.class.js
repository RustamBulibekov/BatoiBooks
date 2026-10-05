///"books": [
    //{
    //   "id": 1,
    //   "userId": 2,
    //   "moduleCode": "5025",
    //   "publisher": "Apunts",
    //   "price": 12,
    //   "pages": 25,
    //   "status": "good",
    //   "photo": "",
    //   "comments": "",
    //   "soldDate": "2023-02-01"
    // },

export default class Book {
  constructor({ id, userId, moduleCode, publisher, price, pages, status, photo = '', comments = '', soldDate = '' }) {
    this.id = id
    this.userId = userId
    this.moduleCode = moduleCode
    this.publisher = publisher
    this.price = price
    this.pages = pages
    this.status = status
    this.photo = photo
    this.comments = comments
    this.soldDate = soldDate
  }

  toString() {
    return `[${this.id}] ${this.publisher} - ${this.status} - ${this.price}€`
  }
}
