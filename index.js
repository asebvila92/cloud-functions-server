const functions = require('firebase-functions');
const express = require('express');
const { authMiddleware, logMiddleware } = require('./helpers/middlewares')
const { authenticate } = require('./routes/auth');
const { getDeliveries, addDelivery, deleteDelivery, getDeliveryByClientName, updateDelivery } = require('./routes/deliveries');
const { areDeliveriesForToday } = require('./firestore/queries')
const { sendNotifications } = require('./helpers/pushNotifications');

const app = express()
app.use(logMiddleware);

app.post('/auth/login', (req, res) => authenticate(req.body, res))

app.use(authMiddleware);

app.get('/deliveries/all', (req, res) => getDeliveries(res))
app.post('/deliveries', (req, res) => addDelivery(req, res))
app.delete('/deliveries/:logId', (req, res) => deleteDelivery(req, res))
app.get('/deliveries/:clientName', (req, res) => getDeliveryByClientName(req, res))
app.put('/deliveries/:logId', (req, res) => updateDelivery(req, res))


exports.server = functions
  .region('southamerica-east1')
  .https.onRequest(app)  

exports.handlePushNotifications = functions
  .region('southamerica-east1')
  .pubsub.schedule('5 10 * * *') //10:05
  .timeZone('America/Buenos_Aires')
  .onRun(async (context) => {
    await areDeliveriesForToday().then(
      async (response) => {
        if(response){
          await sendNotifications()
          console.log('We have sent notifications for today')
          return null
        }else{
          console.log('There were no records for today')
          return null
        }
      },
      (error) => {
        console.log(error)
      }
    )
});
