function createItem(title, image, onclick) {
    return {title: title, image: image, onclick: onclick};
}

function setItems(items) {
    let browser = document.getElementById("browser");
    while (browser.children.length > 0)
        browser.children[0].remove();
    items.sort((a, b) => a.title < b.title ? -1 : (a.title > b.title ? 1 : 0));
    for (let item of items) {
        let div = document.createElement("div");
        div.classList.add("item");
        div.onclick = item.onclick;
        let img = document.createElement("img");
        img.src = item.image;
        img.alt = "Preview Image";
        div.appendChild(img);
        let figcaption = document.createElement("figcaption");
        figcaption.innerText = item.title;
        div.appendChild(figcaption);
        browser.appendChild(div);
    }
    if (items.length === 0) {
        let div = document.createElement("div");
        div.innerText = "Deine Suche ergab keine Treffer.";
        div.style.margin = "40px auto";
        browser.appendChild(div);
    }
}

function playClip(movie, clip) {
    let overlay = document.createElement("div");
    overlay.classList.add("overlay");
    let inner = document.createElement("div");
    inner.classList.add("inner");
    let video = document.createElement("video");
    video.src = "/clips/" + movie + "/" + getLanguage() + "/" + clip + ".mp4";
    video.autoplay = true;
    video.onended = () =>
        overlay.remove();
    inner.appendChild(video);
    overlay.appendChild(inner);
    document.body.appendChild(overlay);
    document.body.classList.add("has-overlay");
    document.onkeydown = (e) => {
        if (e.key === "Escape")
            overlay.remove();
    };
}
