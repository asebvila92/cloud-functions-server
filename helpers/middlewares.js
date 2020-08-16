const { isAuthenticated } = require('./authHelpers')

function authMiddleware(req, res, next) {
  if(isAuthenticated(req.headers.authorization)){
    next();
  }else{
    res.status(403).send('Error de Autenticacion');
  }
}

function logMiddleware(req, res, next){
  console.log(`Route executed: ${req._parsedUrl.path}`);
  next();
}

module.exports = {
  authMiddleware,
  logMiddleware
}