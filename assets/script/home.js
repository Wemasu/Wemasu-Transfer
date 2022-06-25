"use strict";
import * as cookie from "./cookie.js";

window.onload = async () => {
    initCookies();
    init();
};

function initCookies() {
    if (!cookie.getCookie("name")) {
        window.location = "../index.html";
    }
    if (cookie.getCookie("uploaded_file") && performance.getEntriesByType("navigation")[0].type === "navigate") {
        //https://wemasu.uksouth.cloudapp.azure.com/
        const author = cookie.getCookie("author");
        const uploadedFile = cookie.getCookie("uploaded_file");
        const downloadUrl = `http://127.0.0.1:5500/file.html?userName=${author}&fileName=${uploadedFile}`;

        // DISPLAY LINK TEXT
        const p = document.createElement("p");
        p.textContent = "File uploaded!";
        p.setAttribute("id", "download_url");

        // COPY LINK BUTTON
        const btn = document.createElement("button");
        btn.textContent = "Copy download URL";
        btn.onclick = () => {
            navigator.clipboard.writeText(downloadUrl);
            btn.textContent = "Copied to clipboard";
        };

        // ELEMENT TO INSERT IN TO
        const div = document.querySelector("#latest_uploaded_file");

        // APPEND
        div.appendChild(p);
        div.appendChild(btn);
    }
}

function init() {
    // DOM Elements
    const welcome = document.querySelector("#welcome");
    const hidden_input_author = document.querySelector("#author");
    const btn_upload = document.querySelector("#upload");
    const file_upload = document.querySelector("#file");

    file_upload.addEventListener("change", () => {
        const file = file_upload.files[0];
        const textFileSelected = (document.querySelector("#selected-file").textContent = file.name);
    });

    btn_upload.addEventListener("click", (e) => {
        storeUploadedFileInCookie();
    });
    const user = cookie.getCookie("name");

    welcome.innerHTML = `${user}`;
    hidden_input_author.value = user;
}

function storeUploadedFileInCookie() {
    // INPUTS
    const file = document.querySelector("#file").files;
    const author = document.querySelector("#author").value;
    const cookie_lifetime = 10; // in seconds

    cookie.setCookie("uploaded_file", file[0].name, { "max-age": cookie_lifetime });
    cookie.setCookie("author", author, { "max-age": cookie_lifetime });
}
