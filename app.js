// escribimos todo el codigo para el servidor y la coneccion a la bd

//Requires
var express = require("express");
var mongoose = require("mongoose");

//Inicializr variables
var app = express();

//conexxcion a la base de datos
mongoose.connection.openUri(
  "mongodb://localhost:27017/hospitalDB",
  (err, res) => {
    if (err) throw err;

    console.log("Base de datos: \x1b[32m%s\x1b[0m", "online");
  }
);

//Rutas
app.get("/", (rew, res, next) => {
  //200 es todo correcto
  res.status(200).json({
    ok: true,
    mensaje: "Peticion realizada correctamente"
  });
});
// escuchar peticiones
app.listen(3000, () => {
  console.log(
    "Express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m",
    "online"
  );
});
