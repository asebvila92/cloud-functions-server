const functions = require('firebase-functions');
const express = require('express');
const { authTest } = require('./routes/auth');

const app = express()

app.get('/auth/test', (req, res) => res.send(authTest()))

exports.server = functions.https.onRequest(app)
exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});
