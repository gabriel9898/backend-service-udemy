var express = require("express");

var app = express();

app.get("/", (rew, res, next) => {
  //200 es todo correcto
  res.status(200).json({
    ok: true,
    mensaje: "Peticion realizada correctamente"
  });
});

module.exports = app;
