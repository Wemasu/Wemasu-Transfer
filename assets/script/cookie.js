// Code found at the following links:
// https://www.w3schools.com/js/js_cookies.asp
// https://javascript.info/cookie#reading-from-document-cookie
// Thanks to those guys for setting up those amazing functions

// returns the cookie with the given name,
// or undefined if not found
export function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// Creating cookie
export function setCookie(name, value, options = {}) {
    options = {
        path: "/",
        ...options,
    };

    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

    for (let optionKey in options) {
        updatedCookie += "; " + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
        }
    }
    document.cookie = updatedCookie;
}

// Deleting an existing cookie
export function deleteCookie(cname) {
    setCookie(cname, "", { "max-age": -1 });
}
