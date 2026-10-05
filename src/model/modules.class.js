import Module from './module.class'

export default class Modules {
  constructor() {
    this.data = []
  }

  populate(modulesArray) {
    this.data = modulesArray.map(m => new Module(m))
  }

  toString() {
    return this.data.map(m => m.toString()).join('\n')
  }

  getModuleByCode(code) {
    const module = this.data.find(m => m.code === code)
    if (!module) throw new Error(`No existe el módulo con código ${code}`)
    return module
  }
}