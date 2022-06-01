const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mariadb = require('./_db');
const SECRET_KEY = process.env.key;
var mailSender = require('./nodemailer.config');

// Funció que retorna l'informació del usuari
async function login(body) {
    try {
        let conn = await mariadb.getConn();
        const sqlQuery = `SELECT * FROM login where email = '${body.email}';`;
        const resultat = await conn.query(sqlQuery, function (err, res) {
            if (err) {
                conn.release();
                throw err;   
            }            
        });
        conn.release();
        // desencriptar la contrasenya
        if(resultat[0]){
            let compare = bcryptjs.compareSync(body.password, resultat[0].contrasenya);
            if(compare){
                const expiresInt = 24*60*60;
                const accessToken = jwt.sign({id: body.email, tipus_usuari: resultat[0].tipus_usuari}, SECRET_KEY, {expiresIn: expiresInt});
                if(resultat[0].isActive){
                    const dataUser = {
                        email: body.email,
                        tipus_usuari: resultat[0].tipus_usuari,
                        accessToken: accessToken,
                      }
                    return dataUser;
                }
                else{
                    return "inActive";
                }
                // return dades;
            }else{
                return null;
            }
        }
        else{
            return null
        }
    }
    catch (err)
    {
        console.log(err);
        return null;
    }
}


// Funcio per activar un compte
async function activateAccount(body){
    try {
        let conn = await mariadb.getConn();
        const row = await conn.query(`SELECT * FROM login where email = '${body.email}';`);
        let compare = bcryptjs.compareSync(body.confirm_code.toString(), row[0].codi_activacio);
        if(compare){
            const result = await conn.query(`UPDATE login SET isActive = 1 WHERE email = '${body.email}';`);
            dataUser = null;
            if(result.affectedRows){
                const expiresInt = 24*60*60;
                const accessToken = jwt.sign({id: body.email, tipus_usuari: row[0].tipus_usuari}, SECRET_KEY, {expiresIn: expiresInt});
                dataUser = {
                    email: row[0].email,
                    tipus_usuari: row[0].tipus_usuari,
                    accessToken: accessToken,
                  }
    
            }
            conn.release();
            return dataUser;
        }
        else{    
            return null;
        }
       
    }
    catch (err)
    {
        console.log(err);
        return null;
    }
}

// Funció per actualitzar el codi d'activació
async function updateActivationCode(email) {
    let user = await checkUser(email);
    if(user){
        try {
            let conn = await mariadb.getConn();
            const code = (Math.floor(100000 + Math.random() * 900000)).toString();
            const codeHash = bcryptjs.hashSync(code,9);
            const result = await conn.query(`UPDATE login SET codi_activacio = '${codeHash}' WHERE email = '${email}';`);
            if(result.affectedRows){
                mailSender.sendConfirmationEmail(" ", email, code);
            }
            conn.release();
            return result.affectedRows;
        }
        catch (err)
        {
            console.log(err);
            return null;
        }
    }else{
        return null;
    }
}

// Funció per canviar la contrasenya
async function changePassword(body){

    try {
        let conn = await mariadb.getConn();
        const row = await conn.query(`SELECT * FROM login where email = '${body.email}';`);
        let compare = bcryptjs.compareSync(body.codi_activacio.toString(), row[0].codi_activacio);
        if(compare){
            const passwordHash = bcryptjs.hashSync(body.contrasenya,9);
            const result = await conn.query(`UPDATE login SET contrasenya = '${passwordHash}' WHERE email = '${body.email}';`);
            if(result.affectedRows){
                const expiresInt = 24*60*60;
                const accessToken = jwt.sign({id: body.email, tipus_usuari: row[0].tipus_usuari}, SECRET_KEY, {expiresIn: expiresInt});
                dataUser = {
                    email: row[0].email,
                    tipus_usuari: row[0].tipus_usuari,
                    accessToken: accessToken,
                  }
                  conn.release();
                  return dataUser;
            }
            else{
                conn.release();
                return null;
            }
        }
    }
    catch (err)
    {
        console.log(err);
        return null;
    }

}


// Funció que retorna tots els cursos
async function getCurs() {
    try {
        let conn = await mariadb.getConn();
        const rows = await conn.query("SELECT * FROM curs;");
        conn.release();
        return rows;
    }
    catch (err)
    {
        console.log(err);
        return null;
    }
}

