const { Expo } = require('expo-server-sdk');
const { getAllPushTokens, deletePushToken } = require('../firestore/queries');

async function getNotifications(){
  let notifications = [];
  const pushtokens = await getAllPushTokens();
  pushtokens.forEach((token) => {
    if(Expo.isExpoPushToken(token)){
      notifications.push({
        to: token,
        sound: 'default',
        body: 'Tienes llamadas para realizar hoy a tus clientes. Entra a la app y fijate',
      })
    }
  })
  return notifications;
}

async function getTicketsAndcompressNotifications(expo, notifications) {
  let chunks = expo.chunkPushNotifications(notifications);
  let tickets = [];

  return new Promise((resolve, reject) => {
    chunks.forEach((chunk, index) => {
      let ticketChunk = expo.sendPushNotificationsAsync(chunk);
      ticketChunk.then(
        (response) => {
          tickets.push(...response);
          if(chunks.length -1 === index){
          resolve(tickets)
          }
        },
        (error) => {
          reject(error)
        }
      ) 
    })
  })
}

async function handleReceipts(tickets){
  tickets.forEach((ticket) => {
    if(ticket.status === 'error' && ticket.details.error === 'DeviceNotRegistered'){
      let message = ticket.message;
      let pushToken = message.substring(message.indexOf('[') +1, message.indexOf(']'))
      //delete deviceId from the user!
      deletePushToken(pushToken);
    }
  })
}

async function sendNotifications() {
  let expo = new Expo();
  const notifications = await getNotifications();
  const tickets = await getTicketsAndcompressNotifications(expo, notifications) 
  handleReceipts(tickets);
}

module.exports = {
  sendNotifications,
}