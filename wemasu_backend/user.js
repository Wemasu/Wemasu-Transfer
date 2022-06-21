class User {
  #name;
  #passwordHash;
  #files = [];

  constructor(name, passwordHash = "secret") {
    this.#name = name;
    this.#passwordHash = passwordHash;
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
    this.#files.push(file);
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
