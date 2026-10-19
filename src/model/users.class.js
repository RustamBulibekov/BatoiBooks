import User from './user.class'
import { fetchUsers, createUser, deleteUser, updateUser } from '../services/api'

export default class Users {
  constructor() {
    this.data = []
  }

  async fetchAll() {
    const usersArray = await fetchUsers()
    this.data = usersArray.map(u => new User(u))
  }

  async addUser(userData) {
    const newId = this.data.length > 0
      ? Math.max(...this.data.map(u => u.id)) + 1
      : 1

    const created = await createUser({ ...userData, id: newId })
    const newUser = new User(created)
    this.data.push(newUser)
    return newUser
  }

  async removeUser(userId) {
 
    const index = this.getUserIndexById(userId)


    await deleteUser(userId)

  
    this.data.splice(index, 1)
  }

  async changeUser(userData) {
    const index = this.getUserIndexById(userData.id)

    const updated = await updateUser(userData.id, userData)
    const updatedUser = new User(updated)

    this.data[index] = updatedUser
    return updatedUser
  }



  getUserIndexById(userId) {
    const index = this.data.findIndex(u => u.id === userId)
    if (index === -1) throw new Error(`No existe el usuario con id ${userId}`)
    return index
  }

  getUserById(userId) {
    return this.data[this.getUserIndexById(userId)]
  }

  getUserByNickName(nick) {
    const user = this.data.find(u => u.nick === nick)
    if (!user) throw new Error(`No existe el usuario con nick ${nick}`)
    return user
  }

  toString() {
    return this.data.map(u => u.toString()).join('\n')
  }
}