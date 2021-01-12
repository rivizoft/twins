var limit = 2;
var page = 1;

document.addEventListener("DOMContentLoaded", () => {
    let options = {
        root: null,
        rootMargins: "0px",
        threshold: 0.5
    };
    const observer = new IntersectionObserver(handleIntersect, options);
    observer.observe(document.querySelector("footer"));
    getData();
});

function handleIntersect(entries) {
    if (entries[0].isIntersecting) {
        page++;
        document.getElementById("loading").style.visibility = 'visible';
        getData();
    }
}

function getData() {
    const path = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port;
    fetch(path + "/getStories?limit=" + limit + "&page=" + page)
        .then(response => response.json())
        .then(data => {
            document.getElementById("loading").style.visibility = 'hidden';
            if (data.length)
                data.forEach(item => {
                    var div = document.createElement("div");
                    div.innerHTML =
                        "<div class=\"col-lg-6 col-centered mb-4\">" +
                            "<div class=\"card shadow-sm\">" +
                                "<img class=\"card-img-top\" src=\"" + item.imageUrl + "\">" +
                                "<div class=\"card-body\">" +
                                    "<p class=\"card-text\">" + item.description + "</p>" +
                                    "<div class=\"d-flex justify-content-between align-items-center\">" +
                                        "<a href=\"story/" + item.id + "\" class=\"btn btn-outline-dark\">Читать</a>" +
                                        "<small class=\"text-muted\">" + item.author + "</small>" +
                                    "</div>" +
                                "</div>" +
                            "</div>" +
                        "</div>"
                    document.getElementById("mainDiv").appendChild(div);
                });
            else 
                page--;
        });
}