"use strict";
import * as cookie from "./cookie.js";

window.onload = async () => {
  if (!cookie.getCookie("name")) {
    window.location = "../index.html";
  }
  init();
};

function init() {
  // DOM Elements
  const welcome = document.querySelector("#welcome");

  const user = cookie.getCookie("name");
  welcome.innerHTML = `Welcome ${user}`;
}
