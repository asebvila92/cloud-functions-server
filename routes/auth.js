const bcrypt = require('bcrypt');
const { generateToken } = require('../helpers/authHelpers');
const { login, getMessageToClients, changeMessageById, getMessageById } = require('../firestore/queries');

function authenticate(data, res) {
  const { username, password, deviceId } = data;
  let payload = {
    message: '',
    token: '',
    userData: {}
  }
  if(username !== '' && password !== '') {
    login(username, deviceId).then(
      (response) => {
        if(response !== null){
          bcrypt.compare(password, response.password, async function (err, result) {
            if(result){
              const clientsMessage = await getMessageToClients()
              payload.token = generateToken(response)
              payload.message = 'Autenticacion exitosa';
              payload.clientsMessage = clientsMessage;
              payload.userData = {
                name: response.name, 
                username: response.username,
                lastname: response.lastname, 
                deviceId: response.deviceId
              }
              res.send(payload);
            }else{
              payload.message = 'Contraseña incorrecta';
              res.send(payload);
            }
          });
        }else{
          payload.message = 'El usuario no existe';
          res.send(payload);
        }
      },
      (err) => {
        payload.message = 'Ocurrio un error';
        res.status(500).send(payload);
      }
    )
  }else{
    payload.message = 'Las credenciales son requeridas';
    res.status(401).send(payload);
  }
}

function getMessage(req, res) {
  let payload = {
    message: '',
    data: ''
  }
  const messageId = req.params.messageId;

  getMessageById(messageId).then(
    (response) => {
      if(response){
        payload.message = 'Peticion exitosa';
        payload.data = response;
      }else{
        payload.message = 'No existe el Id de mensaje';
      }
      res.send(payload);
    },
    (error) => {
      payload.message = 'ocurrio un error';
      res.status(500).send(payload);
    }
  )
}

function changeMessage(req, res) {
  let payload = {
    message: '',
    data: null
  }
  const messageId = req.params.messageId;
 
  if(req.body.message !== '' && req.body.message.trim() !== ''){
    changeMessageById(messageId, req.body.message).then(
      (response) => {
        payload.message = 'Modificacion exitosa';
        payload.data = response;
        res.send(payload);
      },
      (error) => {
        payload.message = 'ocurrio un error';
        res.status(500).send(payload);
      }
    )
  }else{
    payload.message = 'need message content';
    res.status(400).send(payload);
  }

}


module.exports = {
  authenticate,
  getMessage,
  changeMessage
}