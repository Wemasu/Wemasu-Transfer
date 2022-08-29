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
  detectLogout();
  detectFileChange();
  welcomeUser();
  detectClick();
  initiateEnterEventListener();
}

// UPLOAD FILE
async function upload(file, author, hours) {
  const validation = await validate(file, author, hours);
  if (validation) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("author", author);
    formData.append("hours", hours);

    const req = new XMLHttpRequest();
    req.open(`POST`, `${backend}/upload`);

    // LISTEN FOR AND SHOW UPLOAD PROGRESS
    req.upload.addEventListener(`progress`, (e) => {
      showProgress(((e.loaded / e.total) * 100).toFixed(0));
    });

    // LISTEN FOR AND SHOW UPLOAD FINISHED
    req.addEventListener(`load`, () => {
      const response = JSON.parse(req.response);
      if (req.status === 500) {
        showError(response.error);
      }
      if (req.status === 200) {
        const file = JSON.parse(req.response).file;
        const authorH = cookie.getCookie("hashedName");
        const downloadUrl = encodeURI(`${frontend}/file.html?userName=${authorH}&fileName=${file.hashedFileName}`);
        showUpload(downloadUrl);
      }
    });

    req.send(formData);
  }
}

// SHOW UPLOADED FILE
function showUpload(downloadUrl) {
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

// SHOW UPLOAD ERROR
function showError(error) {
  const div = document.querySelector("#latest_uploaded_file");
  const HTMLerror = document.querySelector("#error");
  div.innerHTML = ``;
  HTMLerror.innerHTML = `<p class="error">${error}</p>`;
}

// SHOW UPLOAD PROGRESS
function showProgress(progress) {
  const div = document.querySelector("#latest_uploaded_file");
  div.innerHTML = `<p id="download_url">${progress}%</p>`;
}

// LOGOUT
function detectLogout() {
  const logout = document.getElementById("logout");
  logout.addEventListener("click", () => {
    if (window.confirm(`Do you want to logout?`)) {
      cookie.deleteCookie("name");
      window.location.reload();
    }
  });
}

// ENTER KEY INPUT
function initiateEnterEventListener() {
  const submit = document.getElementById("upload");
  window.addEventListener("keyup", (e) => {
    e.preventDefault();

    if (e.key === `Enter`) {
      submit.click();
    }
  });
}

// DETECT UPLOAD CLICK
function detectClick() {
  const file_upload = document.querySelector("#file");
  const btn_upload = document.querySelector("#upload");
  const hidden_input_author = document.querySelector("#author");
  btn_upload.addEventListener("click", (e) => {
    e.preventDefault();
    const file = file_upload.files[0];
    const author = hidden_input_author.value;
    const hours = document.querySelector("#hours").value;
    upload(file, author, hours);
  });
}

// WELCOME USER
function welcomeUser() {
  const welcome = document.querySelector("#welcome");
  const hidden_input_author = document.querySelector("#author");
  const user = cookie.getCookie("name");
  welcome.innerHTML = `${user}`;
  hidden_input_author.value = user;
}

// RESET HTML
function resetHTML() {
  document.querySelector("#latest_uploaded_file").innerHTML = "";
  document.querySelector("#error").innerHTML = "";
}

//DETECT FILE CHANGE
function detectFileChange() {
  const file_upload = document.querySelector("#file");
  file_upload.addEventListener("change", (e) => {
    resetHTML();
    e.preventDefault();
    const file = file_upload.files[0];
    document.querySelector("#selected-file").textContent = file.name;
  });
}

// GET USER FILENAMES
async function getUserFileNames(author) {
  return new Promise((resolve) => {
    const fetchUrl = `${backend}/files/${author.toLowerCase()}`;
    fetch(fetchUrl, { method: "GET" })
      .then((res) => res.json())
      .then((files) => {
        if (files.error) {
          const div = document.querySelector("#error");
          div.style.display = "block";
          div.innerHTML = `<p class="error">${data.error}</p>`;
          resolve(-1);
        } else {
          resolve(files);
        }
      });
  });
}

// GET FREE SPACE LEFT
async function getFreeSpace() {
  return new Promise((resolve) => {
    fetch(`${backend}/getBytesLeft`, { method: "GET" })
      .then((res) => res.json())
      .then((res) => {
        if (res.error) {
          console.log(`there was an error`);
          resolve(-1);
        } else resolve(res.bytes);
      });
  });
}

// VALIDATE FILE
async function validate(file, author, hours) {
  // CHECK FOR HOURS
  if (hours > 168) {
    showError(`Expiration time is too long! Max: 168 Hours(1 week)!`);
    return false;
  }
  // FRONTEND LIMIT FOR FILE SIZE
  if (file.size > 1073741824) {
    showError(`File is too large! 1GB max!`);
    return false;
  }
  const files = await getUserFileNames(author);
  const freeSpace = await getFreeSpace();
  if (files === -1 || freeSpace === -1) {
    showError(`Something went wrong`);
    return false;
  } else if (files.includes(file.name)) {
    showError(`File already exists!`);
    return false;
  } else if (freeSpace - file.size < 0) {
    showError(`Not enough upload space left!`);
    return false;
  } else {
    return true;
  }
}
