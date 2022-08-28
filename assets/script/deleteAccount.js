"use strict";
import * as cookie from "./cookie.js";
import { backend, frontend } from "./serverLink.js";

window.onload = () => {
  init();
};

function init() {
  if (!cookie.getCookie("name")) {
    window.location = "../index.html";
  }
  // DOM ELEMENTS
  const welcome = document.querySelector("#welcome");
  const user = cookie.getCookie("name");
  welcome.textContent = user;

  initiateEnterEventListener();
}

// logout button delete cookie
const logout = document.getElementById("logout");
logout.addEventListener("click", () => {
  if (window.confirm(`Do you want to logout?`)) {
    cookie.deleteCookie("name");
    window.location.reload();
  }
});

// delete account
const deleteButton = document.getElementById("delete");
deleteButton.addEventListener("click", async (e) => {
  e.preventDefault();
  let input = await validateInput();
  if (input != undefined) {
    deleteAccount(input[0], input[1]);
  }
});

function validateInput() {
  const password = document.querySelector("#password").value;
  const dom_error = document.querySelector("#login-error-text");

  if (!password) {
    dom_error.innerHTML = `Make sure you have filled in the following: Password`;
    return;
  } else {
    dom_error.innerHTML = "";
  }

  if (confirm(`Are you sure? This action is irreversible. All files wil be deleted.`)) {
    return [password, cookie.getCookie("name")];
  }
}

function deleteAccount(password, user) {
  const formData = new FormData();

  formData.append("password", password);
  formData.append("user", user);

  const req = new XMLHttpRequest();
  req.open(`POST`, `${backend}/deleteAccount`);

  req.addEventListener(`load`, () => {
    if (req.status === 200) {
      const succes = document.querySelector("#succes");
      succes.innerHTML = `<p>${req.response}</p>`;
      cookie.deleteCookie("name");
    }
    if (req.status === 500) {
      const error = document.querySelector("#login-error-text");
      const response = JSON.parse(req.response);
      error.innerHTML = `${response.error}`;
    }
  });

  req.send(formData);
}

// function deleteAccount(password, user) {
//   fetch(`${backend}/deleteAccount`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ password, user }),
//   })
//     .then((res) => res.json())
//     .then((data) => {
//       const dom_error = document.querySelector(`#login-error-text`);
//       if (data.error) {
//         const dom_error = document.querySelector(`#login-error-text`);
//         dom_error.innerHTML = data.error;
//         return;
//       }
//       dom_error.innerHTML = data;
//     })
//     .then(() => {
//       cookie.deleteCookie("name");
//       window.location.reload();
//     });
// }

function initiateEnterEventListener() {
  const submit = document.getElementById("delete");
  window.addEventListener("keyup", (e) => {
    e.preventDefault();

    if (e.key === `Enter`) {
      submit.click();
    }
  });
}
