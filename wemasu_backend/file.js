class File {
    #uploadDate;
    #hours;
    #expirationDate;

    constructor(uploadDate, hours = 24) {
        this.#uploadDate = uploadDate;
        this.#hours = hours;
        this.#expirationDate = new Date(
            uploadDate.getTime() + this.#hours * 60 * 60 * 1000
        );
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
}

module.exports = File // export class
