function updatePageTitleAndBookName(chaptersData) {
    document.title = `${chaptersData.book.book_name}`;

    book_name.innerText = chaptersData.book.book_name;

    if(chaptersData.book.book_full_name != chaptersData.book.book_name) {
        book_subname.innerText = chaptersData.book.book_full_name;
    }
}

function updateChaptersSection(container, chaptersData){
    let book_id = chaptersData.book.id;
    let chapters = chaptersData.chapters.sort((a, b) => a.chapter_number - b.chapter_number);

    for(const chapter of chapters) {
        let chapter_full_name = chapter.chapter_number;
        let chapter_elem_id = `chapter_${chapter.chapter_number}`;
        let chapter_href = `/pages/chapter_read.html?book_id=${book_id}&chapter_number=${chapter.chapter_number}`

        if(chapter.chapter_title != null && chapter.chapter_title != "") {
            chapter_full_name += " - " + chapter.chapter_title;
        }

        chapter_full_name += "\n";
        addElement(container, chapter_full_name, chapter_elem_id, template_chapter_name_list, chapter_href)
    }
}


let current_url = new URL(window.location.href);
let language = getSearchParameterOrDefault(current_url, "language");
let book_id = getSearchParameterOrDefault(current_url, "book_id");

window.onload = async function() {
    const chaptersData = await getFileContent(language, book_id);

    updatePageTitleAndBookName(chaptersData)
    updateChaptersSection(chapter_selection, chaptersData);
}