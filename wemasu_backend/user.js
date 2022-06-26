const bcrypt = require("bcryptjs");
require("dotenv").config();

class User {
    #name;
    #hashedName;
    #passwordHash;
    #files = [];

    constructor(name, passwordHash = "secret", files = []) {
        this.#name = name;
        this.#hashedName = bcrypt.hashSync(name, parseInt(process.env.USER_SALT));
        this.#passwordHash = passwordHash;
        this.#files = files;
    }

    get name() {
        return this.#name;
    }

    get hashedName() {
        return this.#hashedName;
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

    getHashedFile(hashedFileName) {
        let file;
        this.#files.forEach((f) => {
            if (bcrypt.compareSync(f.fileName, hashedFileName)) {
                file = f;
            }
        });
        return file;
    }

    removeFile(fileName) {
        let existsCheck = false;
        this.#files = this.#files.filter((f) => {
            if (f.fileName === fileName) {
                existsCheck = true;
                return false;
            } else {
                return true;
            }
        });
        if (!existsCheck) throw new Error(`${fileName} doesn't exist`);
    }

    toJSON() {
        return {
            name: this.#name,
            hashedName: this.#hashedName,
            passwordHash: this.#passwordHash,
            files: this.#files,
        };
    }
}

module.exports = User; // export class
