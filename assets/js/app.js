let clips = {};

async function fetchClips() {
    document.getElementById("loading").style.display = "";
    clips = {};
    for (let i = 0; i < await (await fetch("/clips/count")).text(); i++)
        clips[num(i)] = await (await fetch("/clips/" + num(i) + "/meta.json")).json();
    localStorage.setItem("clipMeta", JSON.stringify(clips));
    browserAll();
    document.getElementById("loading").style.display = "none";
}

function browserAll() {
    let items = [];
    for (let movie of Object.keys(clips))
        if (Object.keys(clips[movie]).length > 0)
            items.push(createItem("Movie " + movie, "/clips/" + movie + "/01.webp", () => query(movie + "/*")));
    setItems(items);
}

function browserQuery(query) {
    if (query === "") {
        browserAll();
        return;
    }
    let items = [];
    if((m = query.match(/^(\*|\d)$/)))
        query = m[1] + "*/*";
    else if((m = query.match(/^([*\d]{2})\/?$/)))
        query = m[1] + "/*";
    if ((match = query.match(/^(\*|[*0-9]{2})\/(\*|[*0-9]{2})$/))) {
        for (let movie of parseClipQuery(Object.keys(clips), match[1]))
            if (clips[movie][getLanguage()] !== undefined)
                for (let clip of parseClipQuery(Object.keys(clips[movie][getLanguage()]), match[2]))
                    items.push(createItem(movie + "/" + clip, "/clips/" + movie + "/" + clip + ".webp", () => playClip(movie, clip)))
    } else {
        for (let movie of Object.keys(clips))
            if (clips[movie][getLanguage()] !== undefined)
                clipLoop:
                    for (let clip of Object.keys(clips[movie][getLanguage()])) {
                        let item = createItem(movie + "/" + clip, "/clips/" + movie + "/" + clip + ".webp", () => playClip(movie, clip));
                        if (clips[movie][getLanguage()][clip].transcript.toLowerCase().replaceAll(/[:.,!?-]+/g, "").includes(query.toLowerCase())) {
                            items.push(item);
                            continue;
                        }
                        for (let tag of clips[movie][getLanguage()][clip].tags)
                            if (tag.toLowerCase().includes(query.toLowerCase())) {
                                items.push(item);
                                continue clipLoop;
                            }
                    }
    }
    setItems(items);
}

let pushStateTimeout = -1;

function query(query) {
    let search = parseLocationSearch();
    if (search.query === undefined || search.query !== query) {
        if (pushStateTimeout !== -1)
            clearTimeout(pushStateTimeout);
        pushStateTimeout = setTimeout(() => {
            history.pushState("query", null, query === "" ? "/" : "?query=" + query);
            pushStateTimeout = -1;
        }, 1000);
    }
    let queryField = document.getElementById("query");
    if (queryField.value !== query)
        queryField.value = query;
    browserQuery(query);
}
