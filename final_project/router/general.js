const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

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

// Function to fetch book list using async-await
async function getBookListAsync(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error; // Re-throw the error for handling in the route
  }
}

public_users.get('/async', async function (req, res) {
  try {
    const bookList = await getBookListAsync('http://localhost:5000/'); //
    res.json(bookList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving book list" });
  }
});

public_users.get('/async/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const book = await getBookListAsync(`http://localhost:5000/isbn/${isbn}`);
    res.json(book);
  } catch (e) {
    res.status(500).json({ message: "Error retrieving book details" });
  }
});

public_users.get('/async/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const book = await getBookListAsync(`http://localhost:5000/author/${author}`);
    res.json(book);
  } catch (e) {
    res.status(500).json({ message: "Error retrieving book details" });
  }
});

public_users.get('/async/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const book = await getBookListAsync(`http://localhost:5000/title/${title}`);
    res.json(book);
  } catch (e) {
    res.status(500).json({ message: "Error retrieving book details" });
  }
});


module.exports.general = public_users;
