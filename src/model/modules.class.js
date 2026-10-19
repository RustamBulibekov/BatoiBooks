import Module from './module.class'
import { fetchModules } from '../services/api'

export default class Modules {
  constructor() {
    this.data = []
  }


  async fetchAll() {
    const modulesArray = await fetchModules()
    this.data = modulesArray.map(m => new Module(m))
  }



  getModuleByCode(code) {
    const module = this.data.find(m => m.code === code)
    if (!module) throw new Error(`No existe el módulo con código ${code}`)
    return module
  }

  toString() {
    return this.data.map(m => m.toString()).join('\n')
  }
}