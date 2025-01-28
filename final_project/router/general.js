const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(404).json({ message: "Error registering user" });
  }

  if (users.filter((user) => user.username === username).length > 0) {
    res.status(404).json({ message: "User already exists" });
  } else {
    users.push({ "username": username, "password": password });
    res.status(200).json({ message: "User registered successfully" });
  }
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.send(JSON.stringify(books));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    res.send(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const booksArray = Object.values(books);
  const authorBooks = booksArray.filter(book => book.author === author);

  if (authorBooks.length > 0) {
    res.send(authorBooks);
  } else {
    res.status(404).json({ message: "No books found for this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const booksArray = Object.values(books);
  const titleBooks = booksArray.filter(book => book.title === title);

  if (titleBooks.length > 0) {
    res.send(titleBooks);
  } else {
    res.status(404).json({ message: "No books found with this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbm = books[req.params.isbn];
  res.send(isbm.reviews);
});

module.exports.general = public_users;
