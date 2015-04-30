var express = require('express');
var router = express.Router(); 
var studentPassport = require('../config/passport-student'); 
var consts = require('../lib/constants');
var Student = require('../models/student');
var Review = require('../models/review');
var Landlord = require('../models/landlord');
var Comment = require('../models/comment');


/* 
 *  Create a review 
 */
function createReview(req, landlord, next){
  var review = new Review(); 
  review.title = req.body.title; 
  review.studentId = req.user.username; 
  review.landlordId = landlord.username; 
  review.content = req.body.content; 
  review.votes = 0; 

  review.save(function(err){
    if(err){
      return next(err, false);
    }

    return next(null, review);
  });
}

/* 
 *   passport related stuff
 */
router.post('/register', studentPassport.authenticate('registerStudent'), function(req, res){
  return res.json({
    'status' : true, 
  });
});

router.post('/login', studentPassport.authenticate('loginStudent'), function(req, res){
  return res.json({
    'status' : true, 
  });
});


router.get('/logout', function(req, res){
  req.logout(); 
  res.json({
    'status' : true, 
    'message' : "Loggd out succesfully"
  });
});


// student creates a review about a landlord
router.post('/reviews', function(req, res){
  console.log(req.cookie);
  if(!req.user){
    return res.json({
      'status' : false, 
      'message' : "Cannot create review. Student not logged in."
    });  
  }

  //check if the landlord exists
  Landlord.findOne({ 'username' : req.body.landlordId }, function(err, landlord){

    if(err){
      return res.json({
        'status' : false, 
        'message' : err
      });
    }

    if(!landlord){ //landlord doesn't exists
      /* 
       *  Create landlord from info in req.body 
       */
      var landlord = new Landlord(); 
      landlord.activated = false; 
      landlord.yearsInService = req.body.yearsInService; 
      landlord.phone = req.body.phone; 
      landlord.email = req.body.email; 
      landlord.type = consts.LANDLORD;

      if(req.body.companyname){ //landlord is a company
        landlord.username = req.body.companyname; 
        landlord.username = landlord.username.split(" ").join("_");
        landlord.companyname = req.body.companyname;
      } 
      else{ //landlord is a person
        landlord.username = req.body.firstname[0] + req.body.lastname.substring(0, 7);
        landlord.firstname = req.body.firstname; 
        landlord.lastname = req.body.lastname; 
      }


      landlord.save(function(err){
        if(err){
          return res.json({
            'status' : false, 
            'message' : "Failed to create a the new landlord."
          });
        }

        createReview(req, landlord, function(err, review){
          if(err){
            return res.json({
              'status' : false, 
              'message' : err
            });
          }

          return res.json({
            'status' : true,
            'message' : "Review and Landlord created successfully", 
            'review' : review
          });
        });
      });
    }
    else{
      createReview(req, landlord, function(err, review){
        if(err){
          return res.json({
            'status' : false, 
            'message' : err
          });
        }

        return res.json({
          'status' : true, 
          'message' : "Review created successfully", 
          'review' : review
        });
      }); 
    }
  });
});

/* 
 *  Student comment on a review
 */ 
router.post('/reviews/:reviewId', function(req, res){
  if(!req.user){
    return res.json({
      'status' : false, 
      'message' : "Must be logged in to comment"
    });
  }

  //make sure the review is real
  Review.findById(req.params.reviewId, function(err, review){
    if(err){
      return res.json({
        'status' : false, 
        'message' : err
      });
    }

    //check if the review exists
    if(!review){
      return res.json({
        'status' : false,
        'message' : "Failed to find the review." 
      });
    }

    //create a comment
    var comment = new Comment(); 
    comment.authorId = req.user.username; 
    comment.content = req.body.content;
    comment.reviewId = req.params.reviewId; 

    //save the comment 
    comment.save(function(err){
      if(err){
        return res.json({
          'status' : false, 
          'message' : err
        });
      }

      return res.json({
        'status': false, 
        'message': "Comment added successfully."
      });
    });
  });
}); 

/* 
 *  Student edits the review
 */
router.put('/review/:reviewId', function(req, res){
  if(!req.user){
    return res.json({
      'status' : false, 
      'message' : "Must be logged in to edit review"
    });
  }

  Review.findById(req.params.reviewId, function(err, review){
    if(err){
      return res.json({
        'status' : false, 
        'message' : err
      });
    }

    if(!review){
      return res.json({
        'status' : false, 
        'message' : "Not a real review."
      }); 
    }


    if(req.user.type != "student" || req.user.username != review.studentId ){
      return res.json({
        'status' : false, 
        'message' : "Only the original user can edit the post"
      }); 
    }

    //update the review with the new title and content
    review.title = req.body.title; 
    review.content = req.body.content; 

    review.save(function(err){
      if(err){
        res.json({
          'status' : false, 
          'message' : err
        });
      }

      return res.json({
        'status' : true, 
        'review' : review
      }); 
    });
  });
});

router.put('/review/:reviewId/vote', function(req, res){
  if(!req.user){
    return res.json({
      'status' : false, 
      'message' : "Have to be logged into vote"
    });
  }

  if(req.user.type != consts.STUDENT){
    return res.json({
      'status' : false, 
      'message' : "Must be a student in order to vote"
    });
  }

  Review.findById(req.params.reviewId, function(err, review){
    if(err){
      return res.json({
        'status' : false, 
        'message' : err
      });
    }

    if(!review){
      return res.json({
        'status' : false, 
        'message' : "Not a real review."
      });
    }

    if(req.body.upvote){
      review.votes++; 
    }
    else{
      review.votes--; 
    }

    review.save(function(err){
      if(err){
        return res.json({
          'status' : false, 
          'message' : err
        });
      }

      return res.json({
        'status' : true, 
        'message' : "Voted successfully."
      });
    })
  });
});

