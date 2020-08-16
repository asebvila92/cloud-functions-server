const { getLogs, addLog, deleteLog, getLogByNameOfClient, } = require('../firestore/queries');

//--------------------------GET ALL DELIVERIES-----------------------------
function getDeliveries(res) {
  let payload = {
    message: '',
    data: [],
  }
  getLogs().then(
    (response) => {
      payload.data = response;
      payload.message = 'Peticion exitosa';
      res.send(payload);
    },
    (err) => {
      payload.message = 'ocurrio un error';
      res.status(500).send(payload);
    }
  )
}

//------------------------ADD DELIVERY-------------------------------------
function addDelivery(req, res) {
  let payload = {
    message: '',
    deliveries: [],
    newLog: '',
  }

  const newDelivery = {
    client: req.body.client,
    article: req.body.article || null,
    lastDelivery: new Date(req.body.lastDelivery) || new Date(),
    nextDelivery: new Date(req.body.nextDelivery),
    cellphone: req.body.cellphone || null,
    address: req.body.address || null,
    price: req.body.price || null,
    observations: req.body.observations || null,
    savedBy: req.body.user 
  }

  if(newDelivery.client !== '' && newDelivery.nextDelivery !== '' && newDelivery.savedBy !== ''){
    addLog(newDelivery).then(
      (response) => {
        payload.message = 'Registro agregado con exito';
        payload.newLog = response
        //at this point if its everything ok, we will get all deliveries to add in the response
        getLogs().then(
          (response) => {
            payload.deliveries = response;
            res.send(payload);
          },
          (err) => {
            payload.message = 'ocurrio un error pero el registro fue agregado con exito';
            res.send(payload);
          }
        )
      },
      (err) => {
        payload.message = 'ocurrio un error';
        res.status(500).send(payload);
      })
  }else{
    payload.message = 'need client and a next delivery';
    res.status(400).send(payload);
  }
}

//-----------------------DELETE DELIVERY ----------------------------------------
function deleteDelivery(req, res){
  let payload = {
    message: '',
    deliveries: []
  }
  const logId = req.params.logId;
  deleteLog(logId).then(
    (response) => {
      getLogs().then(
        (response) => {
          payload.message = 'se elimino con exito';
          payload.deliveries = response;
          res.send(payload);
        },
        (err) => {
          payload.message = 'ocurrio un error pero el registro fue eliminado con exito';
          res.send(payload);
        }
      )
    },
    (err) => {
      payload.message = 'ocurrio un error';
      res.status(500).send(payload);
    })
}

//-------------------------GET DELIVERY BY CLIENT NAME---------------------------
function getDeliveryByClientName(req, res){
  let payload = {
    message: '',
    data: [],
  }
  const clientName = req.params.clientName
  getLogByNameOfClient(clientName).then(
    (response) => {
      payload.data = response;
      payload.message = 'Peticion exitosa';
      res.send(payload);
    },
    (err) => {
      payload.message = 'ocurrio un error';
      res.status(500).send(payload);
    }
  )
}

module.exports = {
  getDeliveries,
  addDelivery,
  deleteDelivery,
  getDeliveryByClientName,
}