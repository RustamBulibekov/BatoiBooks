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


    export default class Book{

        constructor(id,userId,moduleCode,publicher,price,pages,status,photo='', comments='',solDate=''){
            this.id=id;
            this.userId = userId;
            this.moduleCode = moduleCode;
            this.publicher = publicher;
            this.price=price;
            this.pages=pages;

        }

        toString(){
            return "ID: "+ this.id + "Published: " + this.publicher + "Price "+ this.price
        }
    }
    