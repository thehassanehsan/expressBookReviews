const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Route handler for registering new customers onto the platform
public_users.post("/register", (req, res) => {
  const uname = req.body.username;
  const pword = req.body.password;

  // Validation step: Reject request if essential payload elements are missing
  if (!uname || !pword) {
    return res.status(404).json({ message: "Unable to register user." });
  }

  // Conflict verification step: Ensure unique username constraints are maintained
  const exists = users.some((u) => u.username === uname);
  if (exists) {
    return res.status(404).json({ message: "User already exists!" });
  }

  // Operation step: Commit credential data into storage array
  users.push({ username: uname, password: pword });
  return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
});

// Asynchronous root route handler designed to stream the complete library map via Promises
public_users.get('/', function (req, res) {
  new Promise((resOk) => {
    resOk(books);
  }).then((data) => {
    res.status(200).send(JSON.stringify(data, null, 4));
  });
});

// Promise-driven endpoint to fetch a explicit item layout mapped to its ISBN key
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

// Async route handler utilizing iterative indexing loops to filter items matching the target Author string
public_users.get('/author/:author', async function (req, res) {
  const queryAuth = req.params.author.toLowerCase();
  try {
    const keys = Object.keys(books);
    const out = [];
    
    // Sequential validation loop to extract nested object profiles safely
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

    // Response branch routing based on array payload resolution status
    if (out.length > 0) {
      return res.status(200).json(out);
    }
    return res.status(404).json({ message: "No books found by this author" });
  } catch (e) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Async route handler utilizing iterative indexing loops to filter items matching the target Title string
public_users.get('/title/:title', async function (req, res) {
  const queryTitle = req.params.title.toLowerCase();
  try {
    const keys = Object.keys(books);
    const out = [];

    // Memory-safe manual traversal pattern deployed across the local record footprint
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

    // Response execution matching programmatic filtering metrics
    if (out.length > 0) {
      return res.status(200).json(out);
    }
    return res.status(404).json({ message: "No books found with this title" });
  } catch (e) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Sync handler executing extraction routing parameters to check for user reviews data trees
public_users.get('/review/:isbn', function (req, res) {
  const targetIsbn = req.params.isbn;
  const match = books[targetIsbn];
  if (match) {
    return res.status(200).json(match.reviews);
  }
  return res.status(404).json({ message: "No reviews found for this book." });
});

module.exports.general = public_users;
