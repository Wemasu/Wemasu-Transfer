class File {
    #uploadDate;
    #hours;
    #expirationDate;
    #author;
    #uploadPath;

    constructor(uploadDate, hours = 24, author, uploadPath) {
        this.#uploadDate = uploadDate;
        this.#hours = hours;
        this.#expirationDate = new Date(uploadDate.getTime() + this.#hours * 60 * 60 * 1000);
        this.#author = author;
        this.#uploadPath = uploadPath;
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

    toJSON() {
        return {
            author: this.#author,
            uploadDate: this.#uploadDate,
            hours: this.#hours,
            expirationDate: this.#expirationDate,
            uploadPath: this.#uploadPath,
        };
    }
}

module.exports = File; // export class
