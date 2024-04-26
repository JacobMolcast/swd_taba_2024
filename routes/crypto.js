const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

const secret_key = process.env.SECRET_KEY
const secret_iv = process.env.SECRET_IV
const algorithm = 'aes-256-cbc'
const key = crypto.createHash('sha512').update(secret_key, 'utf-8').digest('hex').substr(0, 32);
const iv = crypto.createHash('sha512').update(secret_iv, 'utf-8').digest('hex').substr(0, 16);

function encrypt(user_data) {
  if (!user_data) {
    return "no data";
  }
  let cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(user_data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(user_data) {
  let decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(user_data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = {
    encrypt,
    decrypt,
  };
  