"use strict";
import * as cookie from "./cookie.js";
import { backend, frontend } from "./serverLink.js";

window.onload = () => {
  init();
};

function init() {
  if (!cookie.getCookie("name")) {
    window.location = "./index.html";
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

// change password
const change = document.getElementById("submit");
change.addEventListener("click", async (e) => {
  e.preventDefault();
  let input = await validateInput();
  if (input != undefined) {
    changePassword(input[0], input[1], input[2], input[3]);
  }
});

function validateInput() {
  const inputs = document.getElementsByClassName("input");
  const oldPassword = document.querySelector("#oldPassword").value;
  const newPassword = document.querySelector("#newPassword").value;
  const repeatPassword = document.querySelector("#repeatPassword").value;
  const dom_error = document.querySelector("#login-error-text");
  const succes = document.querySelector("#succes");
  dom_error.innerHTML = "";
  succes.innerHTML = "";

  if (!oldPassword || !newPassword || !repeatPassword) {
    let htmlInputsMissing = "";
    for (let input of inputs) {
      if (!input.value) {
        htmlInputsMissing += `${input.name}, `;
      }
    }
    dom_error.innerHTML = `Make sure you have filled in the following: ${htmlInputsMissing.slice(0, htmlInputsMissing.length - 2)}`;
    return;
  } else if (newPassword !== repeatPassword) {
    dom_error.innerHTML = `Passwords don't match`;
    return;
  } else {
    dom_error.innerHTML = "";
  }
  return [oldPassword, newPassword, repeatPassword, cookie.getCookie("name")];
}

function changePassword(oldPassword, newPassword, repeatPassword, user) {
  const formData = new FormData();

  formData.append("oldPassword", oldPassword);
  formData.append("newPassword", newPassword);
  formData.append("repeatPassword", repeatPassword);
  formData.append("user", user);

  const req = new XMLHttpRequest();
  req.open(`POST`, `${backend}/changePassword`);

  req.addEventListener(`load`, () => {
    if (req.status === 200) {
      const succes = document.querySelector("#succes");
      succes.innerHTML = `<p>${req.response}</p>`;
    }
    if (req.status === 500) {
      const error = document.querySelector("#login-error-text");
      const response = JSON.parse(req.response);
      error.innerHTML = `${response.error}`;
    }
  });

  req.send(formData);
}

// function changePassword(oldPassword, newPassword, repeatPassword, user) {
//   fetch(`${backend}/changePassword`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ oldPassword, newPassword, repeatPassword, user }),
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
//     });
// }

function initiateEnterEventListener() {
  const submit = document.getElementById("submit");
  window.addEventListener("keyup", (e) => {
    e.preventDefault();

    if (e.key === `Enter`) {
      submit.click();
    }
  });
}
