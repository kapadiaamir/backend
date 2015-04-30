var scrypt = require('scrypt');

/* 
 * Set up scrypt 
 */ 
scrypt.hash.config.keyEncoding = "ascii"; 
scrypt.hash.config.outputEncoding = "hex";
scrypt.verify.config.keyEncoding = "ascii";
scrypt.verify.config.hashEncoding = "hex";

/* 
 *  Encrypt and verify a landlord's password
 */
var encryptPassword = function encryptPassword(password, next){
    scrypt.params(0.1, function(err, scryptParameters){
        if(err){
            return next(err, false);
        }
        scrypt.hash(password, scryptParameters, function(err, encryptedPassword){
            if(err){
                return next(err, false);
            }

            return next(null, encryptedPassword); 
        });
    }); 
}

var verifyPassword = function verifyPassword(encryptedPassword, password, next){

    scrypt.verify(encryptedPassword, password, function(err, result){
        if(err){
            console.log("erroring here");
            return next(err, false); 
        }

        return next(null, result);
    });
}

var encryption = {
    'encryptPassword' : encryptPassword, 
    'verifyPassword' : verifyPassword
}

module.exports = encryption;