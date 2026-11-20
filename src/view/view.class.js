export default class View {
  renderPage(batoiLogo) {
    document.querySelector('#app').innerHTML = `
      <header>
        <img src="${batoiLogo}" width="80" alt="Logo">
        <h1>BatoiBooks</h1>
        <div>
          <span class="material-icons">shopping_cart</span>
          <span id="cart-count">0</span>
        </div>
      </header>
      
      <nav>
        <ul>
          <li><a href="#list">Ver Libros</a></li>
          <li><a href="#form">Añadir Libro</a></li>
          <li><a href="#about">Acerca de...</a></li>
        </ul>
      </nav>
      
      <div id="messages"></div>
      
      <main>
        <div id="list" class="page"></div>
        
        <div id="form" class="page hidden">
          <h2 id="form-title">Añadir libro</h2>
          <form id="bookForm" novalidate>
            <div id="id-group" class="hidden">
              <label for="id">ID:</label>
              <input type="text" id="id" name="id" readonly>
            </div>
            
            <div>
              <input type="text" id="publisher" name="publisher" placeholder="Editorial" required>
              <span id="publisher-error" class="error-msg"></span>
            </div>
            
            <div>
              <input type="number" id="price" name="price" placeholder="Precio" required min="0" step="0.01">
              <span id="price-error" class="error-msg"></span>
            </div>
            
            <div>
              <input type="number" id="pages" name="pages" placeholder="Páginas" required min="1" step="1">
              <span id="pages-error" class="error-msg"></span>
            </div>
            
            <div>
              <select id="moduleCode" name="moduleCode" required></select>
              <span id="moduleCode-error" class="error-msg"></span>
            </div>
            
            <div>
              <label><input type="radio" name="status" value="new" required> Nuevo</label>
              <label><input type="radio" name="status" value="good"> Bueno</label>
              <label><input type="radio" name="status" value="used"> Usado</label>
              <label><input type="radio" name="status" value="bad"> Malo</label>
              <label><input type="radio" name="status" value="digital"> Digital</label>
              <span id="status-error" class="error-msg"></span>
            </div>
            
            <input type="text" id="photo" name="photo" placeholder="URL de la foto">
            <textarea id="comments" name="comments" placeholder="Comentarios"></textarea>
            
            <button type="submit">Guardar</button>
            <button type="reset">Reset</button>
          </form>
        </div>

        <div id="about" class="page hidden">
          <p>Lorem ipsum...</p>
        </div>

        <div id="not-found" class="page hidden">
          <h2>Página no encontrada</h2>
          <a href="#list">Volver a la lista</a>
        </div>
      </main>
      <footer>RUSTAM</footer>
    `
  }

  clearErrors() {
    document.querySelectorAll('.error-msg').forEach(el => {
      if (el.id !== 'moduleCode-error') el.textContent = '';
    });
    // Сбрасываем кастомные ошибки, КРОМЕ moduleCode (её ставит контроллер)
    document.querySelectorAll('#bookForm input, #bookForm select').forEach(el => {
      if (el.name !== 'moduleCode') el.setCustomValidity('');
    });
  }
  validateForm() {
    const form = document.querySelector('#bookForm');
    let isValid = true;
    const fields = ['publisher', 'price', 'pages', 'moduleCode'];

    fields.forEach(name => {
      const input = form.elements.namedItem(name);
      const errorSpan = document.getElementById(`${name}-error`);
      if (!input || !errorSpan) return;

      let isFieldValid = true;

      if (name === 'moduleCode') {
        // Если контроллер поставил кастомную ошибку — показываем её
        if (input.validationMessage) {
          isFieldValid = false;
          errorSpan.textContent = input.validationMessage;
        }
        // Если поле пустое — показываем "обязательно"
        else if (input.value === '' || input.selectedIndex === 0) {
          isFieldValid = false;
          errorSpan.textContent = 'Este campo es obligatorio';
        }
        // Если всё ок
        else {
          errorSpan.textContent = '';
        }
      } else {
        isFieldValid = input.checkValidity();
        if (!isFieldValid) {
          if (name === 'publisher') errorSpan.textContent = 'Este campo es obligatorio';
          else if (name === 'price') {
            if (input.validity.valueMissing) errorSpan.textContent = 'El precio es obligatorio';
            else if (input.validity.rangeUnderflow) errorSpan.textContent = 'El precio no puede ser negativo';
            else if (input.validity.stepMismatch) errorSpan.textContent = 'Máximo 2 decimales';
          } else if (name === 'pages') {
            if (input.validity.valueMissing) errorSpan.textContent = 'Las páginas son obligatorias';
            else if (input.validity.rangeUnderflow) errorSpan.textContent = 'Debe haber al menos 1 página';
            else if (input.validity.stepMismatch) errorSpan.textContent = 'Debe ser un número entero';
          }
        } else {
          errorSpan.textContent = '';
        }
      }

      if (!isFieldValid) isValid = false;
    });

    // Проверка радиокнопок
    const radios = form.querySelectorAll('[name="status"]');
    const statusChecked = Array.from(radios).some(r => r.checked);
    if (!statusChecked) {
      isValid = false;
      document.getElementById('status-error').textContent = 'Debes elegir un estado';
    } else {
      document.getElementById('status-error').textContent = '';
    }

    return isValid;
  }
  setModuleError(message) {
    const input = document.querySelector('#moduleCode');
    const errorSpan = document.getElementById('moduleCode-error');
    if (message) {
      input.setCustomValidity(message);
      errorSpan.textContent = message;
    } else {
      input.setCustomValidity('');
      errorSpan.textContent = '';
    }
  }

  bindInputChanges() {
    document.querySelector('#bookForm').addEventListener('input', (e) => {
      const name = e.target.name;
      if (name) {
        const errorSpan = document.getElementById(`${name}-error`);
        if (errorSpan) errorSpan.textContent = '';
        e.target.setCustomValidity('');
      }
    });
  }

  bindModuleChange(handler) {
    document.querySelector('#moduleCode').addEventListener('change', (e) => {
      const currentId = document.getElementById('id').value;
      handler(e.target.value, currentId);
    });
  }

  bindSubmitForm(handler) {
    document.querySelector('#bookForm').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!this.validateForm()) return;

      const formData = new FormData(e.target);
      const bookData = {
        publisher: formData.get('publisher'),
        price: Number(formData.get('price')),
        pages: Number(formData.get('pages')),
        moduleCode: formData.get('moduleCode'),
        status: formData.get('status'),
        photo: formData.get('photo') || '',
        comments: formData.get('comments') || ''
      };
      const id = formData.get('id');
      if (id) bookData.id = Number(id);
      handler(bookData);
    });
  }

  clearList() { document.querySelector('#list').innerHTML = ''; }
  hideAllPages() { document.querySelectorAll('.page').forEach(p => p.classList.add('hidden')); }
  showPage(pageId, title = '') {
    const page = document.getElementById(pageId); if (page) page.classList.remove('hidden');
    if (pageId === 'form' && title) document.getElementById('form-title').textContent = title;
  }
  setFormMode(mode) {
    document.getElementById('bookForm').reset();
    const idGroup = document.getElementById('id-group');
    this.setModuleError('');
    this.clearErrors();
    if (mode === 'edit') { idGroup.classList.remove('hidden'); }
    else { idGroup.classList.add('hidden'); document.getElementById('id').value = ''; }
  }
  fillForm(book) {
    document.getElementById('id').value = book.id;
    document.getElementById('publisher').value = book.publisher;
    document.getElementById('price').value = book.price;
    document.getElementById('pages').value = book.pages;
    document.getElementById('moduleCode').value = book.moduleCode;
    document.getElementById('photo').value = book.photo;
    document.getElementById('comments').value = book.comments;
    const radio = document.querySelector(`input[name="status"][value="${book.status}"]`);
    if (radio) radio.checked = true;
  }
  updateCartCount(count) { document.getElementById('cart-count').textContent = count; }
  renderModules(modules) {
    const select = document.querySelector('#moduleCode'); select.innerHTML = '';
    modules.forEach(m => { const opt = document.createElement('option'); opt.value = m.code; opt.textContent = m.cliteral; select.appendChild(opt); });
  }
  renderBook(book, moduleName, currentUserId) {
    const list = document.querySelector("#list");
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = book.id;
    const img = document.createElement("img");
    img.src = book.photo || 'https://via.placeholder.com/150';
    img.alt = `Libro: ${book.id}`;
    const div = document.createElement("div");
    const h3 = document.createElement("h3"); h3.textContent = `${moduleName} (${book.id})`;
    const h4Pub = document.createElement("h4"); h4Pub.textContent = book.publisher;
    const pPages = document.createElement("p"); pPages.textContent = `${book.pages} páginas`;
    const pStatus = document.createElement("p"); pStatus.textContent = `Estado: ${book.status}`;
    const pSold = document.createElement("p");
    if (book.soldDate) {
      const [year, month, day] = book.soldDate.split('-');
      pSold.textContent = `Vendido el ${day}/${month}/${year}`;
    } else { pSold.textContent = "En venta"; }
    const pComments = document.createElement("p"); pComments.textContent = book.comments;
    const h4Price = document.createElement("h4"); h4Price.textContent = `${book.price} €`;
    div.append(h3, h4Pub, pPages, pStatus, pSold, pComments, h4Price);
    const actions = document.createElement("div");
    actions.className = "actions";
    const createBtn = (className, ariaLabel, iconName) => {
      const btn = document.createElement("button");
      btn.type = "button"; btn.className = className; btn.setAttribute("aria-label", ariaLabel);
      const icon = document.createElement("span"); icon.className = "material-icons"; icon.textContent = iconName;
      btn.appendChild(icon); return btn;
    };
    if (book.userId === currentUserId) {
      actions.append(createBtn("btn-edit", "Editar", "edit"), createBtn("btn-delete", "Borrar", "delete"));
    } else {
      actions.appendChild(createBtn("btn-cart", "Añadir al carrito", "add_shopping_cart"));
    }
    div.appendChild(actions);
    card.append(img, div);
    list.appendChild(card);
  }
  bindListActions(onEdit, onDelete, onAddToCart) {
    document.querySelector('#list').addEventListener('click', (e) => {
      const btn = e.target.closest('button'); if (!btn) return;
      const card = btn.closest('.card'); if (!card) return;
      const bookId = Number(card.dataset.id);
      if (btn.classList.contains('btn-edit')) onEdit(bookId);
      if (btn.classList.contains('btn-delete')) onDelete(bookId);
      if (btn.classList.contains('btn-cart')) onAddToCart(bookId);
    });
  }
  addMessage(text, type = 'info') {
    const messagesDiv = document.querySelector("#messages");
    const div = document.createElement('div');
    div.className = `alert alert-${type === 'error' ? 'danger' : 'info'}`;
    div.setAttribute('role', 'alert');
    const textNode = document.createTextNode(text);
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'btn-close';
    closeBtn.addEventListener('click', () => div.remove());
    div.appendChild(textNode);
    div.appendChild(closeBtn);
    messagesDiv.appendChild(div);
    if (type === 'info') setTimeout(() => div.remove(), 3000);
  }
  bindResetForm(handler) {
    document.querySelector('#bookForm').addEventListener('click', (e) => {
      if (e.target.type === 'reset') {
        // Вручную очищаем ВСЕ ошибки, включая moduleCode
        document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
        const moduleInput = document.getElementById('moduleCode');
        moduleInput.setCustomValidity(''); // Сбрасываем кастомную ошибку
        handler();
      }
    });
  }
}