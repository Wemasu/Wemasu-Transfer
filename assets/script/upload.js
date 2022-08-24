"use strict";
import { backend, frontend } from "./serverLink.js";
import * as cookie from "./cookie.js";

window.onload = async () => {
  initCookies();
  init();
};

async function initCookies() {
  if (!cookie.getCookie("name")) {
    window.location = "../index.html";
  }
  if (cookie.getCookie("uploaded_file")) {
    //https://wemasu.uksouth.cloudapp.azure.com/
    const authorH = cookie.getCookie("hashedName");
    const authorNH = cookie.getCookie("name");
    const uploadedFile = cookie.getCookie("uploaded_file");

    let downloadUrl = "";

    await fetch(`${backend}/file-nh/${authorNH}/${uploadedFile}`)
      .then((res) => res.json())
      .then((file) => (downloadUrl = `${frontend}/file.html?userName=${authorH}&fileName=${file.hashedFileName}`));

    const downloadUrlEnc = encodeURI(downloadUrl);

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
    const hours = document.querySelector("#hours").value;
    upload(file, author, hours);
  });
  const user = cookie.getCookie("name");

  welcome.innerHTML = `${user}`;
  hidden_input_author.value = user;
}

function upload(file, author, hours) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("author", author);
  formData.append("hours", hours);
  fetch(`${backend}/upload`, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        document.querySelector("#error").innerHTML = `<p class="error">${data.error}</p>`;
      } else {
        storeUploadedFileInCookie(file);
        window.location.reload();
      }
    });
}

async function storeUploadedFileInCookie(file) {
  const cookie_lifetime = 10; // in seconds

  cookie.setCookie("uploaded_file", file.name, { "max-age": cookie_lifetime });
}

// logout button delete cookie
const logout = document.getElementById("logout");
logout.addEventListener("click", () => {
  if (window.confirm(`Do you want to logout?`)) {
    cookie.deleteCookie("name");
    window.location.reload();
  }
});
