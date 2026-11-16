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
          <form id="bookForm">
            <div id="id-group" class="hidden">
              <label for="id">ID:</label>
              <input type="text" id="id" name="id" readonly>
            </div>
            <input type="text" id="publisher" name="publisher" placeholder="Editorial" required>
            <input type="number" id="price" name="price" placeholder="Precio" required min="0" step="0.01">
            <input type="number" id="pages" name="pages" placeholder="Páginas" required min="1">
            <select id="moduleCode" name="moduleCode" required></select>
            <div>
              <label><input type="radio" name="status" value="new" required> Nuevo</label>
              <label><input type="radio" name="status" value="good"> Bueno</label>
              <label><input type="radio" name="status" value="used"> Usado</label>
              <label><input type="radio" name="status" value="bad"> Malo</label>
              <label><input type="radio" name="status" value="digital"> Digital</label>
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

  clearList() { document.querySelector('#list').innerHTML = ''; }

  renderBook(book, moduleName, currentUserId) {
    const list = document.querySelector("#list");
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = book.id;

    const img = document.createElement("img");
    img.src = book.photo || 'https://via.placeholder.com/150';
    img.alt = `Libro: ${book.id}`;

    const div = document.createElement("div");
    const h3 = document.createElement("h3");
    h3.textContent = `${moduleName} (${book.id})`;
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
    div.innerHTML = `${text} <button type="button" class="btn-close"></button>`;
    div.querySelector('.btn-close').addEventListener('click', () => div.remove());
    messagesDiv.appendChild(div);
    if (type === 'info') setTimeout(() => div.remove(), 3000);
  }

  hideAllPages() { document.querySelectorAll('.page').forEach(p => p.classList.add('hidden')); }
  showPage(pageId, title = '') {
    const page = document.getElementById(pageId); if (page) page.classList.remove('hidden');
    if (pageId === 'form' && title) document.getElementById('form-title').textContent = title;
  }
  setFormMode(mode) {
    document.getElementById('bookForm').reset();
    const idGroup = document.getElementById('id-group');
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
  bindSubmitForm(handler) {
    document.querySelector('#bookForm').addEventListener('submit', (e) => {
      e.preventDefault(); const formData = new FormData(e.target);
      const bookData = { publisher: formData.get('publisher'), price: Number(formData.get('price')), pages: Number(formData.get('pages')), moduleCode: formData.get('moduleCode'), status: formData.get('status'), photo: formData.get('photo') || '', comments: formData.get('comments') || '' };
      const id = formData.get('id'); if (id) bookData.id = Number(id); handler(bookData);
    });
  }
  bindResetForm(handler) {
    // Добавляем флаг
    let isResetting = false;

    // Отслеживаем нажатие на кнопку Reset
    document.querySelector('#bookForm').addEventListener('click', (e) => {
      if (e.target.type === 'reset') {
        isResetting = true;
      }
    });

    document.querySelector('#bookForm').addEventListener('reset', (e) => {
      // Если это не ручной сброс (клик по кнопке), то игнорируем
      if (!isResetting) return;

      // Если мы в режиме редактирования, меняем URL
      if (window.location.hash.startsWith('#edit')) {
        setTimeout(() => {
          isResetting = false; // Сбрасываем флаг
          handler();
        }, 0);
      } else {
        isResetting = false;
      }
    });
  }
}