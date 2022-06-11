function formatNumber(number, digitCount) {
    while(digitCount > (""+number).length)
        number = "0" + number;
    return number;
}

function num(number) {
    return formatNumber(number, 2);
}

function parseClipQuery(keys, clipQuery) {
    let iter = [];
    if (clipQuery === "*")
        iter = keys;
    else if (clipQuery.includes("*")) {
        for (let i = 0; i < 10; i++)
            if (keys.includes(j = clipQuery.replace("*", i)))
                iter.push(j);
    } else if (keys.includes(clipQuery))
        iter.push(clipQuery);
    return iter;
}

function parseLocationSearch() {
    let search = {};
    if(location.search !== "")
        for(let pair of location.search.substring(1).split("&"))
            search[pair.split("=")[0]] = pair.split("=")[1];
    return search;
}

Array.prototype.random = function () {
    return this[Math.floor((Math.random()*this.length))];
}

function getLanguage() {
    return localStorage.getItem("language") == null ? "de" : localStorage.getItem("language");
}
