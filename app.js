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
var latitude = -6.3608;
var longitude = 106.8317;
var CronJob = require('cron').CronJob;
var Forecast = require('forecast');
var rp = require('request-promise');
var forecast = new Forecast({
  service: 'darksky',
  key: process.env.DARKSKY_API_KEY,
  units: 'celcius',
  cache: true,      // Cache API requests
  ttl: {            // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/
    minutes: 27,
    seconds: 45
  }
});

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

  var options = {
    method: 'POST',
    uri: process.env.SYSPROG_API_URL + "fetch_status",
    body: {
        some: 'payload'
    },
    json: true // Automatically stringifies the body to JSON
  };

  rp(options)
    .then(function (parsedBody) {
        if(parsedBody.status === "true"){
	          exec(nyalain, function(error, stdout, stderr) {
            console.log("nyala");
	          if (error) {
	             console.log(error);
	          }
            });
        }else {
	         exec(matiin, function(error, stdout, stderr) {
 	         console.log("mati");
	         if (error) {
	            console.log(error);
	         }
           });
        }
    })
    .catch(function (err) {
        // POST failed...
    });

}, null, true, 'America/Los_Angeles');

// Cron job for sending forecast information
new CronJob('0 */3 * * * *', function() {

  forecast.get([latitude, longitude], function(err, weather) {
    if(err) return console.dir(err);
    console.log(weather.currently.summary);

    var options = {
        method: 'POST',
        uri: process.env.SYSPROG_API_URL + "store_forecast",
        form: {
            category: "forecast",
            forecast: JSON.stringify(weather.currently.summary)
        },
        headers: {
            'content-type': 'application/x-www-form-urlencoded' // Set automatically
        },
        json: true
    };

    rp(options)
      .then(function (parsedBody) {
          console.log(parsedBody);
      })
      .catch(function (err) {
          // POST failed...
      });

  });

}, null, true, 'America/Los_Angeles');
