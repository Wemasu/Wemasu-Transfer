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
    const hidden_input_user = document.querySelector("#user");

    const user = cookie.getCookie("name");

    welcome.innerHTML = `Welcome ${user}`;
    hidden_input_user.value = user;
}
