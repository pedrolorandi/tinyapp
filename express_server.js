const { render } = require('ejs');
const express = require('express');
const cookieParser = require('cookie-parser');
const e = require('express');
const app = express();
const PORT = 8080;

// helper functions
// generate a string with 6 random characters
const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let string = '';
  
  for (let i = 0; i < 6; i++) {
    string += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return string;  
}

// receive an email and verify if there's an user registered with it
// if positive, return the user object, else return undefined
const getUserByEmail = (email, database) => {
  const keys = Object.keys(database);

  for (let key of keys) {
    if (database[key].email === email) return database[key]
  }

  return undefined;
}

// receive a user object and a password and verify if it matches
// if positive, return true, else return false
const verifyUser = (user, password) => {
  return user.password === password ? true : false;
}

// receive an user id and filter the URL database with user's URLS
const urlsForUser = (id) => {
  const urls = {};
  const keys = Object.keys(urlDatabase);
  
  for (let key of keys) {
    if (urlDatabase[key].userID === id) urls[key] = urlDatabase[key]
  }

  return urls;
};

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
    password: "123456" 
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
app.use(cookieParser());
app.set('view engine', 'ejs');

// root
// TODO: define initial route
app.get('/', (req, res) => {
  res.send('Hello!');
});

// display all urls
app.get('/urls', (req, res) => {  
  const userId = req.cookies['user_id'];
  const user = users[userId];
  const urls = urlsForUser(userId)
  const templateVars = { urls, user };

  res.render('urls_index', templateVars)
});

// generate a new tiny url based to the long url
app.post("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];

  if (user) {
    const longURL = req.body.longURL;
    const key = generateRandomString();
    urlDatabase[key] = longURL;
    res.redirect(`/urls/${key}`);
  } else {
    res.status(403).send('You have to be logged in to shorten URLs.');
  }
});

// display the new url template
app.get('/urls/new', (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];

  const templateVars = { 
    user: user  
  };

  if (user) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }  
})

// delete a specific url
app.post('/urls/:id/delete', (req, res) => {
  const key = req.params.id;
  delete urlDatabase[key];
  res.redirect('/urls');
})

// display a page for a specific url
app.get('/urls/:id', (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];
  const pageId = req.params.id;
  const urls = urlsForUser(userId)
  const templateVars = { urls, user, pageId };

  // TODO: The individual URL pages should not be accesible if the URL does not belong to them.

  if (!user) {
    res.status(403).send('You should be logged in to see this page.');
  } else if (urlDatabase[pageId].userID !== userId) {
    res.status(403).send('You can only see your URLs.') 
  } else {
    res.render(`urls_show`, templateVars);
  }  
})

// edit a specific url
app.post('/urls/:id', (req, res) => {
  const key = req.params.id;
  const newURL = req.body.updateURL;
  urlDatabase[key] = newURL;  
  res.redirect('/urls');
})

// redirect to long URL
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];

  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send('The URL you tried to reach does not exist.');
  }
})

// display login template
app.get('/login', (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];

  const templateVars = { 
    user: user  
  };

  if (user) {
    res.redirect('/urls');
  } else {
    res.render('urls_login', templateVars)
  }  
})

// validate users credentials
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // verify if the email and password field are empty
  if ((!email || !password)) {
    res.status(400).send("Email and password are required.")
  }

  // verify if the email the user typed exits in the database, if not return undefined
  const user = getUserByEmail(email, users)

  // if there's an user and the user's password in the database is the same as the one they type, create a cookie and redirect the user 
  if (user && verifyUser(user, password)) {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  } else {
    res.status(403).send("Your password is incorrect or this account doesn't exist.");
  }
});

// clear cookie and logs out
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

// display register
app.get('/register', (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];

  const templateVars = { 
    user: user  
  };

  if (user) {
    res.redirect('/urls');
  } else {
    res.render('urls_register', templateVars)
  }  
});

// register new user
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // verify if the email and password field are empty
  if ((!email || !password)) {
    res.status(400).send("Email and password are required.");
  }

  // verify if the email the user typed exits in the database, if not return undefined
  const user = (getUserByEmail(email, users))

  // if the user exits, or there's no email or password, return bad request error, else register new user
  if (user) {
    res.status(400).send("User already exists.");
  } else {
    const id = generateRandomString();
    users[id] = { id, email, password };
    res.cookie('user_id', id)
    res.redirect('/urls');
  }
})

// server listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});