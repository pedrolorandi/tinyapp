const { assert } = require('chai');

const { getUserByEmail, verifyID, urlsForUser } = require('../helpers.js');

const testUsers = {
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

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    
    assert.strictEqual(user.id, expectedUserID);
  });
  it('should return undefined with a non-valid email', () => {
    const user = getUserByEmail("nonvalid@email.com", testUsers);
    
    assert.strictEqual(user, undefined);
  });
  it('should return undefined with a non-valid database', () => {
    const user = getUserByEmail('user@example.com', {});

    assert.strictEqual(user, undefined);
  });
});

const urlDatabase = {
  b2xVn2: {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'e91vn9',
  },
  '9sm5xK': {
    longURL: 'http://www.google.ca',
    userID: 'userRandomID',
  },
};

describe('verifyID', () => {
  it('should return true for a valid URL ID', () => {
    const url = verifyID('b2xVn2', urlDatabase);

    assert.isTrue(url);
  });
  it('should return false for a non-valid URL ID', () => {
    const url = verifyID('test', urlDatabase);

    assert.isFalse(url);
  });
  it('should return false for a non-valid database', () => {
    const url = verifyID('b2xVn2', {});

    assert.isFalse(url);
  });
});

describe('urlsForUser', () => {
  it('should return an object with URLS for a valid user', () => {
    const urls = urlsForUser('userRandomID', urlDatabase);

    assert.deepEqual(urls, { '9sm5xK': { longURL: "http://www.google.ca", userID: "userRandomID" }});
  });
  it('should return an empty object for a non-valid user', () => {
    const urls = urlsForUser('non-valid', urlDatabase);

    assert.deepEqual(urls, {});
  });
  it('should return an empty object for a non-valid database', () => {
    const urls = urlsForUser('userRandomID', {});

    assert.deepEqual(urls, {});
  });
});