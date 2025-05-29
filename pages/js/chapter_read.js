function updatePageTitleAndBookName(data) {
    document.title = `${data.book.book_name} - ${data.chapter.chapter_number}`;

    book_name.innerText = data.book.book_name;

    if(data.chapter.chapter_number == 1 && data.chapter.book_full_name != data.book.book_name) {
        book_subname.innerText = data.book.book_full_name;
    }
}

function displayChapterTitleAndReference(container, data) {
    let chapter_title = data.chapter.chapter_title;
    let chapter_reference = data.chapter.chapter_reference;

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
    const verses = document.getElementsByClassName('verse');
    const notes = data.chapter.notes ?? [];
    let   adjustedNotes = [];

    for(let index = 0; index < notes.length; index++) {
        adjustedNotes[index] = {};
        adjustedNotes[index].id = notes[index].id;
        adjustedNotes[index].text = notes[index].text.replace(noteRegexPattern, "<sup>$2</sup>");
    }

    for(let verse of verses) {
        if(verse.innerHTML.includes("{note:")) {
            let matches = verse.innerHTML.matchAll(noteRegexPattern);

            for(const match of matches) {
                let note_id = notes.filter((note) => note.text.includes(match[1]))[0].id;
                let adjustedNote = adjustedNotes.filter((adjNote) => adjNote.id == note_id)[0];
                let noteTooltip = document.createElement('div');
                let noteTooltipTag = document.createElement('sup');
                let noteTooltipText = document.createElement('span');
                noteTooltip.classList.add("note_tooltip");

                noteTooltipTag.innerText = match[2];
                noteTooltip.appendChild(noteTooltipTag);

                noteTooltipText.classList.add("note_tooltiptext")
                noteTooltipText.innerHTML = adjustedNote.text;
                noteTooltip.appendChild(noteTooltipText);

                verse.innerHTML = verse.innerHTML.replace(match[1], `<div class="note_tooltip">${noteTooltip.innerHTML}</div>`);
            }
        }
    }
}

let current_url = new URL(window.location.href);
let language = getSearchParameterOrDefault(current_url, "language");
let book_id = getSearchParameterOrDefault(current_url, "book_id");
let chapter_number = getSearchParameterOrDefault(current_url, "chapter_number");

window.onload = async function() {
    const jsonData = await getFileContent(language, book_id, chapter_number);
    
    chapter.innerHTML = "";

    updatePageTitleAndBookName(jsonData);
    displayChapterTitleAndReference(chapter, jsonData);
    displayChapterVersiclesAndSubtitles(chapter, jsonData);
    addNoteTooltips(chapter, jsonData);
}