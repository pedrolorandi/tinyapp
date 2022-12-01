const { render } = require('ejs');
const express = require('express');
const cookieParser = require('cookie-parser');
const e = require('express');
const app = express();
const PORT = 8080;

// helper functions

const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let string = '';
  
  for (let i = 0; i < 6; i++) {
    string += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return string;  
}

const getUserByEmail = (email, database) => {
  const keys = Object.keys(database);

  for (let key of keys) {
    if (database[key].email === email) return database[key]
  }

  return undefined;
}

const verifyUser = (user, password) => {
  return user.password === password ? true : false;
}

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
};

let urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
}

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];

  const templateVars = { 
    urls: urlDatabase,
    user: user  
  };

  res.render('urls_index', templateVars)
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const key = generateRandomString();
  urlDatabase[key] = longURL;
  res.redirect(`/urls/${key}`);
});

app.get('/urls/new', (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];

  const templateVars = { 
    urls: urlDatabase,
    user: user  
  };

  res.render('urls_new', templateVars)
})

app.post('/urls/:id/delete', (req, res) => {
  const key = req.params.id;
  delete urlDatabase[key];
  res.redirect('/urls');
})

app.get('/urls/:id', (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];

  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    user: user  
  };

  res.render(`urls_show`, templateVars);
})

app.post('/urls/:id', (req, res) => {
  const key = req.params.id;
  const newURL = req.body.updateURL;
  urlDatabase[key] = newURL;  
  res.redirect('/urls');
})

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
})

// LOGIN
app.get('/login', (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];

  const templateVars = { 
    user: user  
  };

  res.render('urls_login', templateVars)
})


// validates users credentials
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // verifies if the email the user typed exits in the database, if not return undefined
  user = getUserByEmail(email, users)

  // if there's an user and the user's password in the database is the same as the one they type, create a cookie and redirect the user 
  if (user && verifyUser(user, password)) {
    res.cookie('user_id', user.id)
    res.redirect('/urls');
  } else {
    res.sendStatus(403);
  }
});

// LOGOUT
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

// REGISTER
app.get('/register', (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];

  const templateVars = { 
    urls: urlDatabase,
    user: user  
  };
  res.render('urls_register', templateVars)
})

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  user = (getUserByEmail(email, users))

  if (user || (!email || !password)) {
    res.sendStatus(400);
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