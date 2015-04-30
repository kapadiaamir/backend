var passport = require('passport'); 
var LocalStrategy = require('passport-local').Strategy; 
var consts = require('../lib/constants');
var Student = require('../models/student'); 
var Landlord = require('../models/landlord');
var encryption = require('../lib/encryption'); 

/* 
 * Strategy to register a student
 */
var studentRegistrationStrategy = new LocalStrategy(
    {
        passReqToCallback: true
    },
    function(req, username, password, next){

        //keeping it async    
        process.nextTick(function(){
            console.log("----Registering a student----")
            //see if we can find the user 
            Student.findOne({ 'username' : username }, function(err, student){
                if(err){ //return for errors
                    return next(err, false); 
                }

                if(student){ //found a student with the same username
                    return next(null, false);
                }

                //didn't find a student, let's register him/her
                var student = new Student(); 

                //add credentials
                student.type = consts.STUDENT;
                student.username  = username;
                student.email = req.body.email; 
                student.firstname = req.body.firstname; 
                student.lastname = req.body.lastname; 
                student.yearsAtCollege = req.body.yearsAtCollege; 
                student.yearsOffCampus = req.body.yearsOffCampus; 

                encryption.encryptPassword(password, function(err, encryptedPassword){
                    if(err){
                        return next(err, false); 
                    }

                    student.password = encryptedPassword; 

                    //save student
                    student.save(function(err){
                        if(err){
                            return next(err, false); 
                        }

                        return next(null, student);
                    });
                });

            });
        });
    }
);


/* 
 * Strategy to login a student
 */
var studentLoginStrategy = new LocalStrategy(
    {
        passReqToCallback : true
    },
    function(req, username, password, next){
        //keep it async
        process.nextTick(function(){

            //try and find the student
            Student.findOne({'username' : username}, function(err, student){
                if(err){ //return any errors
                    return next(err, false); 
                }

                if(!student){ //can't find the student
                    return next(null, false); 
                }

                //found the student, lets verify the password
                encryption.verifyPassword(student.password, password, function(err, result){
                    if(err){
                        return next(err, false);
                    }

                    if(!result){ //invalid password
                        return next(null, false); 
                    }

                    //valid student
                    return next(null, student);
                });
            });
        });
    }
);

/*
 *  Set up passport sessions to serialize and deserialize student accounts
 */
passport.serializeUser(function(user, next){
    return next(null, user.username + "|" + user.type);
});

passport.deserializeUser(function(username, next){
    user_stats = username.split("|");
    username = user_stats[0];
    type = user_stats[1];

    console.log(username); 
    console.log(type);
    var obj; 

    if(type == consts.LANDLORD){
        obj = Landlord; 
    }
    else if(type == consts.STUDENT){ 
        obj = Student; 
    }

    obj.findOne({"username" : username}, function(err, user){
        if(err){
            return next(err, false); 
        }

        if(!user){
            return next(null, false);
        }

        return next(null, user);
    });
});


/* 
 *  Tell passport what strategies to use
 */
passport.use('registerStudent', studentRegistrationStrategy); 
passport.use('loginStudent', studentLoginStrategy);

module.exports = passport; 
