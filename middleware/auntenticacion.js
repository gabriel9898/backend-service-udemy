var jwt = require("jsonwebtoken");

var SEED = require("../config/config").SEED;

// ==================================================================================
// Verificar Token // despues de aca todo necesitaran la validacion del token
// ==================================================================================
exports.verificaToken = function(req, res, next) {
  var token = req.query.token;

  jwt.verify(token, SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        mensaje: "Token Incorrecto",
        errors: err
      });
    }

    req.usuario = decoded.usuario;
    next();
    // res.status(200).json({
    //   ok: true,
    //   decoded: decoded
    // });
  });
};
