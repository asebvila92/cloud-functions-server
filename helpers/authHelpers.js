const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwtConfig') // this file is not commited

function generateToken(data) {
  delete data.password;
  return jwt.sign(data, jwtConfig, {
    expiresIn: 864000 // 10 days
  });
}

function getUser(token) {
  try {
    if (token) {
      token = token.replace('Bearer ','');
      return jwt.verify(token, jwtConfig);
    }
    return null;
  } catch (err) {
    return null;
  }
} 

function isAuthenticated(token) {
  const user = getUser(token);
  return user !== null
}

module.exports = {
  generateToken,
  isAuthenticated
}