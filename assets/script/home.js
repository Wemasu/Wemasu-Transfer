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
    const btn_uploadFile = document.querySelector("#upload");

    btn_uploadFile.addEventListener("click", (e) => {
        e.preventDefault();
        const file = document.querySelector("#file").files[0];

        const formData = new FormData();

        formData.append("file", file, file.name);

        console.log(formData.get("file"));

        const data = { name: "dikkepenis" };
        const options = { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };
        // delete options.headers["Content-Type"];
        fetch("http://localhost:1337/upload", options);
    });

    const user = cookie.getCookie("name");
    welcome.innerHTML = `Welcome ${user}`;
}
