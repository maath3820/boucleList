const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const languageFilter = document.getElementById('languageFilter');
const dateFilter = document.getElementById('dateFilter');
const searchResults = document.getElementById('searchResults');
const createListButton = document.getElementById('createListButton');
const listsContainer = document.getElementById('listsContainer');

let bookLists = JSON.parse(localStorage.getItem('bookLists')) || {};

function saveLists() {
    localStorage.setItem('bookLists', JSON.stringify(bookLists));
}

function createBookItem(book) {
    const bookItem = document.createElement('div');
    bookItem.classList.add('book-item');

    const bookCover = document.createElement('img');
    bookCover.src = book.cover_url || 'placeholder.png';
    bookItem.appendChild(bookCover);

    const bookInfo = document.createElement('div');
    const bookTitle = document.createElement('p');
    bookTitle.textContent = `Title: ${book.title}`;
    bookInfo.appendChild(bookTitle);
    
    const bookAuthor = document.createElement('p');
    bookAuthor.textContent = `Author: ${book.author}`;
    bookInfo.appendChild(bookAuthor);
    
    const bookISBN = document.createElement('p');
    bookISBN.textContent = `ISBN: ${book.isbn}`;
    bookInfo.appendChild(bookISBN);
    
    bookItem.appendChild(bookInfo);

    const addButton = document.createElement('button');
    addButton.textContent = 'Add to List';
    addButton.addEventListener('click', () => addToBookList(book));
    bookItem.appendChild(addButton);

    return bookItem;
}

function displaySearchResults(books) {
    searchResults.innerHTML = '';
    books.forEach(book => {
        const bookItem = createBookItem(book);
        searchResults.appendChild(bookItem);
    });
}

async function searchBooks() {
    const query = searchInput.value;
    const language = languageFilter.value;
    const dateOrder = dateFilter.value;

    const response = await fetch(`https://openlibrary.org/search.json?q=${query}`);
    const data = await response.json();
    let books = data.docs.map(doc => ({
        title: doc.title,
        author: doc.author_name ? doc.author_name.join(', ') : 'Unknown',
        isbn: doc.isbn ? doc.isbn[0] : 'N/A',
        cover_url: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : 'placeholder.png'
    }));

    if (language !== 'all') {
        books = books.filter(book => book.language === language);
    }

    if (dateOrder === 'asc') {
        books.sort((a, b) => new Date(a.first_publish_year) - new Date(b.first_publish_year));
    } else if (dateOrder === 'desc') {
        books.sort((a, b) => new Date(b.first_publish_year) - new Date(a.first_publish_year));
    }

    displaySearchResults(books);
}

function addToBookList(book) {
    const listName = prompt('Enter the list name to add this book:');
    if (!listName) return;

    if (!bookLists[listName]) {
        bookLists[listName] = [];
    }
    bookLists[listName].push(book);
    saveLists();
    displayBookLists();
}

function displayBookLists() {
    listsContainer.innerHTML = '';
    for (const [listName, books] of Object.entries(bookLists)) {
        const listElement = document.createElement('div');
        listElement.classList.add('book-list');

        const listTitle = document.createElement('h3');
        listTitle.textContent = listName;
        listElement.appendChild(listTitle);

        books.forEach(book => {
            const bookItem = createBookItem(book);
            listElement.appendChild(bookItem);
        });

        listsContainer.appendChild(listElement);
    }
}

function createNewList() {
    const listName = prompt('Enter the name of the new list:');
    if (!listName) return;

    if (!bookLists[listName]) {
        bookLists[listName] = [];
    }
    saveLists();
    displayBookLists();
}

searchButton.addEventListener('click', searchBooks);
createListButton.addEventListener('click', createNewList);

displayBookLists();
