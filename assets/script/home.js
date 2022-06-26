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
    if (cookie.getCookie("uploaded_file")) {
        //https://wemasu.uksouth.cloudapp.azure.com/
        const authorH = cookie.getCookie("author");
        const authorNH = cookie.getCookie("name");
        const uploadedFile = cookie.getCookie("uploaded_file");

        let downloadUrl = "";

        fetch(`http://localhost:1337/file-nh/${authorNH}/${uploadedFile}`)
            .then((res) => res.json())
            .then((file) => (downloadUrl = `http://127.0.0.1:5500/file.html?userName=${authorH}&fileName=${file.hashedFileName}`))

        // DISPLAY LINK TEXT
        const p = document.createElement("p");
        p.textContent = "File uploaded!";
        p.setAttribute("id", "download_url");

        // COPY LINK BUTTON
        const btn = document.createElement("button");
        btn.textContent = "Copy download URL";
        btn.onclick = () => {
            navigator.clipboard.writeText(downloadUrlEnc);
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

    file_upload.addEventListener("change", (e) => {
        e.preventDefault();
        const file = file_upload.files[0];
        const textFileSelected = (document.querySelector("#selected-file").textContent = file.name);
    });

    btn_upload.addEventListener("click", (e) => {
        e.preventDefault();
        const file = file_upload.files[0];
        const author = hidden_input_author.value;
        upload(file, author);
    });
    const user = cookie.getCookie("name");

    welcome.innerHTML = `${user}`;
    hidden_input_author.value = user;
}

function upload(file, author) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("author", author);
    fetch("http://localhost:1337/upload", {
        method: "POST",
        body: formData,
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.error) {
                document.querySelector("#error").innerHTML = `<p class="error">${data.error}</p>`;
            } else {
                storeUploadedFileInCookie(file, author);
            }
        });
}

function storeUploadedFileInCookie(file, author) {
    const cookie_lifetime = 10; // in seconds
    // Get user
    await fetch(`http://localhost:1337/user?name=${author}`, {
        method: "GET",
    })
        .then((res) => res.json())
        .then((user) => {
            cookie.setCookie("author", user.hashedName, { "max-age": cookie_lifetime });
        });


    cookie.setCookie("uploaded_file", file.name, { "max-age": cookie_lifetime });
    cookie.setCookie("author", author, { "max-age": cookie_lifetime });
}
