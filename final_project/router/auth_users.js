const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  const user = users.some(obj => Object.values(obj).includes(username));
  return user;
}

const authenticatedUser = (username, password) => { //returns boolean
  const user = users.find(u => u.username === username && u.password === password);
  return !!user;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Please provide both username and password." });
  }

  // check if user is registered
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  // check if password is correct
  if (user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  // generate JWT token
  const accessToken = jwt.sign({ username: user.username }, 'your_secret_key');

  // save token in session
  req.session.accessToken = accessToken;

  // return success message with access token
  return res.json({ message: "Login successful.", accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.username;
  const isbn = req.params.isbn;
  const review = req.query.review;

  if (!review) {
    return res.status(400).json({ message: "Please provide a review." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // update review if user has already reviewed the book
  if (books[isbn].reviews[username]) {
    books[isbn].reviews[username].review = review;
    return res.json({ message: "Review updated successfully." });
  }

  // add review if user has not reviewed the book
  books[isbn].reviews[username] = { review };
  return res.json({ message: "Review added successfully." });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.username;
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  } else {
    delete books[isbn].reviews[username];
    return res.json({ message: "Review deleted successfully." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
