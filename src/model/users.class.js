import User from './user.class'

export default class Users {
  constructor() {
    this.data = []
  }

  populate(usersArray) {
    this.data = usersArray.map(u => new User(u))
  }

  addUser(userData) {
    const newId = this.data.length > 0
      ? Math.max(...this.data.map(u => u.id)) + 1
      : 1
    const newUser = new User({ ...userData, id: newId })
    this.data.push(newUser)
    return newUser
  }

  removeUser(userId) {
    const index = this.data.findIndex(u => u.id === userId)
    if (index === -1) throw new Error(`No existe el usuario con id ${userId}`)
    this.data.splice(index, 1)
  }

  changeUser(userData) {
    const index = this.data.findIndex(u => u.id === userData.id)
    if (index === -1) throw new Error(`No existe el usuario con id ${userData.id}`)
    const updatedUser = new User(userData)
    this.data[index] = updatedUser
    return updatedUser
  }

  toString() {
    return this.data.map(u => u.toString()).join('\n')
  }

  getUserById(userId) {
    const user = this.data.find(u => u.id === userId)
    if (!user) throw new Error(`No existe el usuario con id ${userId}`)
    return user
  }

  getUserIndexById(userId) {
    const index = this.data.findIndex(u => u.id === userId)
    if (index === -1) throw new Error(`No existe el usuario con id ${userId}`)
    return index
  }

  getUserByNickName(nick) {
    const user = this.data.find(u => u.nick === nick)
    if (!user) throw new Error(`No existe el usuario con nick ${nick}`)
    return user
  }
}