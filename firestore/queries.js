const admin = require('firebase-admin');
admin.initializeApp();

function login(username, deviceId) {
  return new Promise((resolve, reject) => {
    let db = admin.firestore();
    db.collection('users')
      .where('username', '==', username)
      .get()
      .then((querySnapshot) => {
        const userId = querySnapshot.docs[0] ? querySnapshot.docs[0].id : null
        let doc = null;
        //if user exists we search the deviceId and if it exist we change it to null to ensure not duplicates.
        //update the deviceId in firebase else resolve with null
        if(userId !== null){
          db.collection("users").doc(userId).update({deviceId: ''});
          db.collection("users").where("deviceId", "==", deviceId)
          .get()
          .then((response) => {
            const userIdWithThisDeviceId = response.docs[0] ? response.docs[0].id : null
            if(userIdWithThisDeviceId !== null){
              db.collection("users").doc(userIdWithThisDeviceId).update({deviceId: ''});
            }
            doc = querySnapshot.docs[0].data()
            db.collection('users')
            .doc(userId)
            .update({ deviceId: deviceId })
            .then(() => {
              doc = {...doc, deviceId: deviceId }
              resolve(doc)
            })
          })
        }else{
          resolve(doc)
        }
      })
      .catch((err) => {
        reject(err)
      }
      );
  }
)}

function getMessageToClients(){
  return new Promise((resolve, reject) => {
    let db = admin.firestore();
    db.collection('messages')
    .doc('default')
    .get()
    .then(
      response => resolve(response.data()),
      error => reject(error)
    )
  })
}

function getLogs() {
  return new Promise((resolve, reject) => {
    let db = admin.firestore();
    db.collection('deliveries')
      .orderBy('nextDelivery')
      .get()
      .then((querySnapshot) => {
        const docs = querySnapshot.docs.map((doc) => {
          const id = doc.id
          const data = doc.data()
          return { id, ...data }
        })
        const logs = docs.length === 0 ? null : docs;
        resolve(logs)
      })
      .catch((err) => {
        reject(err)
      }
      );
  })
}

function addLog(newDelivery) {
  return new Promise((resolve, reject) => {
    let db = admin.firestore();
    db.collection("deliveries")
    .add(newDelivery)
    .then((docRef) => {
      resolve(docRef.id)
    })
    .catch((err) => {
      reject(err)
    });
  })
}

function deleteLog(logId) {
  return new Promise((resolve, reject) => {
    let db = admin.firestore();
    db.collection('deliveries')
      .doc(logId)
      .delete()
      .then((docRef) => {
        resolve(docRef);
      })
      .catch((err) => {
        reject(err)
      })
  })
}

function updateLog(logId, newData){
  return new Promise((resolve, reject) => {
    let db = admin.firestore();
    let deliveries = db.collection('deliveries')
    
    deliveries.doc(logId).update(newData).then(
      () => {
        deliveries.orderBy('nextDelivery').get()
        .then(
          (snapshot) => {
            const docs = snapshot.docs.map((doc) => {
              const id = doc.id
              const data = doc.data()
              return { id, ...data }
            })
          const logs = docs.length === 0 ? null : docs;
          resolve(logs)
        })
      })
      .catch((err) => {
        reject(err)
      })
  }) 
}

function getLogByNameOfClient(clientName) {
  return new Promise((resolve, reject) => {
    let db = admin.firestore();
    db.collection('deliveries')
      .where('client', '==', clientName)
      .get()
      .then((querySnapshot) => {
        const docs = querySnapshot.docs.map((doc) => {
          const id = doc.id
          const data = doc.data()
          return { id, ...data }
        })
        const logs = docs.length === 0 ? null : docs;
        resolve(logs)
      })
      .catch((err)=> {
        reject(err)
      }
      );
  })
}

/*
  To compare docs in where clause we need to use Timestamp type and give a day of today without hours and 3 ceros. After we
  need to add 3 hours (10800). Timestamp receive seconds and nanoseconds (last 0)
*/
function areDeliveriesForToday() {
  return new Promise((resolve, reject) => {
    let db = admin.firestore();
    db.collection('deliveries')
    .where('nextDelivery', '==', new admin.firestore.Timestamp(new Date().setHours(0,0,0,0) / 1000 + 10800, 0))
    .get()
    .then((snapshot) => {
      resolve(!snapshot.empty)
    })
    .catch((err) => {
      reject(err)
    })
  })
}

function getAllPushTokens(){
  return new Promise((resolve, reject) => {
    let pushTokens = [];
    let db = admin.firestore();
    db.collection('users')
    .get()
    .then((snapshot) => {
      if(!snapshot.empty){
        snapshot.forEach((doc) => {
          if(doc.data().deviceId !== ''){
            pushTokens.push(`ExponentPushToken[${doc.data().deviceId}]`)
          }
        })
        resolve(pushTokens);
      }
    })
    .catch((err) => {
      reject(err);
    })
  })
}

function deletePushToken(pushToken) {
  return new Promise((resolve, reject) => {
    let db = admin.firestore();
    db.collection('users')
    .where('deviceId', '==', pushToken)
    .get()
    .then((snapshot) => {
      const userIdWithThisDeviceId = snapshot.docs[0] ? snapshot.docs[0].id : null
      if(userIdWithThisDeviceId !== null){
        db.collection("users").doc(userIdWithThisDeviceId).update({deviceId: ''});
      }
    })
    .catch((err) => {
      reject(err)
    })
  })
}

function getMessageById(messageId) {
  return new Promise((resolve, reject) => {
    let db = admin.firestore();
    let messagesCollection = db.collection('messages');
    
    messagesCollection.doc(messageId).get()
    .then(
      response => resolve(response.data()),
      error => reject(error)
    )
  })
}

function changeMessageById(messageId, text) {
  return new Promise(async (resolve, reject) =>{
    let db = admin.firestore();
    let messagesCollection = db.collection('messages');
    await messagesCollection.doc(messageId).update({ message: text })
    messagesCollection.doc(messageId).get()
    .then(
      response => resolve(response.data()),
      error => reject(error)
    )
  })
} 


module.exports = {
  login,
  getMessageToClients,
  changeMessageById,
  getMessageById,
  getLogs,
  getLogByNameOfClient,
  addLog,
  deleteLog,
  updateLog,
  areDeliveriesForToday,
  getAllPushTokens,
  deletePushToken
}
