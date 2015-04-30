var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.json(
    {
      'message' : 'root route'
    }
  )
});

router.get("/authenicated", function(req, res){
  if(req.user){
    return res.json({
      'status' : true
    });
  }
  else{
    return res.json({
      'status' : false
    });
  }
});


router.get('/currentUser', function(req, res){
    if(req.user){
        req.user.password = "";
        return res.json(
            {
                'status': true, 
                'user': req.user
            }
        );
    }

    return res.json(
        {
            'status': false, 
            'error': "No user logged in."
        }
    );
});

module.exports = router;
