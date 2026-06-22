const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req, res) => {
  const uname = req.body.username;
  const pword = req.body.password;

  if (!uname || !pword) {
    return res.status(404).json({ message: "Unable to register user." });
  }

  const exists = users.some((u) => u.username === uname);
  if (exists) {
    return res.status(404).json({ message: "User already exists!" });
  }

  users.push({ username: uname, password: pword });
  return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
});

public_users.get('/', function (req, res) {
  new Promise((resOk) => {
    resOk(books);
  }).then((data) => {
    res.status(200).send(JSON.stringify(data, null, 4));
  });
});

public_users.get('/isbn/:isbn', function (req, res) {
  const targetIsbn = req.params.isbn;
  
  new Promise((resOk, resErr) => {
    if (books[targetIsbn]) {
      resOk(books[targetIsbn]);
    } else {
      resErr({ status: 404, message: "Book not found" });
    }
  })
  .then((item) => res.status(200).json(item))
  .catch((error) => res.status(error.status).json({ message: error.message }));
});

public_users.get('/author/:author', async function (req, res) {
  const queryAuth = req.params.author.toLowerCase();
  try {
    const keys = Object.keys(books);
    const out = [];
    
    for (let i = 0; i < keys.length; i++) {
      const b = books[keys[i]];
      if (b.author.toLowerCase() === queryAuth) {
        out.push({
          isbn: keys[i],
          title: b.title,
          reviews: b.reviews
        });
      }
    }

    if (out.length > 0) {
      return res.status(200).json(out);
    }
    return res.status(404).json({ message: "No books found by this author" });
  } catch (e) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

public_users.get('/title/:title', async function (req, res) {
  const queryTitle = req.params.title.toLowerCase();
  try {
    const keys = Object.keys(books);
    const out = [];

    for (let i = 0; i < keys.length; i++) {
      const b = books[keys[i]];
      if (b.title.toLowerCase() === queryTitle) {
        out.push({
          isbn: keys[i],
          author: b.author,
          reviews: b.reviews
        });
      }
    }

    if (out.length > 0) {
      return res.status(200).json(out);
    }
    return res.status(404).json({ message: "No books found with this title" });
  } catch (e) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

public_users.get('/review/:isbn', function (req, res) {
  const targetIsbn = req.params.isbn;
  const match = books[targetIsbn];
  if (match) {
    return res.status(200).json(match.reviews);
  }
  return res.status(404).json({ message: "No reviews found for this book." });
});

module.exports.general = public_users;
