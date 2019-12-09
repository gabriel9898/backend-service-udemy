var express = require("express");
var bcrypt = require("bcryptjs");

var mdAuntenticacion = require("../middleware/auntenticacion");

var SEED = require("../config/config").SEED;
var app = express();

var Hospital = require("../models/hospital");

//==================================================================================
//Obetener  todos los Hospitales
//==================================================================================
app.get("/", (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate("usuario", "nombre email")
    .exec((err, hospitales) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando Hospitales",
          errors: err
        });
      }
      Hospital.count({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          total: conteo,
          hospitales: hospitales
        });
      });
    });
});

// ==================================================================================
// Crear un nuevo Hospital
// ==================================================================================
app.post("/", mdAuntenticacion.verificaToken, (req, res) => {
  var body = req.body;

  var hospital = new Hospital({
    nombre: body.nombre,
    usuario: req.usuario._id
  });

  hospital.save((err, hospitalGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear Hospital",
        errors: err
      });
    }

    res.status(201).json({
      ok: true,
      hospital: hospitalGuardado,
      hospitalToken: req.hospital //usuario quien mando la informacion
    });
  });
});

// ==================================================================================
// Actualizar nuevo Hospital
// ==================================================================================

app.put("/:id", mdAuntenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Hospital.findById(id, (err, hospital) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar el Hospital",
        errors: err
      });
    }
    if (!hospital) {
      return res.status(400).json({
        ok: false,
        mensaje: "El Hospital con el " + id + " no existe.",
        errors: { message: "No existe Hospital con ese ID." }
      });
    }

    hospital.nombre = body.nombre;
    hospital.usuario = req.usuario._id;

    hospital.save((err, hospitalGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar el Hospital",
          errors: err
        });
      }

      res.status(200).json({
        ok: true,
        Hospital: hospitalGuardado
      });
    });
  });
});

// ==================================================================================
// Borrar un Hospital por el id
// ==================================================================================
app.delete("/:id", mdAuntenticacion.verificaToken, (req, res) => {
  var id = req.params.id;

  Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al borrar Hospital",
        errors: err
      });
    }
    if (!hospitalBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe ningun un Hospital con ese ID",
        errors: { message: "No existe ningun un Hospital con ese ID" }
      });
    }
    res.status(200).json({
      ok: true,
      mensaje: "Borrado con exito",
      hospital: hospitalBorrado
    });
  });
});

// ==================================================================================
// Exportacion
// ==================================================================================
module.exports = app;
