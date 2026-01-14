// app.js

class Book {
  constructor({ id, title, author, year }) {
    this._id = id ?? (crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));
    this._title = String(title || "").trim();
    this._author = String(author || "").trim();
    this._year = Number(year);
    this.validate();
  }
  get id() { return this._id; }
  get title() { return this._title; }
  get author() { return this._author; }
  get year() { return this._year; }
  set title(v) { this._title = String(v || "").trim(); this.validate(); }
  set author(v) { this._author = String(v || "").trim(); this.validate(); }
  set year(v) { this._year = Number(v); this.validate(); }
  toJSON() { return { id: this._id, title: this._title, author: this._author, year: this._year }; }
  validate() {
    if (!this._title) throw new Error("Título é obrigatório.");
    if (!this._author) throw new Error("Autor é obrigatório.");
    if (!Number.isFinite(this._year) || this._year < 0) throw new Error("Ano inválido.");
  }
}

class LocalStorageAdapter {
  constructor(key) { this.key = key; }
  load() {
    const raw = localStorage.getItem(this.key);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }
  save(items) { localStorage.setItem(this.key, JSON.stringify(items)); }
}

class Library {
  constructor(storage) {
    this.storage = storage;
    this.books = new Map();
    this.bootstrap();
  }
  bootstrap() {
    const data = this.storage.load();
    data.forEach(props => {
      const book = new Book(props);
      this.books.set(book.id, book);
    });
  }
  list() { return Array.from(this.books.values()); }
  add(props) {
    const book = new Book(props);
    this.books.set(book.id, book);
    this.persist();
    return book;
  }
  update(id, updates) {
    const book = this.books.get(id);
    if (!book) throw new Error("Livro não encontrado.");
    if (updates.title !== undefined) book.title = updates.title;
    if (updates.author !== undefined) book.author = updates.author;
    if (updates.year !== undefined) book.year = Number(updates.year);
    this.persist();
    return book;
  }
  remove(id) {
    if (!this.books.has(id)) throw new Error("Livro não encontrado.");
    this.books.delete(id);
    this.persist();
  }
  search(query) {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return this.list();
    return this.list().filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q)
    );
  }
  persist() {
    const payload = this.list().map(b => b.toJSON());
    this.storage.save(payload);
  }
}

class LibraryUI {
  constructor(library) {
    this.library = library;
    this.form = document.getElementById("book-form");
    this.inputId = document.getElementById("book-id");
    this.inputTitle = document.getElementById("title");
    this.inputAuthor = document.getElementById("author");
    this.inputYear = document.getElementById("year");
    this.saveBtn = document.getElementById("save-btn");
    this.cancelBtn = document.getElementById("cancel-btn");
    this.tbody = document.getElementById("books-tbody");
    this.searchInput = document.getElementById("search");
    this.bindEvents();
    this.renderList(this.library.list());
  }
  bindEvents() {
    this.form.addEventListener("submit", (e) => { e.preventDefault(); this.handleSave(); });
    this.cancelBtn.addEventListener("click", () => this.resetForm());
    this.searchInput.addEventListener("input", () => {
      const results = this.library.search(this.searchInput.value);
      this.renderList(results);
    });
  }
  handleSave() {
    const id = this.inputId.value || undefined;
    const title = this.inputTitle.value;
    const author = this.inputAuthor.value;
    const year = Number(this.inputYear.value);
    try {
      if (id) this.library.update(id, { title, author, year });
      else this.library.add({ title, author, year });
      this.resetForm();
      this.renderList(this.library.search(this.searchInput.value));
    } catch (err) { alert(err.message || String(err)); }
  }
  resetForm() {
    this.form.reset();
    this.inputId.value = "";
    this.saveBtn.textContent = "Salvar";
  }
  renderList(books) {
    this.tbody.innerHTML = "";
    if (!books.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.textContent = "Nenhum livro encontrado.";
      td.style.color = "#9ca3af";
      tr.appendChild(td);
      this.tbody.appendChild(tr);
      return;
    }
    books.forEach(book => {
      const tr = document.createElement("tr");
      const tdTitle = document.createElement("td"); tdTitle.textContent = book.title;
      const tdAuthor = document.createElement("td"); tdAuthor.textContent = book.author;
      const tdYear = document.createElement("td"); tdYear.textContent = String(book.year);
      const tdActions = document.createElement("td"); tdActions.className = "actions-cell";
      const editBtn = document.createElement("button"); editBtn.className = "btn-edit"; editBtn.textContent = "Editar";
      editBtn.addEventListener("click", () => this.fillForm(book));
      const deleteBtn = document.createElement("button"); deleteBtn.className = "btn-delete"; deleteBtn.textContent = "Remover";
      deleteBtn.addEventListener("click", () => {
        const ok = confirm(`Remover "${book.title}"?`);
        if (ok) {
          try { this.library.remove(book.id); this.renderList(this.library.search(this.searchInput.value)); }
          catch (err) { alert(err.message || String(err)); }
        }
      });
      tdActions.appendChild(editBtn);
      tdActions.appendChild(deleteBtn);
      tr.appendChild(tdTitle);
      tr.appendChild(tdAuthor);
      tr.appendChild(tdYear);
      tr.appendChild(tdActions);
      this.tbody.appendChild(tr);
    });
  }
  fillForm(book) {
    this.inputId.value = book.id;
    this.inputTitle.value = book.title;
    this.inputAuthor.value = book.author;
    this.inputYear.value = String(book.year);
    this.saveBtn.textContent = "Atualizar";
    this.inputTitle.focus();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const storage = new LocalStorageAdapter("library.books");
  const library = new Library(storage);
  new LibraryUI(library);
});
