var jwt = require('jsonwebtoken');
module.exports=(req, res, next)=>{
    try{
        // var token = req.headers.authorization.split(" ")[1];
        var token = req.headers["x-access-token"].split(" ")[1];
        var decode = jwt.verify(token, 'secretkey123456');
        req.userData = decode;
        next();
    }catch(error){
        res.status(401).json({
            error:"Invalid Token"
        });
    }
}