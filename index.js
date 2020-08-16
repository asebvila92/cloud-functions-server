const functions = require('firebase-functions');
const express = require('express');
const { authMiddleware, logMiddleware } = require('./helpers/middlewares')
const { authTest, authenticate } = require('./routes/auth');
const { getDeliveries, addDelivery, deleteDelivery, getDeliveryByClientName } = require('./routes/deliveries');

const app = express()
app.use(logMiddleware);

app.post('/auth/login', (req, res) => authenticate(req.body, res))
app.get('/auth/test', (req, res) => authTest(res))

app.use(authMiddleware);

app.get('/deliveries/all', (req, res) => getDeliveries(res))
app.post('/deliveries', (req, res) => addDelivery(req, res))
app.delete('/deliveries/:logId', (req, res) => deleteDelivery(req, res))
app.get('/deliveries/:clientName', (req, res) => getDeliveryByClientName(req, res))


exports.server = functions
  .region('southamerica-east1')
  .https.onRequest(app)

