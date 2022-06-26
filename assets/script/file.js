"use strict";

window.onload = () => {
    init();
};

function init() {
    getFile();
}

function getFile() {
    const urlParams = new URLSearchParams(window.location.search);
    const userName = encodeURIComponent(urlParams.get("userName"));
    const fileName = encodeURIComponent(urlParams.get("fileName"));
    const fetchUrl = `http://localhost:1337/file-h/${userName}/${fileName}`;
    fetch(fetchUrl, { method: "GET" })
        .then((res) => res.json())
        .then((file) => {
            displayFile(file);
        });
}

function displayFile(file) {
    const div = document.getElementById("file-container");
    let timeLeft = new Date(file.expirationDate).getTime() - new Date().getTime();
    timeLeft = timeLeft / 3600000;
    timeLeft = timeLeft.toFixed(2);
    let size = file.fileSize > 1000000 ? `${(file.fileSize / 1000000).toFixed(2)} MB` : `${(file.fileSize / 1000).toFixed(1)} KB`;

    // DOWNLOAD URL BUILD
    const urlParams = new URLSearchParams(window.location.search);
    const userName = encodeURIComponent(urlParams.get("userName"));
    const fileName = encodeURIComponent(urlParams.get("fileName"));

    div.innerHTML += `
  <div id="file">
    <h2 id="fileName">File Name: ${file.fileName}</h2>
    <h2 id="author">Author: ${file.author}</h2>
    <h2 id="timeLeft">Expires in: ${timeLeft}h</h2>
    <h2 id="size">${size}</h2>
  </div>
  <a href="http://localhost:1337/download?userName=${userName}&fileName=${fileName}" id="download">Download</a>
  
  `;
}
