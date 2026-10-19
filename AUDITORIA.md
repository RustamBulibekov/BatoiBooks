# AUDITORÍA — Prácticas 3 y 4 (Clases y Persistencia)

---

# PARTE 1: Práctica 3 — Clases

En este documento se analizan tres métodos de la clase `Books` escritos de forma incorrecta según las restricciones de diseño del proyecto:
- No usar bucles `for` ni `while`.
- No mutar el array original sin control.
- No hardcodear valores.
- Validar los datos antes de crear/modificar.
- Lanzar excepción cuando el elemento no existe.

## 1. Método `removeBook(bookId)` (incorrecto)

```javascript
removeBook(bookId) {
  this.data = this.data.filter(b => b.id !== bookId)
}
```

### ¿Por qué está mal?
1. **No comprueba si el libro existe.** Si el `bookId` no está en la colección, el método **no hace nada y no avisa**. El enunciado pide explícitamente que **lance una excepción** si no existe.
2. **`filter` crea un array nuevo.** `this.data = ...` reemplaza la referencia del array. Cualquier otra parte del programa que tuviera una referencia al array original dejaría de ver los cambios. Es un **efecto secundario oculto**.
3. **No devuelve nada, pero tampoco informa.** El llamador no sabe si la operación tuvo efecto o no.

### Versión correcta

```javascript
removeBook(bookId) {
  const index = this.data.findIndex(b => b.id === bookId)
  if (index === -1) throw new Error(`No existe el libro con id ${bookId}`)
  this.data.splice(index, 1)
}
```

### Por qué esta versión es mejor
- **Comprueba la existencia** con `findIndex`. Si devuelve `-1`, lanza una excepción — tal como pide el enunciado.
- **`splice` muta el array original** en su sitio, sin cambiar la referencia. Otras partes del código que apunten a `this.data` siguen viendo el array actualizado.
- **No crea un array intermedio**, más eficiente y más claro.
- **El error es explícito**: el llamador sabe exactamente qué ha pasado.

## 2. Método `addBook(bookData)` (incorrecto)

```javascript
addBook(bookData) {
  const newBook = new Book({ ...bookData, id: this.data.length + 1 })
  this.data.push(newBook)
  return newBook
}
```

### ¿Por qué está mal?
1. **El id se calcula como `this.data.length + 1`.** Esto **falla en cuanto se elimina un libro de en medio**:
   ```
   Antes:    [id:1] [id:2] [id:3]        length = 3
   Borramos id 2: [id:1]       [id:3]    length = 2
   addBook(): id = 2 + 1 = 3   →  ¡DUPLICADO! (id 3 ya existe)
   ```
   Dos libros con el mismo id rompen toda la lógica de búsqueda, borrado y modificación.
2. **No valida si el id ya existe.** Si en el futuro se permite pasar un id desde fuera, podríamos crear duplicados sin avisar.
3. **No valida los datos obligatorios.** Si `bookData` viene sin `userId`, `moduleCode`, `price`, etc., se crea un libro incompleto sin lanzar error.

### Versión correcta

```javascript
addBook(bookData) {
  const newId = this.data.length > 0
    ? Math.max(...this.data.map(b => b.id)) + 1
    : 1
  const newBook = new Book({ ...bookData, id: newId })
  this.data.push(newBook)
  return newBook
}
```

### Por qué esta versión es mejor
- **`Math.max(...ids) + 1` encuentra siempre el siguiente id libre**, incluso después de haber borrado libros de en medio.
- **Caso especial del array vacío** (`: 1`) evita que `Math.max()` de un array vacío devuelva `-Infinity`.
- **Cuando los datos estén en una base de datos**, será el propio SGBD quien asigne el id (autoincremento) al recibir el `POST`.

## 3. Método `changeBook(newData)` (incorrecto)

```javascript
changeBook(newData) {
  const index = this.data.findIndex(b => b.id === newData.id)
  this.data[index] = newData // newData es un objeto plano, no una instancia de Book
  return newData
}
```

### ¿Por qué está mal?
1. **No comprueba si el índice es `-1`.** Si el libro no existe, `this.data[-1] = newData` **no da error**: crea una propiedad `"-1"` en el array y el libro **no se modifica**.
2. **Guarda un objeto plano en lugar de una instancia de `Book`.** Después de llamar a `changeBook`, ese elemento del array **deja de ser un `Book`**, y cualquier llamada a `toString()` sobre él fallará.
3. **Devuelve el objeto plano**, no una instancia de `Book`, así que el código que lo reciba tampoco podrá usar métodos de la clase.
4. **No valida los datos** del nuevo elemento antes de guardarlo.

### Versión correcta

```javascript
changeBook(bookData) {
  const index = this.data.findIndex(b => b.id === bookData.id)
  if (index === -1) throw new Error(`No existe el libro con id ${bookData.id}`)
  const updatedBook = new Book(bookData)
  this.data[index] = updatedBook
  return updatedBook
}
```

### Por qué esta versión es mejor
- **Comprueba la existencia** con `findIndex === -1` y **lanza excepción** si no se encuentra.
- **Crea un nuevo `Book` a partir de los datos** (`new Book(bookData)`) en lugar de guardar el objeto plano. Así el array sigue conteniendo **instancias homogéneas** de `Book`.
- **Devuelve una instancia de `Book`**, no un objeto literal.

---

# PARTE 2: Práctica 4 — Persistencia (Auditoría parte A)

**Pregunta:** Los métodos de consulta que ya teníamos (`booksFromUser`, `booksWithStatus`...), ¿deben trabajar sobre el `this.data` que ya tienes cargado en memoria (tras un `fetchAll()`), o deben pedir datos frescos al servidor en cada llamada?

### Decisión tomada
He decidido que los métodos de consulta trabajen sobre el `this.data` cargado en memoria.

### Ventajas e inconvenientes

**Trabajar con `this.data` (en memoria):**
- **Ventajas:** No hay latencia de red al filtrar; el código es más simple y rápido; no saturamos el servidor con peticiones GET innecesarias; los tests son mucho más sencillos de escribir.
- **Inconvenientes:** Los datos pueden quedar desactualizados si otro usuario modifica el servidor (por ejemplo, si añade un libro) sin que nosotros volvamos a llamar a `fetchAll()`.

**Pedir datos frescos al servidor en cada llamada:**
- **Ventajas:** Los datos siempre están actualizados en tiempo real.
- **Inconvenientes:** Cada consulta requiere un `await` y una petición HTTP, lo que hace la interfaz más lenta y el código mucho más complejo de mantener.

### Cómo se ha aplicado en cada clase
- **`Books` y `Users`:** Usan `this.data` para las consultas. Cuando se hacen modificaciones (`addBook`, `removeBook`, `changeBook`), se envía la petición al servidor. **Solo si el servidor responde con éxito**, se actualiza `this.data` en memoria. Si falla (ej. error 500), lanzamos una excepción y el array local no se modifica, evitando que quede corrupto.
- **`Modules`:** Al ser una entidad de solo lectura (no se añaden ni borran módulos desde la aplicación), basta con hacer un `fetchAll()` una vez al principio y trabajar siempre con la copia en memoria.

### Conclusión
Para el alcance de esta práctica, priorizar la velocidad y la simplicidad trabajando con `this.data` es un compromiso aceptable. En una aplicación real con múltiples usuarios concurrentes, habría que optar por pedir datos frescos o implementar un sistema de caché/refresco automático.