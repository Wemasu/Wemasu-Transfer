"use strict";
import * as cookie from "./cookie.js";

window.onload = () => {
    init();
    getAllUploads();
};

function init() {
    if (!cookie.getCookie("name")) {
        window.location = "../index.html";
    }
    // DOM ELEMENTS
    const welcome = document.querySelector("#welcome");

    const user = cookie.getCookie("name");
    welcome.textContent = user;
}

function getAllUploads() {
    const user = cookie.getCookie("name");
    const fetchUrl = `http://localhost:1337/uploads/${user}`;
    fetch(fetchUrl, { method: "GET" })
        .then((res) => res.json())
        .then((data) => displayUploads(data));
}

function displayUploads(uploads) {
    const div = document.querySelector("#uploads-container");

    uploads.forEach((upload, index) => {
        console.log(upload);
        // PREP DATA
        // FILENAME
        let fileName = upload.uploadPath;
        fileName = fileName.substring(fileName.lastIndexOf("/") + 1);

        // UPLOAD DATE
        let uploadDate = new Date(upload.uploadDate).toLocaleString();
        // EXPIRATION DATE
        let expirationDate = new Date(upload.expirationDate).toLocaleString();
        // DOWNLOAD LINK

        div.innerHTML += `<div id="upload">
            <h2 id="name">Name: ${fileName}</h2>
            <div id="dates">
            <p id="uploadDate">Uploaded: ${uploadDate}</p>
            <p id="expirationDate">Expires: ${expirationDate}</p>
            </div>
            <div id="buttons">
            <button id="share" class="share" data-filename="${fileName}">Share</button>
            <a href="http://localhost:1337/download?file=${fileName}" id="download">Download</a>
            </div>
            </div>`;
    });
    const buttons_share = document.querySelectorAll(".share");
    buttons_share.forEach((button) =>
        button.addEventListener("click", () => {
            navigator.clipboard.writeText(`http:localhost:1337/download?file=${button.dataset.filename}`);
            button.textContent = "Copied to clipboard";
            setTimeout(() => {
                button.textContent = "Share";
            }, 2000);
        })
    );
}
