const bcrypt = require("bcryptjs");
require("dotenv").config();

class File {
  #uploadDate;
  #hours;
  #expirationDate;
  #author;
  #uploadPath;
  #fileName;
  #fileSize;
  #hashedFileName;
  #downloads;

  constructor(uploadDate, hours = 24, author, uploadPath, fileName, fileSize) {
    this.#uploadDate = uploadDate;
    this.#hours = hours;
    this.#expirationDate = new Date(uploadDate.getTime() + this.#hours * 60 * 60 * 1000);
    this.#author = author;
    this.#uploadPath = uploadPath;
    this.fileName = fileName;
    this.#fileSize = fileSize;
    this.#hashedFileName = bcrypt.hashSync(this.#fileName, parseInt(process.env.FILE_SALT));
    this.#downloads = 0;
  }

  get uploadDate() {
    return this.#uploadDate;
  }

  get hours() {
    return this.#hours;
  }

  get expirationDate() {
    return this.#expirationDate;
  }

  get author() {
    return this.#author;
  }

  get uploadPath() {
    return this.#uploadPath;
  }

  get fileName() {
    return this.#fileName;
  }

  get fileSize() {
    return this.#fileSize;
  }

  get hashedFileName() {
    return this.#hashedFileName;
  }
  
  get downloads(){
    return this.#downloads;
  }

  set fileName(name) {
    if (name[0] === `.`) throw new Error(`File name can't start with a dot: ${name}`);
    this.#fileName = name;
  }

  set downloads(downloads){
    this.#downloads=downloads;
  }

  toJSON() {
    return {
      author: this.#author,
      uploadDate: this.#uploadDate,
      hours: this.#hours,
      expirationDate: this.#expirationDate,
      uploadPath: this.#uploadPath,
      fileName: this.#fileName,
      fileSize: this.#fileSize,
      hashedFileName: this.#hashedFileName,
      downloads: this.#downloads,
    };
  }
}

module.exports = File; // export class
