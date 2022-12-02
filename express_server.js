const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

// helper functions
const { generateRandomString, getUserByEmail, verifyID, urlsForUser } = require('./helpers');

// 'databases'
let users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  e91vn9: {
    id: "e91vn9",
    email: "pedrokl@hotmail.com",
    password: "$2a$10$vQtba4/w/vN4LAwlRWwqtum/7wDWVKpliusxHnurLyMi5vNwuF/yq"
  }
};

let urlDatabase = {
  b2xVn2: {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'e91vn9',
  },
  '9sm5xK': {
    longURL: 'http://www.google.ca',
    userID: 'userRandomID',
  },
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  secret: 'this-is-my-secret'
}));
app.set('view engine', 'ejs');

// root
app.get('/', (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];

  if (user) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// display all urls
app.get('/urls', (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  const urls = urlsForUser(userID, urlDatabase);
  const templateVars = { urls, user };

  res.render('urls_index', templateVars);
});

// generate a new tiny url based to the long url
app.post("/urls", (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];

  if (user) {
    const longURL = req.body.longURL;
    const pageID = generateRandomString();
    urlDatabase[pageID] = { longURL, userID };
    res.redirect(`/urls/${pageID}`);
  } else {
    res.status(403).send('You have to be logged in to shorten URLs.');
  }
});

// display the new url template
app.get('/urls/new', (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];

  const templateVars = {
    user: user
  };

  if (user) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// delete a specific url
app.post('/urls/:id/delete', (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  const pageID = req.params.id;

  if (!verifyID(pageID, urlDatabase)) {
    res.status(404).send('The URL you tried to reach does not exist.\n');
  } else if (!user) {
    res.status(403).send('You should be logged in to see this page.\n');
  } else if (urlDatabase[pageID].userID !== userID) {
    res.status(403).send('You can only edit your URLs.');
  } else {
    delete urlDatabase[pageID];
    res.redirect('/urls');
  }
});

// display a page for a specific url
app.get('/urls/:id', (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  const pageId = req.params.id;
  const urls = urlsForUser(userID, urlDatabase);
  const templateVars = { urls, user, pageId };

  if (!user) {
    res.status(403).send('You should be logged in to see this page.');
  } else if (urlDatabase[pageId].userID !== userID) {
    res.status(403).send('You can only see your URLs.');
  } else {
    res.render(`urls_show`, templateVars);
  }
});

// edit a specific url
app.post('/urls/:id', (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  const pageID = req.params.id;
  const newURL = req.body.updateURL;

  if (!verifyID(pageID, urlDatabase)) {
    res.status(404).send('The URL you tried to reach does not exist.\n');
  } else if (!user) {
    res.status(403).send('You should be logged in to see this page.\n');
  } else if (urlDatabase[pageID].userID !== userID) {
    res.status(403).send('You can only edit your URLs.');
  } else {
    urlDatabase[pageID].longURL = newURL;
    res.redirect('/urls');
  }
});

// redirect to long URL
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;

  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send('The URL you tried to reach does not exist.');
  }
});

// display login template
app.get('/login', (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];

  if (user) {
    res.redirect('/urls');
  } else {
    res.render('urls_login', { user });
  }
});

// validate users credentials
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  let passwordMatch;
  if (user) passwordMatch = bcrypt.compareSync(password, user.password);

  if ((!email || !password)) {
    res.status(400).send("Email and password are required.");
  } else if (user && passwordMatch) {
    req.session.userID = user.id;
    res.redirect('/urls');
  } else {
    res.status(403).send("Your password is incorrect or this account doesn't exist.");
  }
});

// clear cookie and logs out
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// display register
app.get('/register', (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];

  if (user) {
    res.redirect('/urls');
  } else {
    res.render('urls_register', { user });
  }
});

// register new user
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = getUserByEmail(email, users);

  if ((!email || !password)) {
    res.status(400).send("Email and password are required.");
  } else if (user) {
    res.status(400).send("User already exists.");
  } else {
    const id = generateRandomString();
    users[id] = { id, email, password: hashedPassword };
    req.session.userID = id;
    res.redirect('/urls');
  }
});

// server listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});