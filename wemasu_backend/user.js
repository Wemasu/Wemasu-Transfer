class User {
  #name;
  #passwordHash;
  #files = [];

  constructor(name, passwordHash = "secret", files = []) {
    this.#name = name;
    this.#passwordHash = passwordHash;
    this.#files = files;
  }

  get name() {
    return this.#name;
  }

  get passwordHash() {
    return this.#passwordHash;
  }

  get files() {
    return this.#files;
  }

  set files(files) {
    this.#files = files;
  }

  addFile(file) {
    this.#files.forEach((f) => {
      if (file.uploadPath === f.uploadPath) throw new Error("File already exists");
    });
    this.#files.push(file);
  }

  getFile(fileName) {
    let file;
    this.#files.forEach((f) => {
      if (f.fileName === fileName) {
        file = f;
      }
    });
    if (!file) throw new Error(`File doesn't exist`);
    else return file;
  }

  toJSON() {
    return {
      name: this.#name,
      passwordHash: this.#passwordHash,
      files: this.#files,
    };
  }
}

module.exports = User; // export class
