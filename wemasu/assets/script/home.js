"use strict";
import * as cookie from "./cookie.js";

window.onload = async () => {
    const result = await fetch("./index.json")
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
        });
    init();
};

function init() {
    // DOM Elements
    const welcome = document.querySelector("#welcome");

    const user = cookie.getCookie("name");
    welcome.innerHTML = `Welcome ${user}`;
}
