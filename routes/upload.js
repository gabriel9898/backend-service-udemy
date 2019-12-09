var express = require("express");
var fileUpload = require("express-fileupload");
var fs = require("fs");

var app = express();

var Hospital = require("../models/hospital");
var Medico = require("../models/medico");
var Usuario = require("../models/usuario");

// default options
app.use(fileUpload({ useTempFiles: true }));

app.put("/:tipo/:id", (req, res, next) => {
  var tipo = req.params.tipo;
  var id = req.params.id;

  //tipos de coleccion
  var tiposValidos = ["hospitales", "usuarios", "medicos"];
  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Tipo de coleccion no valida",
      errors: {
        message: "Las colecciones validas son " + tiposValidos.join(", ")
      }
    });
  }
  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: "NO selecciono nada",
      errors: { message: "Debe selecciona una imagen" }
    });
  }

  //Obtener el nombre del archivo
  var archivo = req.files.imagen;
  var nombreCortado = archivo.name.split(".");
  var extensionArchivo = nombreCortado[nombreCortado.length - 1];

  //Solo estas extensionces aceptamos
  var extensionesValidas = ["png", "jpg", "gif", "jpeg"];
  if (extensionesValidas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Extension no valida",
      errors: {
        message: "Las extensiones validas son " + extensionesValidas.join(", ")
      }
    });
  }

  //Nombre de archivo personalizado
  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

  //Mover el archivo del temporal a un path
  var path = `./uploads/${tipo}/${nombreArchivo}`;

  archivo.mv(path, err => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al mover Archivo",
        errors: err
      });
    }

    subirPorTipo(tipo, id, nombreArchivo, res);
    //200 es todo correcto
    // res.status(200).json({
    //   ok: true,
    //   mensaje: "Archivo movido",
    //   extensionArchivo: extensionArchivo
    // });
  });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
  if (tipo === "usuarios") {
    subirPorTipoUsuarios(id, nombreArchivo, res);
  }
  if (tipo === "medicos") {
    subirPorTipoMedicos(id, nombreArchivo, res);
  }
  if (tipo === "hospitales") {
    subirPorTipoHospitales(id, nombreArchivo, res);
  }
}

function subirPorTipoUsuarios(id, nombreArchivo, res) {
  Usuario.findById(id, (err, usuario) => {
    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error usuario no existe",
        errors: { message: "Usuario no existe" }
      });
    }
    var pathViejo = "./uploads/usuarios/" + usuario.img;

    //si existe, elimina la imagen anterior
    if (fs.existsSync(pathViejo)) {
      fs.unlinkSync(pathViejo);
    }

    usuario.img = nombreArchivo;

    usuario.save((err, usuarioActualizado) => {
      usuarioActualizado.password = ":)";
      return res.status(200).json({
        ok: true,
        mensaje: "Imagen de usuario Actualizada",
        usuarioActualizado: usuarioActualizado
      });
    });
  });
}

function subirPorTipoMedicos(id, nombreArchivo, res) {
  Medico.findById(id, (err, medico) => {
    if (!medico) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error medico no existe",
        errors: { message: "Medico no existe" }
      });
    }
    var pathViejo = "./uploads/medicos/" + medico.img;

    //si existe, elimina la imagen anterior
    if (fs.existsSync(pathViejo)) {
      fs.unlinkSync(pathViejo);
    }

    medico.img = nombreArchivo;

    medico.save((err, medicoActualizado) => {
      return res.status(200).json({
        ok: true,
        mensaje: "Imagen de medico Actualizada",
        medicoActualizado: medicoActualizado
      });
    });
  });
}

function subirPorTipoHospitales(id, nombreArchivo, res) {
  Hospital.findById(id, (err, hospital) => {
    if (!hospital) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error hospital no existe",
        errors: { message: "Hospital no existe" }
      });
    }
    var pathViejo = "./uploads/hospitales/" + hospital.img;

    //si existe, elimina la imagen anterior
    if (fs.existsSync(pathViejo)) {
      fs.unlinkSync(pathViejo);
    }

    hospital.img = nombreArchivo;

    hospital.save((err, hospitalActualizado) => {
      return res.status(200).json({
        ok: true,
        mensaje: "Imagen de hospital Actualizada",
        hospitalActualizado: hospitalActualizado
      });
    });
  });
}

module.exports = app;
