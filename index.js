const express = require('express');
const logger = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const mariadb = require('mariadb');

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(logger('dev'));
app.use(cors());
app.use(helmet());


var consultasRouter = require('./routes/consultas');
//Definicion de rutas
app.use('/api', consultasRouter);


mariadb.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME
}).then(_ =>{
    console.log("Connected with the database successfully.");
    app.listen(3000, function(){
        console.log("Server on port 3000");
    });
}).catch(err =>{
    console.log(err);
})


