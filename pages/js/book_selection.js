function updateBooksSection(container, booksData, isNewTestament){
    let books = booksData.books.sort((a, b) => a.book_number - b.book_number);

    for(const book of books) {
        if(isNewTestament != book.new_testament)
            continue;

        let book_full_name = book.book_name;
        let book_elem_id = `book_${book.id}`;
        let book_href = `/pages/chapter_selection.html?book_id=${book.id}`

        /*if(book.book_full_name != book.book_name) {
            book_full_name += " - " + book.book_full_name;
        }*/

        book_full_name += "\n";
        addElement(container, book_full_name, book_elem_id, template_book_name_list, book_href)
    }
}

let current_url = new URL(window.location.href);
let language = getSearchParameterOrDefault(current_url, "language");

window.onload = async function() {
    const booksData = await getFileContent(language);

    updateBooksSection(old_testament_books, booksData, false);
    updateBooksSection(new_testament_books, booksData, true);
}