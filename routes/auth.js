const bcrypt = require('bcrypt');
const { generateToken } = require('../helpers/authHelpers');
const { login, getMessageToClients } = require('../firestore/queries');

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


module.exports = {
  authenticate,
}