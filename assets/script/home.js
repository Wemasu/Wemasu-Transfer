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
  if (cookie.getCookie("latest_uploaded_file")) {
    const downloadUrl = `http://localhost:1337/download?file=${cookie.getCookie(
      "latest_uploaded_file"
    )}`;

    // DISPLAY LINK TEXT
    const p = document.createElement("p");
    p.textContent = downloadUrl;
    p.setAttribute("id", "download_url");

    // COPY LINK BUTTON
    const btn = document.createElement("button");
    btn.textContent = "COPY LINK";
    btn.onclick = navigator.clipboard.writeText(downloadUrl);

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
  btn_upload.addEventListener("click", (e) => {
    storeLatestUploadedFileInCookie();
  });

  const user = cookie.getCookie("name");

  welcome.innerHTML = `Welcome ${user}`;
  hidden_input_author.value = user;
}

function storeLatestUploadedFileInCookie() {
  // INPUTS
  const file = document.querySelector("#file").files;
  const author = document.querySelector("#author");

  cookie.setCookie("latest_uploaded_file", file[0].name);
}
