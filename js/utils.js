const applicationVersion = 'v1.1.3';

let searchParametersDefaults = {
    "language": "pt_br",
    "book_id": "Gn",
    "chapter_number": "1"
}

/**
 * @param {URL} url
 * @param {string} searchParameterName
 * 
 * @returns {string}
 */
function getSearchParameterOrDefault(url, searchParameterName) {
    let defaultParameterValue = searchParametersDefaults[searchParameterName];

    return url.searchParams.get(searchParameterName) ?? defaultParameterValue;
}

/**
 * @param {string} language
 * 
 * @returns {object}
 */
function getFileUrl(language) {
    let url = `/biblia-pwa/biblia_json/${language}_full.json`;

    return url;
}

/**
 * @param {string} language
 * @param {string} book_id
 * @param {string} chapter_number
 * 
 * @returns {object}
 */
async function getFileContent(language, book_id=null, chapter_number=null) {
    let response = await fetch(getFileUrl(language));

    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }

    let bibleContent = await response.json();

    if(book_id == null) {
        for(const book in bibleContent.books){
            book.chapters = [];
        }

    return { "books": bibleContent.books };
    }

    let book = bibleContent.books.filter((book) => book.id === book_id)[0];

    if(chapter_number == null) {
        for(const chapter in book.chapters){
            chapter.versicles = [];
        }
        return { "book": book, "chapters": book.chapters };
    }

    book.chapters = [ book.chapters.filter((chapter) => chapter.chapter_number == chapter_number)[0] ];
    return { "book": book, "chapter": book.chapters[0] };
}

/**
 * @param {string} id
 * 
 * @returns {string}
 */
function getId(id) {
    if(id == null) {
        return null;
    }

    id = id.trim();

    //Verify if string starts with a number
    if(id.match(/^\d/)) {
        id = `id_${id}`;
    }

    let replaceChars = /[^a-zA-Z0-9]/g;

    return id.replaceAll(replaceChars,"_");
}


/**
 * @param {number} min
 * @param {number} max
 * 
 * @returns {number}
 */
function randIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

Date.prototype.today = function () { 
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
}

/**
 * @param {Element} container
 * @param {string} text - Inner text that'll be created/cloned
 * @param {string} id - Id of the element that'll be created
 * @param {Element} template - Element that'll be cloned to create a new one
 * @param {string} href
 */
function addElement(container, text, id=null, template=null, href=null) {
    let elem = document.createElement('div');

    if(template != null) {
        elem = template.cloneNode(true);
    }

    if(text == null || text.length == 0) {
        return;
    }

    let elem_id = getId(id);
    
    if(elem_id == null) {
        elem.removeAttribute("id");
    }
    else {
        elem.id = elem_id;
    }

    elem.innerText = text;

    if(href != null) {
        elem.href = href;
    }

    container.appendChild(elem);
}

function getOffset(el) {
    const rect = el.getBoundingClientRect();
    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY
    };
}

async function load_random_chapter() {
    let todays_book_id = localStorage.getItem("todays_book_id");
    let todays_chapter_number = localStorage.getItem("todays_chapter_number");
    let todays_chapter_date = localStorage.getItem("todays_chapter_date");

    let book_id = todays_book_id;
    let chapter_number = todays_chapter_number;
    let current_url = new URL(window.location.href);
    let language = getSearchParameterOrDefault(current_url, "language");

    let current_date = (new Date()).today();

    if(current_date != todays_chapter_date) {
        const booksData = await getFileContent(language);
        let bookIndex = randIntBetween(0, booksData.books.length -1);
        let book = booksData.books[bookIndex];

        book_id = book.id;
        chapter_number = randIntBetween(1, book.num_chapters);

        localStorage.setItem("todays_book_id", book_id);
        localStorage.setItem("todays_chapter_number", chapter_number);
        localStorage.setItem("todays_chapter_date", current_date);
    }

    window.location.href = `/biblia-pwa/pages/chapter_read.html?language=${language}&book_id=${book_id}&chapter_number=${chapter_number}`
}