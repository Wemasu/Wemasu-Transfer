"use strict";
import * as cookie from "./cookie.js";

window.onload = () => {
    console.log(`Stephan heeft een dikke penis`);
    console.log("Penis");
    init();
};

function init() {
    // DOM Elements
    const btn_submit = document.querySelector("#submit");
    btn_submit.addEventListener("click", async (e) => {
        e.preventDefault();
        let credentials = await validateInput();
        if (credentials != undefined) {
            login(credentials[0], credentials[1]);
        }
    });
}

function validateInput() {
    // DOM Elements
    const inputs = document.getElementsByClassName("input");
    const field_name = document.querySelector("#name").value;
    const field_password = document.querySelector("#password").value;
    const dom_error = document.querySelector("#login-error-text");
    const div = document.getElementById("login-error");

    if (!field_name || !field_password) {
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
        // dom_error.style.display = "none";
    }
    return [field_name, field_password];
}

async function login(name, password) {
    console.log(name, password);

    setTimeout(function () {
        cookie.setCookie("name", name);
        window.location = "/home.html";
    }, 1000);
}
