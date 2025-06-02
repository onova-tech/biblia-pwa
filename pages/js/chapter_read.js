function updatePageTitleAndBookName(data, language) {
    document.title = `${data.book.book_name} - ${data.chapter.chapter_number}`;

    let link = document.createElement('a');
    link.href = `/biblia-pwa/pages/chapter_selection.html?language=${language}&book_id=${data.book.id}`;
    link.innerText = data.book.book_name;
    book_name.appendChild(link); 

    if(data.chapter.chapter_number == 1 && data.chapter.book_full_name != data.book.book_name) {
        book_subname.innerText = data.book.book_full_name;
    }
}

function displayChapterTitleAndReference(container, data) {
    let chapter_title = `${data.chapter.chapter_number}`;
    let chapter_reference = data.chapter.chapter_reference;

    if(data.chapter.chapter_title != null && data.chapter.chapter_title != "") {
        chapter_title += ` - ${data.chapter.chapter_title}`;
    }

    addElement(container, chapter_title, null, template_chapter_title);
    addElement(container, chapter_reference, null, template_chapter_reference);
}

function displayChapterVersiclesAndSubtitles(container, data) {
    data.chapter.versicles.forEach(verse => {
        let verseText = `${verse.versicle_number}. ${verse.text}`;
        let subtitle = data.chapter.subtitles.filter((subtitle) => subtitle.next_versicle_id == verse.id)[0];

        if(subtitle != null && subtitle.text.length > 0) {
            addElement(container, subtitle.text, subtitle.id, template_chapter_subtitle);
        }

        addElement(container, verseText, verse.id, template_verse);
    });
}

function addNoteTooltips(container, data) {
    const noteRegexPattern = /(\{note:([0-9a-zA-Z]*)\})/g;
    const verses = document.querySelectorAll('.verse, .chapter_title ,.chapter_subtitle');
    const notes = data.chapter.notes ?? [];

    for(let verse of verses) {
        if(verse.innerHTML.includes("{note:")) {
            let matches = verse.innerHTML.matchAll(noteRegexPattern);

            for(const match of matches) {
                let note = notes.filter((note) => note.id == match[1])[0];

                if(note == null) {
                    continue;
                }

                let noteTooltip = document.createElement('div');
                let noteTooltipTag = document.createElement('sup');
                let noteTooltipText = document.createElement('span');
                noteTooltip.classList.add("note_tooltip");

                noteTooltipTag.innerText = match[2];
                noteTooltip.appendChild(noteTooltipTag);

                noteTooltipText.classList.add("note_tooltiptext_right");

                noteTooltipText.innerHTML = note.text;
                noteTooltip.appendChild(noteTooltipText);

                verse.innerHTML = verse.innerHTML.replace(note.id, `<div class="note_tooltip">${noteTooltip.innerHTML}</div>`);
            }

            for(const tooltipText of document.getElementsByClassName("note_tooltiptext_right")){
                if(getOffset(tooltipText).left + 200 >= window.innerWidth) {
                    tooltipText.classList.remove("note_tooltiptext_right");
                    tooltipText.classList.add("note_tooltiptext_left");
                    tooltipText.setAttribute("style", `margin-left: calc(-1 * (${tooltipText.clientWidth}px + 10px));`)

                    if(getOffset(tooltipText).left <= 0) {
                        tooltipText.setAttribute("style", `margin-left: calc(-1 * (${tooltipText.clientWidth}px - ${getOffset(tooltipText).left}px + 10px));`)
                    }
                }
            }
        }
    }
}

function setNavigationButtonsLink(data, language) {
    if(data.chapter.chapter_number <= 1) {
        prev_chapter_btn.classList.add("disabled");
    }
    else {
        prev_chapter_btn.href = `/biblia-pwa/pages/chapter_read.html?language=${language}&book_id=${data.book.id}&chapter_number=${data.chapter.chapter_number - 1}`
    }

    if(data.chapter.chapter_number >= data.book.num_chapters){
        next_chapter_btn.classList.add("disabled");
    }
    else {
        next_chapter_btn.href = `/biblia-pwa/pages/chapter_read.html?language=${language}&book_id=${data.book.id}&chapter_number=${data.chapter.chapter_number + 1}`
    }

}

let current_url = new URL(window.location.href);
let language = getSearchParameterOrDefault(current_url, "language");
let book_id = getSearchParameterOrDefault(current_url, "book_id");
let chapter_number = getSearchParameterOrDefault(current_url, "chapter_number");

window.onload = async function() {
    const jsonData = await getFileContent(language, book_id, chapter_number);
    
    chapter.innerHTML = "";

    updatePageTitleAndBookName(jsonData, language);
    displayChapterTitleAndReference(chapter, jsonData);
    displayChapterVersiclesAndSubtitles(chapter, jsonData);
    addNoteTooltips(chapter, jsonData);
    setNavigationButtonsLink(jsonData, language);
}