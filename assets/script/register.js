"use strict";
import { backend } from "./serverLink.js";
import * as cookie from "./cookie.js";

window.onload = () => {
  init();
};

function init() {
  // DOM Elements
  const btn_submit = document.querySelector("#submit");
  btn_submit.addEventListener("click", async (e) => {
    e.preventDefault();
    let credentials = await validateInput();
    if (credentials != undefined) {
      register(credentials[0], credentials[1], credentials[2]);
    }
  });
}

function validateInput() {
  // DOM Elements
  const inputs = document.getElementsByClassName("input");
  const field_name = document.querySelector("#name").value;
  const field_password = document.querySelector("#password").value;
  const registerCode = document.getElementById("registerCode").value;
  const dom_error = document.querySelector("#login-error-text");

  if (!field_name || !field_password || !registerCode) {
    let htmlInputsMissing = "";
    for (let input of inputs) {
      if (!input.value) {
        htmlInputsMissing += `${input.name}, `;
      }
    }
    dom_error.innerHTML = `Make sure you have filled in the following:  ${htmlInputsMissing.slice(0, htmlInputsMissing.length - 2)}`;
    return;
  } else {
    dom_error.innerHTML = "";
  }
  return [field_name, field_password, registerCode];
}

function register(name, passwordHash, registerCode) {
  fetch(`${backend}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: name.toLowerCase(), passwordHash, registerCode }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        const dom_error = document.querySelector("#login-error-text");
        dom_error.innerHTML = data.error;
        return;
      }
    });
}