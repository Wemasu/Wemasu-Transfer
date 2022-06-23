"use strict";

window.onload = () => {
  //   init();
  getFile();
};

function getFile() {
  const urlParams = new URLSearchParams(window.location.search);
  const userName = urlParams.get("userName");
  const fileName = urlParams.get("fileName");
  console.log(userName);
  console.log(fileName);
  const fetchUrl = `http://localhost:1337/file/${userName}/${fileName}`;
  fetch(fetchUrl, { method: "GET" })
    .then((res) => res.json())
    .then((file) => {
      displayFile(file);
    });
}

function displayFile(file) {
  const div = document.getElementById("file-container");
  let timeleft = new Date(file.expirationDate).getTime() - new Date().getTime();
  timeleft = timeleft / 3600000;
  timeleft = timeleft.toFixed(2);
  let size = file.fileSize / 1000000;
  size = size.toFixed(3);
  div.innerHTML += `
  <div id="file">
  <h1>File: ${file.fileName}</h1>
  <h1>Uploader: ${file.author}</h1>
  <h1>Expires in: ${timeleft}h</h1>
  <h1>Size: ${size}MB</h1>
  <div id="button">
  <a href="http://localhost:1337/download?file=${file.fileName}" id="download">Download</a>
  </div>
  </div>
  `;
}
