"use strict";
import { backend, frontend } from "./serverLink.js";
import * as cookie from "./cookie.js";
import { formatter } from "./expiredTimeFormatter.js";

window.onload = () => {
  init();
  getAllUploads();
};

function init() {
  if (!cookie.getCookie("name")) {
    window.location = "./index.html";
  }
  // DOM ELEMENTS
  const welcome = document.querySelector("#welcome");
  const user = cookie.getCookie("name");
  welcome.textContent = user;
}

function getAllUploads() {
  const user = cookie.getCookie("name");
  const fetchUrl = `${backend}/uploads/${user}`;
  fetch(fetchUrl, { method: "GET" })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        const div = document.querySelector("#error");
        div.style.display = "block";
        div.innerHTML = `<p class="error">${data.error}</p>`;
      } else {
        displayUploads(data);
      }
    });
}

function displayUploads(uploads) {
  const div = document.querySelector("#uploads-container");
  uploads.reverse();
  uploads.forEach((upload, index) => {
    // UPLOAD DATE
    let uploadDate = new Date(upload.uploadDate).toLocaleString();
    // EXPIRATION DATE
    let expirationDate = new Date(upload.expirationDate).toLocaleString();

    // TIME LEFT
    let timeLeft = new Date(upload.expirationDate).getTime() - new Date().getTime();
    timeLeft = formatter(timeLeft);

    // FILE SIZE
    let size = upload.fileSize > 1000000 ? `${(upload.fileSize / 1000000).toFixed(2)} MB` : `${(upload.fileSize / 1000).toFixed(1)} KB`;

    // Hashed author name
    const hashedName = cookie.getCookie("hashedName");

    // DOWNLOAD LINK
    const shareLink = encodeURI(`${frontend}/file.html?userName=${hashedName}&fileName=${upload.hashedFileName}`);

    div.innerHTML += `
            <div id="upload">
              <div id="upload-header">
                <h2 id="name">Name: ${upload.fileName}</h2>
                <h2 id="size">Size: ${size}</h2>
               </div> 
              <div id="dates">
                <p id="uploadDate">Uploaded: ${uploadDate}</p>
                <p id="timeLeft">Expires in: ${timeLeft}</p>
                <p id="expirationDate">Expires on: ${expirationDate}</p>
                
              </div>
              <div id="buttons">
                <button id="share" class="share" data-link="${shareLink + "f"}">Share</button>
                <a href="${backend}/download?userName=${hashedName}&fileName=${upload.hashedFileName + "f"}" id="download">Download</a>
                <button id="delete" class="delete" data-username="${hashedName}" data-filename="${upload.hashedFileName}">Delete</button> 
              </div>
            </div>`;
  });

  // EVENTLISTENERS
  const buttons_share = document.querySelectorAll(".share");
  buttons_share.forEach((button) =>
    button.addEventListener("click", () => {
      navigator.clipboard.writeText(`${button.dataset.link}`);
      //http:localhost:1337/download?file=${button.dataset.filename}
      button.textContent = "Copied to clipboard";
      setTimeout(() => {
        button.textContent = "Share";
      }, 2000);
    })
  );

  const buttons_delete = document.querySelectorAll(".delete");
  buttons_delete.forEach((button) => {
    button.addEventListener("click", () => {
      if (window.confirm(`Delete this file?`)) {
        deleteFile(button.getAttribute("data-username"), button.getAttribute("data-filename"));
      }
    });
  });
}

// logout button delete cookie
const logout = document.getElementById("logout");
logout.addEventListener("click", () => {
  if (window.confirm(`Do you want to logout?`)) {
    cookie.deleteCookie("name");
    window.location.reload();
  }
});

function deleteFile(userName, fileName) {
  fetch(`${backend}/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName: userName, fileName: fileName }),
  })
    .then((res) => {
      res.json();
    })
    .then((data) => {
      window.location.reload();
    })
    .catch((error) => console.error(`Something went wrong: `, error));
}
