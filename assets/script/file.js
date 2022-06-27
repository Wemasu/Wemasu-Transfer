"use strict";
import { backend } from "./serverLink.js";

window.onload = () => {
  getFile();
};

function getFile() {
  const urlParams = new URLSearchParams(window.location.search);
  // No need to encode compoonents because already encoded @ home.js:~25
  const userName = encodeURIComponent(urlParams.get("userName"));
  const fileName = encodeURIComponent(urlParams.get("fileName"));
  const fetchUrl = `${backend}/file-h/${userName}/${fileName}`;
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

  // DOWNLOAD URL BUILD // No need to encode compoonents because already encoded @ home.js:~25
  const urlParams = new URLSearchParams(window.location.search);
  const userName = urlParams.get("userName");
  const fileName = urlParams.get("fileName");

  div.innerHTML += `
  <div id="file">
    <h2 id="fileName">File Name: ${file.fileName}</h2>
    <h2 id="author">Author: ${file.author}</h2>
    <h2 id="timeLeft">Expires in: ${timeLeft}h</h2>
    <h2 id="size">${size}</h2>
  </div>
  <a href="${backend}/download?userName=${userName}&fileName=${fileName}" id="download">Download</a>
  
  `;
}
