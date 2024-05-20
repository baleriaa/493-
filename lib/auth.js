const jwt = require('jsonwebtoken');
const secretKey = 'SuperSecret';

function generateAuthToken(userID) {
  const payload = { sub: userID };

  return jwt.sign(payload, secretKey, { expiresIn: '24h' });
}

exports.generateAuthToken = generateAuthToken;