// Funció que retorna tots els pobles
async function getPobles() {
    try {
        let conn = await mariadb.getConn();

        const rows = await conn.query("SELECT * FROM poble;");

        conn.release();

        return rows;
    }
    catch (err)
    {
        console.log(err);
        return null;
    }
}

// Funció per afegir un nou alumne a la Base de dades
async function addUser(body){
        let conn = await mariadb.getConn();
        conn.beginTransaction();
        try{
            let resultat = 444;
            // Comprovar si existeix algun usuari amb el mateix email
            let user = await checkUser(body.email);
            if(!user)
            {
                let dni = await checkDNI(body.DNI, body.tipus_usuari);
                let sqlQuery = "";
                if(!dni){
                    let passwordHash = bcryptjs.hashSync(body.contrasenya,9);
                    const code = (Math.floor(100000 + Math.random() * 900000)).toString();
                    const codeHash = bcryptjs.hashSync(code,9);
                    // Query per guardar un alumne
                    if(body.tipus_usuari == "alumne"){
                        sqlQuery = `INSERT INTO login (email,contrasenya, tipus_usuari, codi_activacio) VALUES ('${body.email}','${passwordHash}', '${body.tipus_usuari}', '${codeHash}');
                        INSERT INTO alumne(nom, cognoms, DNI, any_finalitzacio, poblacio, telefon, email) VALUES('${body.nom}','${body.cognoms}', '${body.DNI}', ${body.any_finalitzacio}, ${body.poblacio}, ${body.telefon}, '${body.email}');`;
                        body.estudis.forEach(element => {
                            sqlQuery += `INSERT INTO estudis(alumne_dni, curs_id) VALUES('${body.DNI}', '${element}');`;
                        });
                    }
                    // Query per guardar una empresa
                    else{
                        sqlQuery = `INSERT INTO login (email,contrasenya, tipus_usuari, codi_activacio) VALUES ('${body.email}','${passwordHash}', '${body.tipus_usuari}', '${codeHash}');
                        INSERT INTO empresa(NIF, nom, adreca, poblacio, telefon, email) VALUES('${body.DNI}','${body.nom}', '${body.address}', ${body.poblacio}, ${body.telefon}, '${body.email}');`;
                    }
                    try{
                        const result = await conn.query(sqlQuery, function (err, res) {
                            if (err) {
                                throw err; 
                            }           
                        });
                        if(result[0].affectedRows && result[1].affectedRows)
                        {  
                            conn.commit();
                            conn.release();
                            mailSender.sendConfirmationEmail(body.nom, body.email, code);                        
                        //        const expiresInt = 24*60*60;
                         //   const accessToken = jwt.sign({id: body.email}, SECRET_KEY, {expiresIn: expiresInt});
                            message = "Hem enviat un codi de confirmació al teu correu electrònic";                              
                            return message;
                        }
                    }
                    catch(err){
                        await conn.rollback();
                        await conn.end();
                        return Promise.reject(err);
                    }                   
                    
                }
                else{
                    resultat = 444;
                }
            }
            else{
                resultat = 404;
            }
            conn.release();
            return resultat;
        }catch(err){
            await conn.rollback();
            await conn.end();
            return Promise.reject(err);
        }

}

  // Comprovar si existeix algun usuari amb el mateix email
async function checkUser(email) {
    try {
        let conn = await mariadb.getConn();

        const row = await conn.query(`SELECT * FROM login where email = '${email}';`);
        conn.release();
        if(row && row.length){
            return true;
        }
        else{    
            return false
        }
    }
    catch (err)
    {
        console.log(err);
        return null;
    }
}

// Funcio per comprova el dni
async function checkDNI(dni, rol) {
    try {
        let conn = await mariadb.getConn();
        let row = "";
        if(rol == "alumne"){
            row = await conn.query(`SELECT * FROM alumne where dni = '${dni}';`);
        }else{
            row = await conn.query(`SELECT * FROM empresa where NIF = '${dni}';`);
        }
      //  conn.release();
        if(row && row.length){
            conn.release();
            return true;
        }
        else{   
            conn.release(); 
            return false
        }
    }
    catch (err)
    {
        console.log(err);
        return null;
    }
}

