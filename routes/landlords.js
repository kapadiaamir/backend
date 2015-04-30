var express = require('express');
var router = express.Router();
var landlordPassport = require('../config/passport-landlord'); 
var consts = require('../lib/constants');
var Landlord = require('../models/landlord'); 
var Review = require('../models/review');
var Comment = require('../models/comment');

/* 
 *  Set up routes for logging in, registering, and logging out
 */
router.post('/register', landlordPassport.authenticate('registerLandlord'), function(req,  res){
  if(req.user){
    return res.json({
      'status' : true
    });
  }
});

router.post('/login', landlordPassport.authenticate('loginLandlord'), function(req, res){
  if(req.user){
    return res.json({
      'status' : true
    });
  }
});

router.get('/logout', function(req, res){
  req.logout(); 
  res.json({
    'status' : true, 
    'message' : "Loggd out succesfully"
  });
});

/* 
 *  Logged in actions for landlords
 * 
 *   -> comment on reviews about them
 */
router.post('/reviews/:reviewId', function(req, res){
  if(!req.user){ //landlord not logged in
    return res.json({
      'status' : false,
      'message' : "Unauthorized: Landlord not logged in."
    });
  }

  //check if the landlord is the one being reviewed
  Review.findById(req.params.reviewId, function(err, review){
    if(err){
      return res.json({
        'status': false, 
        'error': err
      });
    }

    if(!review){
      return res.json({
        'status': false, 
        'message': "Failed to find the review."
      });
    }

    if(review.landlordId != req.user.username){
      return res.json({
        'status': false, 
        'message': "Review not about them!"
      });
    }

    var comment = new Comment(); 
    comment.authorId = req.user.username; 
    comment.reviewId = review._id; 
    comment.content = req.body.content; 

    comment.save(function(err){
      if(err){
        return res.json({
          'status': false, 
          'message': "Failed to save comment."
        });
      }

      return res.json({
        'status': true,
        'message': "Comment added succesfully!"
      });
    });
  });
});

router.put('/comments/:commentId', function(req, res){
  if(!req.user){
    return res.json({
      'status': false, 
      'message': "Unauthorized. Landlord not logged in."
    });
  }

  Comment.findById(req.params.commentId, function(err, comment){
    if(err){
      return res.json({
        'status': false, 
        'message': "Error connecting to the database."
      });
    }

    if(!comment){
      return res.json({
        'status': false, 
        'message': "Unable to find that comment."
      });
    }

    //found comment 
    //check if the comment was made by current user
    if(req.user.username != comment.authorId){
      return res.json({
        'status': false, 
        'message': "Unauthorized user."
      }); 
    }

    //correct user 
    comment.content = req.body.content; 

    comment.save(function(err){
      if(err){
        return res.json({
          'status': false, 
          'error': err
        });
      }

      return res.json({
        'status': true, 
        'message': "Updated comment succesfully."
      });
    }); 
  });
});

/* 
 *  Get all the landlords in the system
 */
router.get('/', function(req, res){
  Landlord.find(function(err, landlords){
    if(err){
      return res.json({
        'status' : false, 
        'message' : err
      });
    }

    if(!landlords){
      return res.json({
        'status' :  false, 
        'message' : "Failed to find any landlords"
      });
    }

    for(landlord in landlords){
      landlords[landlord].password = "";
    }

    //send the landlords
    return res.json({
      'status' : true, 
      'landlords' : landlords
    });
  });
});

/* 
 *  Get landlord information
 */
router.get('/:username', function(req, res){
    Landlord.findOne({'username' : req.params.username }, function(err, landlord){
        if(err){
            return res.json({
                'status' : false, 
                'message' : err
            });
        }

        if(!landlord){
            return res.json({
                'status' : false, 
                'message' : "Failed to find landord"
            });
        }

        //found landlord
        landlord.password = "";

        return res.json({
            'status' : true,
            'landlord' : landlord
        });
    });
}); 

/* 
 *  Get reviews about a specific landlord
 */
router.get('/:username/reviews', function(req, res){
    Review.find({'landlordId' : req.params.username }, function(err, reviews){
        if(err){
            return res.json({
                'status' : false, 
                'message' : err
            });
        }

        if(!reviews){
            return res.json({
                'status' : false,
                'message' : "Can't find any reviews by a landlord with that username."
            });
        }

        //found the reviews
        return res.json({
            'status' : true, 
            'reviews' : reviews
        });
    });
});

/**
 *  Get a specific review with it's comments
 */
router.get('/:username/reviews/:reviewId', function(req, res){
  //check if real review
  Review.findById(req.params.reviewId, function(err, review){
    if(err){
      return res.json({
        'status': false, 
        'error': err
      });
    }

    if(!review){
      return res.json({
        'status': false, 
        'message': "Failed to find review"
      });
    }

    Comment.find({'reviewId': req.params.reviewId}, function(err, comments){
      if(err){
        return res.json({
          'status': false, 
          'error': err
        });
      }

      if(!comments){
        return res.json({
          'status': false, 
          'message': "Failed to find comments"
        });
      }

      return res.json({
        'status': true, 
        'review': review, 
        'comments': comments
      });
    });
  });
});

module.exports = router;