//update the student account
router.put('/update', function(req, res){
  if(!req.user){
    return res.json({
      'status' : false, 
      'message' : "Can't update user. User not logged in."
    });
  }

  Student.find({'username' : req.user.username}, function(err, student){
    if(err){
      return res.json({
        'status' : false,
        'message' : err
      });
    }

    if(!student){
      return res.json({
        'status' : false, 
        'message' : "Can't load student account"
      });
    }

    //update student info
    if(req.body.email) student.email = req.body.email; 
    if(req.body.phone) student.phone = req.body.phone; 
    if(req.body.yearsOffCampus) student.yearsOffCampus = req.body.yearsOffCampus;
    if(req.body.yearsAtCollege) student.yearsAtCollege = req.body.yearsAtCollege; 
    if(req.body.currentlyOffCampus) student.currentlyOffCampus = req.body.currentlyOffCampus; 

    student.save(function(err){
      if(err){
        return res.json({
          'status' : false, 
          'message' : err
        });
      }

      return res.json({
        'status' : true, 
        'message' : "Updated successfully."
      });
    });
  });
});

//delete student account
router.delete('/delete', function(req, res){
  if(!req.user){
    return res.json({
      'status' : false, 
      'message' : "Must be logged in to delete your account."
    });
  }
  //delete the account
  Student.remove({'username' :  req.user.username}, function(err){
    if(err){
      return res.json({
        'status' : false, 
        'message' : err
      });
    }

    req.logout();
    return res.json({
      'status' : true, 
      'message' : "User deleted successfully."
    });
  });
});

//delete a student review
router.delete('/review/:reviewId', function(req, res){
  //make sure the user is logged in
  if(!req.user){
    return res.json({
      'status' : false, 
      'message' : "User must be logged in to delete the review."
    });
  }

  //load the review
  Review.findById(req.params.reviewId, function(err, review){
    if(err){
      return res.json({
        'status' : false, 
        'message' : err
      });
    }

    if(!review){
      return res.json({
        'status' : false, 
        'message' : "Review does not exist."
      });
    }

    if(review.studentId != req.user.username){
      return res.json({
        'status' : false,
        'message' : "Not original author"
      });
    }
    else{
      Review.delete({'_id' : req.params.reviewId }, function(err){
        if(err){
          return res.json({
            'status' : false, 
            'message' : err
          }); 
        }

        return res.json({
          'status' : true, 
          'message' : "Review delete successfully."
        });
      });
    }
  });
});


//delete a student comment
router.delete('/comment/:commentId', function(req, res){
  if(!req.user){
    return res.json({
      'status' : false, 
      'message' : "Must be logged in to delete a comment."
    });
  }

  Comment.findById(req.params.commentId, function(err, comment){
    if(err){
      return res.json({
        'status' : false, 
        'message' : err
      });
    }

    if(!comment){
      return res.json({
        'status' : false, 
        'message' : "Comment doesn't exists"
      });
    }

    //not the author
    if(comment.authorId != req.user.username){
      return res.json({
        'status' : false, 
        'message' : "Only the author can delete the comment."
      });
    }

    //everything checks out
    Comment.remove({'_id' : req.params.commentId}, function(err){
      if(err){
        return res.json({
          'status' : false, 
          'message' : err
        });
      }

      return res.json({
        'status' : true, 
        'message' : "Comment deleted successfully."
      });
    });
  });
}); 

/* 
 *  Availble regardless of whether or not you're logged in 
 */
//want a list of all the students
router.get('/', function(req, res){
  Student.find(function(err, students){
    if(err){
      return res.json(err);
    }
    // for each student remove the password 
    for(student in students){
      students[student].password = "";
    }

    return res.json({'students' : students});
  });
});

//want a specific student
router.get('/:username', function(req, res){
  Student.findOne({'username' : req.params.username}, function(err, student){
    if(err){ //error 
      return res.json(
        {
          'status' : false,
          'message' : 'failed to access the database'
        }
      );
    }

    if(!student){ //couldn't find the student
      return res.json(
        {
          'status' : false,
          'message' : 'failed to find the student'
        }
      );
    }

    student.password = "";

    return res.json(
      {
        'status' : true, 
        'student' : student
      }
    );
  });
  //
});

//get the comments for each review
function getComments(counter, reviews, next){
  if(counter < reviews.length){
    Comment.find({'reviewId' : reviews[counter]._id}, function(err, comments){
      if(!err){
        reviews[counter].comments = comments;
        getComments(counter+1, reviews, next); 
      }
      else{
        next(err, false);
      }
    });
  }
  else{
    next(null, reviews);
  }
}

//want the reviews for the student
router.get('/:username/reviews', function(req, res){
  Review.find({'studentId' : req.params.username}, function(err, reviews){
    if(err){
      return res.json({
        'status' : false,
        'message' : "Failed to find user's reviews"
      }); 
    }

    getComments(0, reviews, function(err, reviews){
      if(err){
        return res.json({
          'status' : false, 
          'message' : err
        });
      }

      return res.json({
        'status' : true, 
        'reviews' : reviews
      });
    });
  });
});

module.exports = router;