// Funció que retorna l'informació del usuari a partir del TOKEN
async function findUser(email) {
    try {
        let conn = await mariadb.getConn();
        const sqlQuery = `SELECT * FROM login where email = '${email}';`;
        const resultat = await conn.query(sqlQuery, function (err, res) {
            if (err) {
                conn.release();
                throw err;   
            }            
        });
        conn.release();
        dataUser = {
            email: resultat[0].email,
            tipus_usuari: resultat[0].tipus_usuari
        }
        return dataUser;

    }
    catch (err)
    {
        console.log(err);
        return null;
    }
}

// Funció per inserir una oferta de FCT 
async function addFCT(email, body){
    try {
        let conn = await mariadb.getConn();
        const row = await conn.query(`SELECT * FROM empresa where email = '${email}';`);
        if(row){
            const data = new Date();
            const date = data.getFullYear() + '-' + (data.getMonth()+1)+ '-' + data.getDate();
            const result = await conn.query(`INSERT INTO fct (poble_id, nif_empresa, descripcio, data_publicacio, teletreball, curs_id, titol) VALUES(${row[0].poblacio}, '${row[0].NIF}' , "${body.descripcio}", '${date}', ${body.teletreball}, '${body.curs}', '${body.titol}');`);
            conn.release();
            return result.affectedRows;
        }
        else{
            return null;
        }      
    }
    catch (err)
    {
        console.log(err);
        return null;
    }
}

// Funció per inserir una oferta de oferta de treball
async function addOfertaFeina(userData, body){
    let conn = await mariadb.getConn();
    conn.beginTransaction();
    try {
        const row = await conn.query(`SELECT * FROM empresa where email = '${userData.id}';`);
        if(userData.tipus_usuari === 'empresa'){
            const data = new Date();
            const date = data.getFullYear() + '-' + (data.getMonth()+1)+ '-' + data.getDate();
            // inserir dades a la taula oferta
            const result = await conn.query(`INSERT INTO oferta (titol, nif_empresa, descripcio, data_publicacio, teletreball, salari, jornada, experiencia_minima, tipus_contracte) VALUES('${body.titol}', '${row[0].NIF}' , "${body.descripcio}", '${date}', ${body.teletreball}, '${body.salari}' , '${body.jornada}' , '${body.experiencia_minima}', '${body.tipus_contracte}');`);
            // comprovar que les dades s'han inserit o no
            if(result.affectedRows)
            {
                console.log(result);
                let sqlQuery = "";
                body.curs.forEach(element => {
                    sqlQuery += `INSERT INTO estudis_oferta(oferta_id, curs_id) VALUES('${result.insertId}', '${element}');`;
                });
                const resultat = await conn.query(sqlQuery);
                console.log(resultat);
                conn.commit();
                conn.release();
                return result.affectedRows;
            }
        }
        else{
            return null;
        }      
    }
    catch (err)
    {
        conn.rollback();
        console.log(err);
        return null;
    }
}

// Aquest funció retorna totes les ofertes
async function getOfertes(data_User){
    try{
        let conn = await mariadb.getConn();
        const row = await conn.query(`select NIF from empresa where email = '${data_User.id}'`);
        if(row){
            let sql = "";
            if(data_User.tipus_usuari === 'profe'){
                sql = "select o.id, o.titol, o.descripcio, o.teletreball ,o.validat, o.salari , o.jornada , o.data_publicacio, o.tipus_contracte , o.experiencia_minima, e.adreca , p.nom as poblacio  , e.nom as nom_empresa from  oferta o, empresa e , poble p where o.nif_empresa = e.NIF and e.poblacio = p.id ;"
            }
            else if(data_User.tipus_usuari === 'empresa'){
                sql = `select o.id, o.titol, o.descripcio, o.teletreball ,o.validat, o.salari , o.jornada , o.data_publicacio, o.tipus_contracte , o.experiencia_minima, e.adreca , p.nom as poblacio  , e.nom as nom_empresa from  oferta o, empresa e , poble p where o.nif_empresa = e.NIF and e.poblacio = p.id and o.nif_empresa = '${row[0].NIF}' ;`;
            }
            else{
                sql = "select o.id, o.titol, o.descripcio, o.teletreball , o.validat ,o.salari , o.jornada , o.data_publicacio, o.tipus_contracte , o.experiencia_minima, e.adreca , p.nom as poblacio  , e.nom as nom_empresa from  oferta o, empresa e , poble p where o.nif_empresa = e.NIF and e.poblacio = p.id and o.validat = true;"
            }
            const rows = await conn.query(sql);
            conn.release();
            return rows;
        }
        else{
            return null;
        }
    }catch(err){
        console.log(err);
        return null;
    }
}   

