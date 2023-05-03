const local = true;
let backend;
let frontend;

if (local) {
  backend = `http://localhost:1337`;
  frontend = `http://localhost`;
} else {
  backend = `https://wemasu.com:1337`;
  frontend = `https://wemasu.com`;
}

export { backend, frontend };
