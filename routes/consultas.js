var express = require('express');
var auth = require('../middleware/auth');
var consultaDb = require('../src/database/queries');
var router = express.Router();

// ================== GETS ==========================
// Endpoint /cursos per recuperar els cursos
router.get('/cursos', async function(req, res, next) {
    var cursos = await consultaDb.getCurs();
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(cursos, null, 4));
});

// Endpoint /pobles per recuperar les pobles
router.get('/pobles', async function(req, res, next) {
    var pobles = await consultaDb.getPobles();
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(pobles, null, 4));
});

// Endpoint /user que retorna un usuari a partir del TOKEN
router.get('/user', auth, async function(req, res){
  var dataUser = await consultaDb.findUser(req.userData.id);
      res.send({dataUser});  
});

// Endpoint /ofertes retorna totes els ofertes
router.get('/ofertes', auth, async function(req, res){
  var ofertes = await consultaDb.getOfertes(req.userData);
  if(ofertes !== null){
    res.send(JSON.stringify(ofertes, null, 4));  
  }
  else{
    res.status(409).send('Error!');
  }
});

// Endpoint /ofertes/oferta per obtenir una oferta a partir del seu codi(id)
router.get('/ofertes/:id', auth, async function(req, res){
  var oferta = await consultaDb.getOferta(req.params.id);
  if(oferta !== null){
    res.send(JSON.stringify(oferta, null, 4));  
  }
  else{
    res.status(409).send('Error!');
  }
});

// Endpoint /ofertes/alumnes per obtenir la llista del alumnes
router.get('/llista_alumnes', auth, async function(req, res){
  console.log(req.userData);
  var oferta = await consultaDb.getAlumnesOferta(req.userData);
  if(oferta !== null){
    res.send(JSON.stringify(oferta, null, 4));  
  }
  else{
    res.status(409).send('Error unknown!');
  }
});


// ========================= POSTS ==================================
// Endpoint /registre/confirmacio per confirmar el correu del usuari
router.post('/login/canviarpass', async function (req, res) {
  var dataUser = await consultaDb.updateActivationCode(req.body.email);
  if(dataUser != null){
    res.send({dataUser});  
  }
  else{
    res.status(409).send('Correu incorrecte');
  }
});

// Endpoint /feina/inscriure/ per a inscriure a una oferta
router.post('/feina/inscriure/', auth, async function (req, res) {
  var dataUser = await consultaDb.enscriureOferta(req.userData, req.body.id);
  if(dataUser != null){
    res.send({dataUser});  
  }
  else{
    res.status(409).send("Ja t'has inscrit a aquesta oferta");
  }
});

// Endpoint /login per fer login
router.post('/login', async function(req, res, next) {
  var dataUser = await consultaDb.login(req.body);
  if(dataUser === "inActive"){
    const data = await consultaDb.updateActivationCode(req.body.email);
    res.status(403).send("El compte no està activat.");
  }
  else if(dataUser === null){
    res.status(401).send("Email o contrasenya incorrecta.");
  }
  else{
    res.send({dataUser});
  }
  
});

// Endpoint /fct per inserir una oferta de FCT
router.post('/fct', auth, async function (req, res) {
  var dataUser = await consultaDb.addFCT(req.userData.id, req.body);
  if(dataUser > 0){
    res.send({dataUser});  
  }
  else{
    res.status(409).send('Error!');
  }
});

// Endpoint /fct per inserir una oferta de FCT
router.post('/feina', auth, async function (req, res) {
  var dataUser = await consultaDb.addOfertaFeina(req.userData, req.body);
  if(dataUser > 0){
    res.send({dataUser});  
  }
  else{
    res.status(409).send('Error!');
  }
});


// Endpoint /registre per registre un usuari
router.post('/registre', async function(req, res){
  var dataUser = await consultaDb.addUser(req.body);
    if(dataUser === 444){
      res.status(409).send('DNI/NIF Ja existeix');
    }
    else if(dataUser === 404){
      res.status(409).send('Ja existeix un compte amb aquest correu');
    }
    else{
      res.send({dataUser});
    }      
});

// ======================= PUTS ===============================
// Endpoint /login/canviarpass/password per canviar la constasenya de l'usuari
router.put('/login/canviarpass/password', async function (req, res) {
  var dataUser = await consultaDb.changePassword(req.body);
  if(dataUser != null){
    res.send({dataUser});  
  }
  else{
    res.status(409).send('Codi incorrecte');
  }
});

// Endpoint /registre/confirmacio per confirmar el correu del usuari
router.put('/registre/confirmacio', async function (req, res) {
  var dataUser = await consultaDb.activateAccount(req.body);
  if(dataUser != null){
    res.send({dataUser});  
  }
  else{
    res.status(409).send('Correu o codi incorrecte');
  }
});

// Endpoint /ofertes/validar  per validar una oferta
router.put('/ofertes/validar', auth, async function (req, res) {
  var affectedRows= await consultaDb.validarOferta(req.userData, req.body);
  if(affectedRows > 0){
    res.send({affectedRows});  
  }
  else{
    res.status(409).send('Error!');
  }
});

// =================== DELETE =====================================
// Endpoint /feina:/:id per eliminar una oferta
router.delete('/feina/:id', auth, async function (req, res) {
  console.log(req.body);

  var affectedRows= await consultaDb.eliminarOferta(req.userData, req.params.id);
  if(affectedRows > 0){
    res.send({affectedRows});  
  }
  else{
    res.status(409).send('Error!');
  }
});

module.exports = router;