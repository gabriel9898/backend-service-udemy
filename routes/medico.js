var express = require("express");
var bcrypt = require("bcryptjs");

var mdAuntenticacion = require("../middleware/auntenticacion");

var SEED = require("../config/config").SEED;
var app = express();

var Medico = require("../models/medico");

//==================================================================================
//Obetener  todos los Medicos
//==================================================================================
app.get("/", (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Medico.find({})
    .skip(desde)
    .limit(5)
    .populate("usuario", "nombre email")
    .populate("hospital")
    .exec((err, medicos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando Medicos",
          errors: err
        });
      }
      Medico.count({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          total: conteo,
          medicos: medicos
        });
      });
    });
});

// ==================================================================================
// Crear un nuevo Medico
// ==================================================================================
app.post("/", mdAuntenticacion.verificaToken, (req, res) => {
  var body = req.body;

  var medico = new Medico({
    nombre: body.nombre,
    usuario: req.usuario._id,
    hospital: body.hospital
  });

  medico.save((err, medicoGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear al Medico",
        errors: err
      });
    }

    res.status(201).json({
      ok: true,
      medico: medicoGuardado,
      medicoToken: req.medico
    });
  });
});

// ==================================================================================
// Actualizar nuevo Medico
// ==================================================================================

app.put("/:id", mdAuntenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Medico.findById(id, (err, medico) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar al Medico",
        errors: err
      });
    }
    if (!medico) {
      return res.status(400).json({
        ok: false,
        mensaje: "El Medico con el " + id + " no existe.",
        errors: { message: "No existe Medico con ese ID." }
      });
    }

    medico.nombre = body.nombre;
    medico.usuario = req.usuario._id;
    medico.hospital = body.hospital;

    medico.save((err, medicoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar al Medico",
          errors: err
        });
      }

      res.status(200).json({
        ok: true,
        Hospital: medicoGuardado
      });
    });
  });
});

// ==================================================================================
// Borrar un Medico por el id
// ==================================================================================
app.delete("/:id", mdAuntenticacion.verificaToken, (req, res) => {
  var id = req.params.id;

  Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al borrar Medico",
        errors: err
      });
    }
    if (!medicoBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe ningun un Medico con ese ID",
        errors: { message: "No existe ningun un Medico con ese ID" }
      });
    }
    res.status(200).json({
      ok: true,
      mensaje: "Borrado con exito",
      medico: medicoBorrado
    });
  });
});

// ==================================================================================
// Exportacion
// ==================================================================================
module.exports = app;
