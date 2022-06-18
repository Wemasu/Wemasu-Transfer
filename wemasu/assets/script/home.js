"use strict";
import * as cookie from "./cookie.js";

window.onload = () => {
    init();
};

function init() {
    // DOM Elements
    const welcome = document.querySelector("#welcome");

    const user = cookie.getCookie("name");
    welcome.innerHTML = `Welcome ${user}`;
}
