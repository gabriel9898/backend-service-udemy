var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

var mdAuntenticacion = require("../middleware/auntenticacion");

var SEED = require("../config/config").SEED;
var app = express();

var Usuario = require("../models/usuario");

//==================================================================================
//Obetener  todos los Usuarios
//==================================================================================
app.get("/", (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Usuario.find({}, "nombre email img role")
    .skip(desde)
    .limit(5)
    .exec((err, usuarios) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando Usuarios",
          errors: err
        });
      }

      Usuario.count({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          total: conteo,
          usuarios: usuarios
        });
      });
    });
  //200 es todo correcto
});

// ==================================================================================
// Actualizar nuevo Usuario
// ==================================================================================
app.put("/:id", mdAuntenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body; // funciona si esta instalada la libreria Parser

  Usuario.findById(id, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar el Usuario",
        errors: err
      });
    }
    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: "el Usuario con el " + id + " no existe.",
        errors: { message: "No existe usuario con ese ID." }
      });
    }

    usuario.nombre = body.nombre;
    usuario.email = body.email;
    usuario.role = body.role;

    usuario.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar Usuario",
          errors: err
        });
      }

      usuarioGuardado.password = ":)";

      res.status(200).json({
        ok: true,
        usuario: usuarioGuardado
      });
    });
  });
});

// ==================================================================================
// Crear un nuevo Usuario
// ==================================================================================
app.post("/", mdAuntenticacion.verificaToken, (req, res) => {
  //recibe la informacion POST
  var body = req.body; // funciona si esta instalada la libreria Parser

  var usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    role: body.role
  });

  usuario.save((err, usuarioGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear Usuario",
        errors: err
      });
    }

    res.status(201).json({
      ok: true,
      usuario: usuarioGuardado,
      usuarioToken: req.usuario //usuario quien mando la informacion
    });
  });
});

// ==================================================================================
// Borrar un Usuario por el id
// ==================================================================================
app.delete("/:id", mdAuntenticacion.verificaToken, (req, res) => {
  var id = req.params.id;

  Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al borrar Usuario",
        errors: err
      });
    }
    if (!usuarioBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe ningun un Usuario con ese ID",
        errors: { message: "No existe ningun un Usuario con ese ID" }
      });
    }
    res.status(200).json({
      ok: true,
      mensaje: "Borrado con exito",
      usuario: usuarioBorrado
    });
  });
});

// ==================================================================================
// Exportacion
// ==================================================================================
module.exports = app;
