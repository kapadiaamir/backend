var passport = require('passport'); 
var LocalStrategy = require('passport-local').Strategy;
var consts = require('../lib/constants'); 
var Landlord = require('../models/landlord'); 
var encryption = require('../lib/encryption'); 

function completeLandlord(req, landlord, encryptedPassword, next){
    landlord.password = encryptedPassword; 
    landlord.username = req.body.username; 
    landlord.type = consts.LANDLORD;
    landlord.yearsInService = req.body.yearsInService; 
    landlord.email = req.body.email; 
    landlord.phone = req.body.phone;
    landlord.activated = true;

    //check if its a company or individual
    if(req.body.companyname){
         landlord.companyname = req.body.companyname; 
    }
    else{
        landlord.firstname = req.body.firstname; 
        landlord.lastname = req.body.lastname;
    }

    landlord.save(function(err){
        if(err){
            return next(err, false); 
        }

        console.log("saving landlord!");

        return next(null, landlord);
    });
}

/* 
 * Landlord Registration Strategy
 * 
 * When registering a landlord, we need to see how the landlord's account is being created
 *   
 * -> student writing review about a landlord that doesn't exist in our database  :: no password
        in this case, we'll just create the landlord account in ./routes/students 
 * -> landlord creating a brand new account with no reviews :: password
 * -> landlord taking control of account that has reviews :: password 
 */
var landlordRegistrationStrategy = new LocalStrategy(
    {
        passReqToCallback: true
    },
    function(req, username, password, next){
        process.nextTick(function(){
            console.log("-- creating a landlord account --");
            //check to see if the landlord already exists
            Landlord.findOne({ 'username' : username }, function(err, landlord){
                if(err){
                    return next(err, false);
                }

                if(landlord){ //landlord exists, check if he/she's activated
                    if(landlord.activated){ //landlord account is already activated
                        var error = {
                            'status' : false,
                            'error' : { 
                                'message' : "landlord account already activated."
                            }
                        }
                        return next(error, false);
                    }
                    else{
                        //landlord not activated, just take the password, hash it, and save
                        encryption.encryptPassword(password, function(err, encryptedPassword){
                            if(err){
                                return next(null, false);
                            }

                            return completeLandlord(req, landlord, encryptedPassword, next); 
                        });
                    }
                }
                else {
                    //landlord account doesnt exists
                    landlord = new Landlord(); 

                    //encrypt landlord's password
                    encryption.encryptPassword(password, function(err, encryptedPassword){
                        if(err){
                            return next(null, false);
                        }

                        return completeLandlord(req, landlord, encryptedPassword, next);
                    });
                }
            });
        });
    }
);

/* 
 *  Landlord login stategy
 */
var landlordLoginStrategy = new LocalStrategy(
    {
        passReqToCallback : true
    }, 
    function(req, username, password, next){
        //keep everything running asyncly
        process.nextTick(function(){
            //find the landlord
            Landlord.findOne({'username' : username}, function(err, landlord){
                
                if(err){
                    return next(err, false);
                }

                if(!landlord){

                    return next(null, false);
                }

                encryption.verifyPassword(landlord.password, password, function(err, result){
                    if(result){
                        return next(null, landlord);
                    }
                    else{
                        return next(null, false);
                    }
                });
            });
        });
    }
);

//use strategies
passport.use('loginLandlord', landlordLoginStrategy);
passport.use('registerLandlord', landlordRegistrationStrategy);

module.exports = passport; 