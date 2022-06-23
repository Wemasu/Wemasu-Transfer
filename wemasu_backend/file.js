class File {
  #uploadDate;
  #hours;
  #expirationDate;
  #author;
  #uploadPath;
  #fileName;
  #fileSize;

  constructor(uploadDate, hours = 24, author, uploadPath, fileName, fileSize) {
    this.#uploadDate = uploadDate;
    this.#hours = hours;
    this.#expirationDate = new Date(uploadDate.getTime() + this.#hours * 60 * 60 * 1000);
    this.#author = author;
    this.#uploadPath = uploadPath;
    this.#fileName = fileName;
    this.#fileSize = fileSize;
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

  toJSON() {
    return {
      author: this.#author,
      uploadDate: this.#uploadDate,
      hours: this.#hours,
      expirationDate: this.#expirationDate,
      uploadPath: this.#uploadPath,
      fileName: this.#fileName,
      fileSize: this.#fileSize,
    };
  }
}

module.exports = File; // export class
