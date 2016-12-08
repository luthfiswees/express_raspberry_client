var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// module needed by LuthfiKP
global.dirname = __dirname;
global.status_file = __dirname + "/information_storage/status.txt";
global.forecast_file = __dirname + "/information_storage/forecast.txt";
global.light_sensor_file = process.env.LIGHT_SENSOR_FILE;
global.ultrasonic_sensor_file = process.env.ULTRASONIC_SENSOR_FILE;
global.light_sensor_value = 100;
global.ultrasonic_sensor_value = 100;
global.light_sensor_threshold = 50;
global.ultrasonic_sensor_threshold = 20;

var filesystem = require('fs');
var CronJob = require('cron').CronJob;
var S = require('string');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


// List of cron jobs
// Made for raspberry pi

var exec = require('child_process').exec;
var nyalain = __dirname + "/bash_operations/turn_on.sh";
var matiin  = __dirname + "/bash_operations/turn_off.sh";

// Cron job for fetching servo status
new CronJob('*/2 * * * * *', function() {

  filesystem.readFile( global.status_file, 'utf8', function(err, data) {
    if (err){
      res.json({error: true, notification: "file hasn't been initialized"});
      console.dir(err);
    }else{
      if(data === "true"){
          exec(nyalain, function(error, stdout, stderr) {
          console.log("masuk");
          if (error) {
             console.log(error);
          }
          });
      }else {
         exec(matiin, function(error, stdout, stderr) {
         console.log("keluar");
         if (error) {
            console.log(error);
         }
         });
      }
    }
  });

}, null, true, 'America/Los_Angeles');

// Cron job for updating forecast information
new CronJob('*/3 * * * * *', function() {

  filesystem.readFile(global.light_sensor_file, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  else{
    global.light_sensor_value = parseInt(data);

    filesystem.readFile(global.ultrasonic_sensor_file, 'utf8', function (err,datas) {
    if (err) {
      return console.log(err);
    }
    else{
      global.ultrasonic_sensor_value = parseInt(datas);
      console.log('Light sensor value : ' + global.light_sensor_value + ',  Ultrasonic sensor value : ' + datas );
    }});
  }});

}, null, true, 'America/Los_Angeles');

// Cron job for updating forecast status automatically
new CronJob('*/4 * * * * *', function() {

  if (light_sensor_value < light_sensor_threshold){
    if (ultrasonic_sensor_value < ultrasonic_sensor_threshold){
	filesystem.writeFile(global.forecast_file, 'Hard Rain', function (err) {
   	  if (err) {
	    console.log(err);
	  }else{
	    console.log('Forecast updated to Hard Rain');
	  }
	});
    }else{
	filesystem.writeFile(global.forecast_file, 'Cloudy', function (err) {
          if (err) {                       
            console.log(err);
          }else{ 
            console.log('Forecast updated to Cloudy');
          }
        });
    }
  }else{
    if (ultrasonic_sensor_value < ultrasonic_sensor_threshold){ 
	filesystem.writeFile(global.forecast_file, 'Light Rain', function (err) {
          if (err) {                       
            console.log(err);
          }else{ 
            console.log('Forecast updated to Light Rain');
          }
        });
    }else{ 
	filesystem.writeFile(global.forecast_file, 'Sunny', function (err) {
          if (err) {                       
            console.log(err);
          }else{ 
            console.log('Forecast updated to Sunny');
          }
        });
    }
  }

}, null, true, 'America/Los_Angeles');

// Cron job for updating servo status automatically
new CronJob('*/5 * * * * *', function() {

  filesystem.readFile(global.forecast_file, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }else{
      if (S(data).contains('Rain')) {
	filesystem.writeFile(global.status_file, "true", function (err) {
	  if (err){
	    console.log(err);
	  } else {
	     console.log('Jemuran dimasukkan');
	  }
	});
      }else{
	filesystem.writeFile(global.status_file, "false", function (err) {
          if (err){ 
            console.log(err);
          } else { 
             console.log('Jemuran dikeluarkan');
          }
        });
      }
    }
  });

}, null, true, 'America/Los_Angeles');

