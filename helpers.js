// generate a string with 6 random characters
const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let string = '';
  
  for (let i = 0; i < 6; i++) {
    string += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return string;
};

// receive an email and verify if there's an user registered with it
// if positive, return the user object, else return undefined
const getUserByEmail = (email, database) => {
  const keys = Object.keys(database);
  for (let userID of keys) {
    if (database[userID].email === email) return database[userID];
  }

  return undefined;
};

// receive an URL ID and check if it exists
const verifyID = (urlID, database) => {
  const keys = Object.keys(database);

  for (let key of keys) {
    if (key === urlID) return true;
  }

  return false;
};

// receive an user id and filter the URL database with user's URLS
const urlsForUser = (id, database) => {
  const urls = {};
  const keys = Object.keys(database);
  
  for (let urlID of keys) {
    if (database[urlID].userID === id) urls[urlID] = database[urlID];
  }

  return urls;
};

module.exports = { generateRandomString, getUserByEmail, verifyID, urlsForUser };