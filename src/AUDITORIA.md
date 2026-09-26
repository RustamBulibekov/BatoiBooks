# AUDITORÍA

En este documento se analizan dos funciones escritas de forma incorrecta
según las restricciones de diseño del proyecto:

- No usar bucles `for` ni `while`.
- No mutar el array original.
- No hardcodear valores.

---

## 1. Función `booksNotSold` (incorrecta)

```javascript
function booksNotSold(books) {
  let result = []
  for (let book of books) {
    if (book.soldDate == null) {
      result.push(book)
    }
  }
  return result
}
```

### ¿Por qué está mal?

1. **Usa un bucle `for...of`**: el enunciado prohíbe explícitamente
   `for` y `while`. Todo debe resolverse con programación funcional
   (`filter`, `map`, `reduce`, `find`, `some`, `every`...).

2. **Muta un array auxiliar con `push`**: es un estilo imperativo,
   menos declarativo y más difícil de leer y de encadenar con otras
   operaciones.

3. **Comparación `== null` incorrecta para estos datos**: en el
   fichero `datos.js`, el campo `soldDate` de un libro no vendido
   es una **cadena vacía** (`""`), no `null` ni `undefined`. Por lo
   tanto `book.soldDate == null` devuelve `false` para `""`, y la
   función **no filtra correctamente** los libros no vendidos.

4. **No documenta el comportamiento con array vacío**: aunque
   `filter` devolvería `[]` de forma natural, conviene dejarlo
   explícito en la versión correcta.

### Versión correcta

```javascript
export function booksNotSold(books) {
  return books.filter(book => !book.soldDate)
}
```

### Por qué esta versión es mejor

- **Sin bucles**: usa `filter`, que es declarativo y funcional.
- **Sin mutaciones**: devuelve un array nuevo, el original no se toca.
- **Comparación robusta**: `!book.soldDate` es verdadero tanto para
  `null`, como para `undefined`, como para la cadena vacía `""`.
  Es exactamente lo que necesitan nuestros datos.
- **Más corta y legible**: una sola línea expresa la intención.

---

## 2. Variante de `incrementPriceOfbooks` que muta el array original (incorrecta)

```javascript
function incrementPriceOfbooks(books, percent) {
  for (let book of books) {
    book.price = book.price * (1 + percent / 100)
  }
  return books
}
```

### ¿Por qué está mal?

1. **Usa un bucle `for...of`**: prohibido por el enunciado.
2. **Muta el array original**: modifica el objeto `books` que le
   llega como parámetro. Cualquier otra parte del programa que
   mantenga una referencia a ese array verá los precios cambiados
   sin haberlo pedido. Es un **efecto secundario oculto**.
3. **Muta cada objeto `book`**: además de mutar el array, modifica
   los objetos individuales, lo que rompe el principio de pureza
   de las funciones.
4. **Imposible de testear correctamente**: no se puede comparar el
   estado "antes" y "después", porque el "antes" ya no existe.
5. **No redondea el resultado**: los precios pueden quedar con
   muchos decimales (`13.200000000000001`), lo que no es aceptable
   para un precio.

### Versión correcta

```javascript
export function incrementPriceOfbooks(books, percent) {
  return books.map(book => ({
    ...book,
    price: +(book.price * (1 + percent / 100)).toFixed(2)
  }))
}
```

### Por qué esta versión es mejor

- **Sin bucles**: usa `map`, que es la operación funcional natural
  para transformar cada elemento de un array.
- **Sin mutaciones**: crea un array nuevo y objetos nuevos gracias
  al operador spread `...book`. El array original y sus objetos
  quedan intactos.
- **Función pura**: el resultado depende únicamente de sus
  argumentos. Es predecible y fácil de testear.
- **Redondeo correcto**: `.toFixed(2)` limita a 2 decimales y el
  `+` delante convierte la cadena resultante en número.
- **Componible**: al no mutar nada, se puede encadenar con otros
  `map`, `filter`, `reduce` sin sorpresas.

---

## Conclusión

En código que trabaja con colecciones, las funciones de array
(`map`, `filter`, `reduce`, `find`...) son **más declarativas**,
**más fáciles de encadenar** y **más fáciles de leer** — tanto para
una persona como para una IA — que un bucle imperativo.

Además, evitar mutaciones hace que las funciones sean **puras**,
lo cual simplifica el razonamiento, las pruebas y el mantenimiento
del código.