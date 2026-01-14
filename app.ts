// app.ts

type BookProps = {
  id?: string;
  title: string;
  author: string;
  year: number;
};

class MyBook {
  private _id: string;
  private _title: string;
  private _author: string;
  private _year: number;

  constructor({ id, title, author, year }: BookProps) {
    this._id = id ?? crypto.randomUUID();
    this._title = title.trim();
    this._author = author.trim();
    this._year = Number(year);
    this.validate();
  }

  get id() { return this._id; }
  get title() { return this._title; }
  get author() { return this._author; }
  get year() { return this._year; }

  set title(value: string) {
    this._title = value.trim();
    this.validate();
  }
  set author(value: string) {
    this._author = value.trim();
    this.validate();
  }
  set year(value: number) {
    this._year = Number(value);
    this.validate();
  }

  toJSON(): BookProps {
    return { id: this._id, title: this._title, author: this._author, year: this._year };
  }

  private validate() {
    if (!this._title) throw new Error("Título é obrigatório.");
    if (!this._author) throw new Error("Autor é obrigatório.");
    if (!Number.isFinite(this._year) || this._year < 0) throw new Error("Ano inválido.");
  }
}

interface StorageAdapter<T> {
  load(): T[];
  save(items: T[]): void;
}

class LocalStoreAdapter implements StorageAdapter<BookProps> {
  private key: string;
  constructor(key: string) { this.key = key; }

  load(): BookProps[] {
    const raw = localStorage.getItem(this.key);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as BookProps[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  save(items: BookProps[]): void {
    localStorage.setItem(this.key, JSON.stringify(items));
  }
}

class MyLibrary {
  private books: Map<string, Book> = new Map();
  private storage: StorageAdapter<BookProps>;

  constructor(storage: StorageAdapter<BookProps>) {
    this.storage = storage;
    this.bootstrap();
  }
  
  private bootstrap(): void {
    const data: BookProps[] = this.storage.load();
    for (const props of data) {
      const book = new Book(props); // agora aceita id opcional
      this.books.set(book.id, book);
    }
  }

  list(): Book[] {
    return [...this.books.values()];
  }

  add(props: BookProps): Book {
    const book = new Book(props);
    this.books.set(book.id, book);
    this.persist();
    return book;
  }

  update(id: string, updates: Partial<BookProps>): Book {
    const book = this.books.get(id);
    if (!book) throw new Error("Livro não encontrado.");

    if (updates.title !== undefined) book.title = updates.title;
    if (updates.author !== undefined) book.author = updates.author;
    if (updates.year !== undefined) book.year = Number(updates.year);

    this.persist();
    return book;
  }

  remove(id: string): void {
    if (!this.books.has(id)) throw new Error("Livro não encontrado.");
    this.books.delete(id);
    this.persist();
  }

  search(query: string): Book[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.list();
    return this.list().filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q)
    );
  }

  private persist(): void {
    const payload = this.list().map(b => b.toJSON());
    this.storage.save(payload);
  }
}




class UILibrary {
  private library: Library;

  private form: HTMLFormElement;
  private inputId: HTMLInputElement;
  private inputTitle: HTMLInputElement;
  private inputAuthor: HTMLInputElement;
  private inputYear: HTMLInputElement;
  private saveBtn: HTMLButtonElement;
  private cancelBtn: HTMLButtonElement;

  private tbody: HTMLTableSectionElement;
  private searchInput: HTMLInputElement;

  constructor(library: Library) {
    this.library = library;

    this.form = document.getElementById("book-form") as HTMLFormElement;
    this.inputId = document.getElementById("book-id") as HTMLInputElement;
    this.inputTitle = document.getElementById("title") as HTMLInputElement;
    this.inputAuthor = document.getElementById("author") as HTMLInputElement;
    this.inputYear = document.getElementById("year") as HTMLInputElement;
    this.saveBtn = document.getElementById("save-btn") as HTMLButtonElement;
    this.cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;

    this.tbody = document.getElementById("books-tbody") as HTMLTableSectionElement;
    this.searchInput = document.getElementById("search") as HTMLInputElement;

    this.bindEvents();
    this.renderList(this.library.list());
  }

  private bindEvents() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSave();
    });

    this.cancelBtn.addEventListener("click", () => this.resetForm());

    this.searchInput.addEventListener("input", () => {
      const results = this.library.search(this.searchInput.value);
      this.renderList(results);
    });
  }

  private handleSave() {
    const id = this.inputId.value || undefined;
    const title = this.inputTitle.value;
    const author = this.inputAuthor.value;
    const year = Number(this.inputYear.value);

    try {
      if (id) {
        this.library.update(id, { title, author, year });
      } else {
        this.library.add({ title, author, year });
      }
      this.resetForm();
      this.renderList(this.library.search(this.searchInput.value));
    } catch (err) {
      alert((err as Error).message);
    }
  }

  private resetForm() {
    this.form.reset();
    this.inputId.value = "";
    this.saveBtn.textContent = "Salvar";
  }

  private renderList(books: Book[]) {
    this.tbody.innerHTML = "";
    if (books.length === 0) {
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

      const tdTitle = document.createElement("td");
      tdTitle.textContent = book.title;

      const tdAuthor = document.createElement("td");
      tdAuthor.textContent = book.author;

      const tdYear = document.createElement("td");
      tdYear.textContent = String(book.year);

      const tdActions = document.createElement("td");
      tdActions.className = "actions-cell";

      const editBtn = document.createElement("button");
      editBtn.className = "btn-edit";
      editBtn.textContent = "Editar";
      editBtn.addEventListener("click", () => this.fillForm(book));

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn-delete";
      deleteBtn.textContent = "Remover";
      deleteBtn.addEventListener("click", () => {
        const ok = confirm(`Remover "${book.title}"?`);
        if (ok) {
          try {
            this.library.remove(book.id);
            this.renderList(this.library.search(this.searchInput.value));
          } catch (err) {
            alert((err as Error).message);
          }
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

  private fillForm(book: Book) {
    this.inputId.value = book.id;
    this.inputTitle.value = book.title;
    this.inputAuthor.value = book.author;
    this.inputYear.value = String(book.year);
    this.saveBtn.textContent = "Atualizar";
    this.inputTitle.focus();
  }
}

// Bootstrap
document.addEventListener("DOMContentLoaded", () => {
  const storage = new LocalStorageAdapter("library.books");
  const library = new Library(storage);
  new LibraryUI(library);
});