// Funció per obtenir una oferta apartir del seu codi (ID)
async function getOferta(id){
    try {
        let conn = await mariadb.getConn();
        const sql = `select o.id, o.titol, o.descripcio, o.validat, o.teletreball , o.salari , o.jornada , o.data_publicacio, o.tipus_contracte , o.experiencia_minima, e.adreca , p.nom as poblacio  , e.nom as nom_empresa from  oferta o, empresa e , poble p where o.nif_empresa = e.NIF and e.poblacio = p.id and o.id = ${id} ;`;
        const row = await conn.query(sql);
        conn.release();
        if(row && row.length){
            return row[0];
        }
        else{    
            return null
        }
    }
    catch (err)
    {
        console.log(err);
        return null;
    }
}
// Funció per validar una oferta
async function validarOferta(userData, body){
    if(userData.tipus_usuari === 'profe'){
        try {
            let conn = await mariadb.getConn();
            const result = await conn.query(`UPDATE oferta SET validat = 1 WHERE id = ${body.id};`);
            console.log(result); 
            conn.release();
            return result.affectedRows;
        }
        catch (err)
        {
            console.log(err);
            return null;
        }
    }else{
        return null;
    }
}

// Funció per eliminar una oferta
async function eliminarOferta(userData, id){
    if(userData.tipus_usuari === 'profe' || userData.tipus_usuari === 'empresa'){
        try {
            let conn = await mariadb.getConn();
            let sql = `delete from sollicitud_oferta where oferta_id=${id}; delete from estudis_oferta where oferta_id = ${id}; DELETE FROM oferta WHERE id = ${id};`;
            const result = await conn.query(sql);
            console.log(result); 
            conn.release();
            return result[2].affectedRows;
        }
        catch (err)
        {
            console.log(err);
            return null;
        }
    }else{
        return null;
    }
}

// Funció per encriure a una oferta
async function enscriureOferta(userData, id){
    if(userData.tipus_usuari === 'alumne'){
        try {
            let conn = await mariadb.getConn();
            const row = await conn.query(`SELECT DNI FROM alumne WHERE email = '${userData.id}';`);
            console.log(row);

            if(row){
                const row2 = await conn.query(`SELECT * FROM sollicitud_oferta WHERE oferta_id = ${id} and alumne_dni = '${row[0].DNI}';`);
                console.log(row2.lengths);
                if(row2.length === 0){
                    const result = await conn.query(`INSERT INTO sollicitud_oferta (oferta_id, alumne_dni) VALUES(${id}, '${row[0].DNI}');`);
                    console.log(result); 
                    conn.release();
                    return result.affectedRows;
                }
                else{
                    return null;
                }
            }
            else{
                return null;
            }
        }
        catch (err)
        {
            console.log(err);
            return null;
        }
    }else{
        return null;
    }
}

// Retorna la llista dels alumnes incrits per cada oferta
async function getAlumnesOferta(userData){
    console.log(userData)
    if(userData.tipus_usuari === 'empresa'){
        try {
            let conn = await mariadb.getConn();
            const row = await conn.query(`SELECT NIF FROM empresa WHERE email = '${userData.id}';`);
            if(row){
                const result = await conn.query(`select o.titol, a.nom , a.cognoms, a.email  from sollicitud_oferta so, oferta o , alumne a where so.oferta_id = o.id and so.alumne_dni = a.DNI and o.nif_empresa = '${row[0].NIF}';`);
                console.log(result);
                return result;
            }
            else{
                return null;
            }
        }
        catch (err)
        {
            console.log(err);
            return null;
        }
    }else{
        return null;
    }
}

module.exports =  {login, getCurs, getPobles, addUser, checkUser, checkDNI, findUser, activateAccount, updateActivationCode, changePassword, addFCT, addOfertaFeina, getOfertes, getOferta, validarOferta, eliminarOferta, enscriureOferta, getAlumnesOferta};