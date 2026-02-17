const MAX_RESULTS = 50;

async function performBibleSearch() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');

    if (!query || query.trim() === '') {
        var searchBar = document.getElementById('search-expandable');
        searchBar.classList.remove('hidden');
        return;
    }

    const searchQueryElement = document.getElementById('search_query');
    if (searchQueryElement) {
        searchQueryElement.textContent = 'Buscando por: "' + query + '"';
    }

    const currentUrl = new URL(window.location.href);
    const language = getSearchParameterOrDefault(currentUrl, 'language');

    try {
        const bibleData = await getFileContent(language);
        const results = [];

        let books = bibleData.books.sort((a, b) => a.book_number - b.book_number);

        for (const book of books) {
            for (const chapter of book.chapters) {
                for (const versicle of chapter.versicles) {
                    if (caseAndAccentInsensitiveSearch(versicle.text, query)) {
                        results.push({
                            book_id: book.id,
                            book_name: book.book_name,
                            chapter_number: chapter.chapter_number,
                            versicle_number: versicle.versicle_number,
                            text: versicle.text
                        });

                        if (results.length >= MAX_RESULTS) {
                            break;
                        }
                    }
                }
                if (results.length >= MAX_RESULTS) {
                    break;
                }
            }
            if (results.length >= MAX_RESULTS) {
                break;
            }
        }

        displayResults(results, query);
    } catch (error) {
        console.error('Error performing search:', error);
        displayResults([], query);
    }
}

function displayResults(results, query) {
    const searchQueryElement = document.getElementById('search_query');
    const resultCountElement = document.getElementById('result_count');
    if (searchQueryElement) {
        searchQueryElement.textContent = 'Buscando por: "' + query + '"';
    }

    const resultsContainer = document.getElementById('search_results');
    const noResultsElement = document.getElementById('no_results');

    if (!resultsContainer) return;

    resultCountElement.textContent = `${results.length} resultados encontrados`;

    if (results.length === 0) {
        if (noResultsElement) {
            noResultsElement.classList.remove('hidden');
        }
        return;
    }

    const maxResults = MAX_RESULTS;
    if (resultCountElement) {
        if (results.length >= maxResults) {
            resultCountElement.textContent = `Mostrando ${results.length} de ${maxResults}+ resultados`;
        }
    }

    const template = document.getElementById('template_search_result');
    const fragment = document.createDocumentFragment();

    for (const result of results) {
        const resultElement = template.cloneNode(true);
        resultElement.removeAttribute('id');
        resultElement.classList.remove('hidden');
        resultElement.href = `/biblia-pwa/pages/chapter_read.html?language=pt_br&book_id=${result.book_id}&chapter_number=${result.chapter_number}#v${result.chapter_number}.${result.versicle_number}`;
        
        const resultText = document.createElement('div');
        resultText.className = 'search_result_text';
        
        const bookChapter = document.createElement('span');
        bookChapter.className = 'search_result_book_chapter';
        bookChapter.textContent = `${result.book_name} ${result.chapter_number}:${result.versicle_number}`;
        
        const verseText = document.createElement('span');
        verseText.className = 'search_result_verse';
        verseText.textContent = removeNoteNotations(result.text);

        resultText.appendChild(bookChapter);
        resultText.appendChild(document.createElement('br'));
        resultText.appendChild(verseText);

        resultElement.appendChild(resultText);
        fragment.appendChild(resultElement);
    }

    resultsContainer.appendChild(fragment);
}

document.addEventListener('DOMContentLoaded', performBibleSearch);
