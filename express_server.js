const { render } = require('ejs');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let string = '';
  
  for (let i = 0; i < 6; i++) {
    string += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return string;  
}

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
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies['username']  
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
  const templateVars = {
    username: req.cookies['username']
  }
  res.render('urls_new', templateVars)
})

app.post('/urls/:id/delete', (req, res) => {
  const key = req.params.id;
  delete urlDatabase[key];
  res.redirect('/urls');
})

app.get('/urls/:id', (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    username: req.cookies['username'] 
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

app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('username', username)
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});