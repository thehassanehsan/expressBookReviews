const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 7: Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    if (!users.some(user => user.username === username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Task 2 & 10: Get all books using Promises
public_users.get('/', function (req, res) {
  const getBooks = new Promise((resolve) => {
    resolve(books);
  });
  getBooks.then((booksList) => {
    res.status(200).send(JSON.stringify(booksList, null, 4));
  });
});

// Task 3 & 11: Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ status: 404, message: "Book not found" });
    }
  });
  getBookByISBN
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(err.status).json({ message: err.message }));
});

// Task 4 & 12: Get book details based on author using Async/Await
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  const matchedBooks = Object.keys(books)
    .filter(key => books[key].author.toLowerCase() === author.toLowerCase())
    .map(key => ({ isbn: key, title: books[key].title, reviews: books[key].reviews }));
  if (matchedBooks.length > 0) {
    res.status(200).json(matchedBooks);
  } else {
    res.status(404).json({ message: "No books found by this author" });
  }
});

// Task 5 & 13: Get book details based on title using Async/Await
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  const matchedBooks = Object.keys(books)
    .filter(key => books[key].title.toLowerCase() === title.toLowerCase())
    .map(key => ({ isbn: key, author: books[key].author, reviews: books[key].reviews }));
  if (matchedBooks.length > 0) {
    res.status(200).json(matchedBooks);
  } else {
    res.status(404).json({ message: "No books found with this title" });
  }
});

// Task 6: Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.status(200).json(books[isbn].reviews);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
