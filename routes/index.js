var express = require('express');
var router = express.Router();
var filesystem = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/get_status', function(req, res, next){
  filesystem.readFile( global.status_file, 'utf8', function(err, data) {
    if (err){
      res.json({error: true, notification: "file hasn't been initialized"});
      console.dir(err);
    }else{
      res.json({error: false, status: data});
      console.log("DATA : " + data);
    }
  });
});

router.post('/set_status', function(req, res, next){
  filesystem.writeFile( global.status_file, req.body.status, function(err){
    if (err){
      res.json({error: true, notification: "file corrupt"});
      console.dir(err);
    }else{
      res.json({error: false, notification: "status has been updated to " + req.body.status});
      console.log("status has been updated to " + req.body.status);
    }
  });
});

router.post('/get_forecast', function(req, res, next){
  filesystem.readFile( global.forecast_file, 'utf8', function(err, data) {
    if (err){
      res.json({error: true, notification: "file hasn't been initialized"});
      console.dir(err);
    }else{
      res.json({error: false, forecast: data, light_value: global.light_sensor_value, ultrasonic_value: global.ultrasonic_sensor_value});
      console.log("DATA : " + data);
    }
  });
});

router.post('/set_forecast', function(req, res, next){
  filesystem.writeFile( global.forecast_file, req.body.forecast, function(err){
    if (err){
      res.json({error: true, notification: "file corrupt"});
      console.dir(err);
    }else{
      res.json({error: false, notification: "forecast has been updated to " + req.body.forecast});
      console.log("status has been updated to " + req.body.forecast);
    }
  });
});

module.exports = router;
