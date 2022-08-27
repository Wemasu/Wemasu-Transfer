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
}

function init() {
  // DOM Elements
  const welcome = document.querySelector("#welcome");
  const hidden_input_author = document.querySelector("#author");
  const btn_upload = document.querySelector("#upload");
  const file_upload = document.querySelector("#file");

  file_upload.addEventListener("change", (e) => {
    document.querySelector("#latest_uploaded_file").innerHTML = "";
    document.querySelector("#error").innerHTML = "";
    e.preventDefault();
    const file = file_upload.files[0];
    const textFileSelected = (document.querySelector("#selected-file").textContent = file.name);
  });

  btn_upload.addEventListener("click", (e) => {
    e.preventDefault();
    const file = file_upload.files[0];
    // FRONTEND LIMIT FOR FILE SIZE
    if (file.size > 1073741824) {
      document.querySelector("#error").innerHTML = `<p class="error">File size is too large! Max 1GB</p>`;
      return;
    }
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
  const error = document.querySelector("#error");
  const latest = document.getElementById("latest_uploaded_file");

  const req = new XMLHttpRequest();
  req.open(`POST`, `${backend}/upload`);
  req.upload.addEventListener(`progress`, (e) => {
    console.log(`uploading ${(e.loaded / e.total) * 100}%`);
    const div = document.querySelector("#latest_uploaded_file");
    div.innerHTML = `<p id="download_url">${Math.floor((e.loaded / e.total) * 100)}%</p>`;
  });

  req.addEventListener(`load`, () => {
    const test = JSON.parse(req.response);
    if (req.status === 500) {
      error.innerHTML = `<p class="error">${test.error}</p>`;
    }
    if (req.status === 200) {
      const file = JSON.parse(req.response).file;
      const authorH = cookie.getCookie("hashedName");
      const downloadUrl = encodeURI(`${frontend}/file.html?userName=${authorH}&fileName=${file.hashedFileName}`);

      // DISPLAY LINK TEXT
      const p = document.createElement("p");
      p.textContent = "File uploaded!";
      p.setAttribute("id", "download_url");

      // // COPY LINK BUTTON
      const btn = document.createElement("button");
      btn.textContent = "Copy download URL";
      btn.onclick = () => {
        navigator.clipboard.writeText(downloadUrl);
        btn.textContent = "Copied to clipboard";
      };

      // // ELEMENT TO INSERT IN TO
      const div = document.querySelector("#latest_uploaded_file");
      div.innerHTML = "";

      // // APPEND
      div.appendChild(p);
      div.appendChild(btn);
    }
  });

  req.send(formData);
}

// logout button delete cookie
const logout = document.getElementById("logout");
logout.addEventListener("click", () => {
  if (window.confirm(`Do you want to logout?`)) {
    cookie.deleteCookie("name");
    window.location.reload();
  }
});
