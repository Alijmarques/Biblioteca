# Biblioteca
Protótipo de Biblioteca


# 📚 Biblioteca Web

Uma aplicação simples de gerenciamento de livros feita com **HTML, CSS, JavaScript, TypeScript e Programação Orientada a Objetos (POO)**.  
Permite **adicionar, editar, remover e buscar livros**. Os dados são persistidos no navegador via `localStorage`.

---

## 🚀 Funcionalidades

- ➕ **Adicionar livros** com título, autor e ano de publicação  
- ✏️ **Editar livros** já cadastrados  
- 🗑️ **Remover livros** da lista  
- 🔍 **Buscar livros** por título ou autor  
- 💾 **Persistência local** usando `localStorage`  
- 🎨 Interface simples e responsiva com HTML + CSS  

---

## 🛠️ Tecnologias utilizadas

- **HTML5** → estrutura da aplicação  
- **CSS3** → estilização e layout responsivo  
- **JavaScript (ES6+)** → lógica de interação com DOM  
- **TypeScript** → tipagem estática e organização do código  
- **POO (Programação Orientada a Objetos)** → classes `Book` e `MyLibrary` para encapsular lógica  

---

## 📂 Estrutura de pastas



---

## ⚙️ Como executar

1. Clone este repositório:
   ```bash
   git clone https://github.com/seu-usuario/biblioteca.git
   cd biblioteca

biblioteca/
│── index.html                # Página principal
│── styles.css                # Estilos da interface
│── app.ts                        # Código TypeScript (POO)
│── app.js                        # Código JavaScript compilado
│── README.md                  # Documentação do projeto

Código

---

## ⚙️ Como executar

1. Clone este repositório:
   ```bash
   git clone https://github.com/seu-usuario/biblioteca.git
   cd biblioteca
Instale o compilador TypeScript (se ainda não tiver):

bash
npm install -g typescript
Compile o código TypeScript:

bash
tsc app.ts --target ES2017 --outFile app.js
Abra o arquivo index.html em seu navegador.

🧩 Estrutura de classes
Book  
Representa um livro individual.

Atributos: id, title, author, year

Métodos: toJSON()

MyLibrary  
Gerencia a coleção de livros.

Métodos: add(), update(), remove(), list(), search(), persist()

StorageAdapter  
Interface para abstrair persistência.

Implementação: LocalStorageAdapter

📸 Demonstração
Formulário para adicionar/editar livros

Tabela listando os livros cadastrados

Botões de ação para editar/remover

Campo de busca para filtrar resultados

🤝 Contribuição
Faça um fork do projeto

Crie uma branch para sua feature:

bash
git checkout -b minha-feature
Commit suas alterações:

bash
git commit -m "Adicionei nova funcionalidade"
Envie para o repositório remoto:

bash
git push origin minha-feature
Abra um Pull Request

📜 Licença
Este projeto está sob a licença MIT.
Você pode usar, modificar e distribuir livremente, desde que mantenha os créditos.

✨ Melhorias futuras
Categorias de livros (ex.: romance, técnico, etc.)

Status de leitura (lido, lendo, quero ler)

Exportar/importar lista em JSON

Paginação e ordenação dos livros

Código

---

Esse README já está pronto para ser usado no GitHub ou em qualquer repositório.  
