"use strict";
import * as cookie from "./cookie.js";
import { backend, frontend } from "./serverLink.js";

window.onload = () => {
  init();
};

function init() {
  if (!cookie.getCookie("name")) {
    window.location = "../html/index.html";
  }
  // DOM ELEMENTS
  const welcome = document.querySelector("#welcome");
  const user = cookie.getCookie("name");
  welcome.textContent = user;

  getFreeSpace();
  setInterval(() => {
    getFreeSpace();
  }, 30000);
}

// logout button delete cookie
const logout = document.getElementById("logout");
logout.addEventListener("click", () => {
  if (window.confirm(`Do you want to logout?`)) {
    cookie.deleteCookie("name");
    window.location.reload();
  }
});

// GET CALCULATE AND SHOW FREE SPACE LEFT
function getFreeSpace() {
  fetch(`${backend}/getBytesLeft`, { method: "GET" })
    .then((res) => res.json())
    .then((res) => {
      if (res.error) console.log(`there was an error`);
      else showFreeSpace(res.bytes);
    });
}

function showFreeSpace(bytes) {
  const freeSpaceBar = document.getElementById("freeSpaceBar");
  const size =
    bytes > 1000000000 ? `${(bytes / 1000000000).toFixed(2)} GB` : bytes > 1000000 ? `${(bytes / 1000000).toFixed(2)} MB` : `${(bytes / 1000).toFixed(1)} KB`;
  updateFreeSpaceBar(bytes);
  const sizeUsed = 20000000000 - bytes;
  let sizeUsedDisplay =
    sizeUsed > 1000000000
      ? `${(sizeUsed / 1000000000).toFixed(2)} GB`
      : sizeUsed > 1000000
      ? `${(sizeUsed / 1000000).toFixed(2)} MB`
      : `${(sizeUsed / 1000).toFixed(1)} KB`;

  updateFreeSpaceBar(bytes);

  const freeSpaceNumber = document.getElementById("freeSpaceNumber");
  freeSpaceNumber.innerHTML = `Upload space used: ${sizeUsedDisplay}<br> Upload space free: ${size}`;
  const percentage = document.getElementById("freeSpacePercentage");
  percentage.innerHTML = `${100 - (bytes / 20000000000).toFixed(2) * 100}%`;
  // freeSpace.innerHTML = `Upload space left: ${size}`; ${100 - (bytes / 20000000000).toFixed(2) * 100}
}

function updateFreeSpaceBar(bytes) {
  document.getElementById("freeSpaceBar").style.width = `${100 - (bytes / 20000000000) * 100}%`;
}
