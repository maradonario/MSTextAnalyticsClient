var http = require('http');
var express = require('express');
var credentials = require('./credentials.js');
var app = express();
// Set port to listen to
app.set('port', process.env.PORT || 3000);
var handlebars = require('express-handlebars')
    .create({defaultLayout : 'main.handlebars'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(require('body-parser').urlencoded({ extended : true}));

var rp = require('request-promise');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.render('home');
});

app.get('/about', function(req, res){
    res.render('about');
});

app.get('/faq', function(req, res){
    res.render('faq');
});

app.post('/process', function(req, res){
    if (req.xhr || req.accepts('json,html') === 'json') {
        console.log('Question is: ' + req.body.question);
        // This should be sent to a module
        var body = {
            "documents": [
                {
                    "id": "1",
                    "text": req.body.question
                }
            ]
        };
        var options = {
            method: 'POST',
            uri: 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/keyPhrases',
            body: body,
            json: true, // Automatically stringifies the body to JSON,
            headers: {
                "Ocp-Apim-Subscription-Key": credentials.cognitiveServices.key,
                "Content-Type" : "application/json",
                "Accept" : "application/json"
            } 
        };
        
        rp(options)
            .then(function (parsedBody) {
                // POST succeeded... 
                console.log(parsedBody);
                console.log(parsedBody.documents[0].keyPhrases);

                res.send({success : true, question : req.body.question, keyPhrases : parsedBody.documents[0].keyPhrases})
            })
            .catch(function (err) {
                // POST failed... 
                res.send({success : false, question : req.body.question})
            });     
    }
    else {
        res.redirect(303, '/');
    }
});

app.use(function(req, res, next){
    res.status(404);
    res.render('404');
});

app.use(function(req, res, next){
    res.status(500);
    res.render('500');
});


var server;
function startServer() {
    server = http.createServer(app).listen(app.get('port'), function(){
      console.log( 'Express started in ' + app.get('env') +
        ' mode on http://localhost:' + app.get('port') +
        '; press Ctrl-C to terminate.' );
    });
}

if(require.main === module){
    // application run directly; start app server
    startServer();
} else {
    // application imported as a module via "require": export function to create server
    module.exports = startServer;
}