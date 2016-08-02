var http = require('http');
var express = require('express');
var credentials = require('./credentials.js');
var app = express();
var mongoose = require('mongoose');
var opts = {
    server : {
        socketOptions : {keepAlive : 1}
    }
};
// Set port to listen to
app.set('port', process.env.PORT || 3000);
var handlebars = require('express-handlebars')
    .create({defaultLayout : 'main.handlebars'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(require('body-parser').urlencoded({ extended : true}));

var rp = require('request-promise');

app.use(express.static(__dirname + '/public'));

switch (app.get('env')) {
    case 'development':
        mongoose.connect(credentials.mongo.development.connection, opts);
        break;
    case 'production':
        mongoose.connect(credentials.mongo.development.connection, opts);   
        break;
    default:
        throw new Error('unknown execution environemnt ' + app.get('env'));
}

var FAQ = require('./models/faq.js');
FAQ.find(function(err, faqs){
    if (err) {
        return console.error(err);
    }
    if (faqs.length) {
        return;
    }

    new FAQ({
        name : 'MyScheduling',
        links : ['https://myscheduling.accenture.com'],
        message : 'Open roles can be found here %s',
        tags : ['roles', 'role', 'assignments', 'projects', 'project', 'staffed']
    }).save();

    new FAQ({
        name : 'Talent Communities',
        links : ['https://avanade.sharepoint.com/sites/talentcommunities/pages/tc-home.aspx'],
        message : 'Talent communities can be found here %s',
        tags : ['talent communities', 'talent community', 'talent']
    }).save();

    new FAQ({
        name : 'Global Holidays',
        links : ['https://avanade.sharepoint.com/sites/HR/Pages/GlobalHolidays.aspx'],
        message : 'Check out Avanade Global Holidays here %s',
        tags : ['holidays', 'avanade holidays', 'holiday']
    }).save();        

    new FAQ({
        name : 'Extended Benefits Balance',
        links : ['https://enterprisereports.avanade.com/EA_REPORTS/Pages/Report.aspx?ItemPath=/HR/Extended+Benefits+Reports/MyTE_Extended_Benefits_by_Employee'],
        message : 'You can find your extended benefits balance here %s',
        tags : ['extended benefits balance', 'extended benefits' ]
    }).save();    

    new FAQ({
        name : 'Benefits',
        links : ['https://avanade.sharepoint.com/sites/HR/Pages/GlobalHolidays.aspx'],
        message : 'Check out the HR Benefits Hub %s',
        tags : ['benefits', 'avanade benefits']
    }).save();        
});

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
                FAQ.find({ tags : { "$in" : [parsedBody.documents[0].keyPhrases]}}, function(err, faqs){
                    // nothing found
                    if (!faqs.length) {
                        res.send({success : true, question : req.body.question, keyPhrases : parsedBody.documents[0].keyPhrases, answer : 'Could not find an answer for you :-(', found : false});
                }
                    else {
                        console.log(faqs[0]);
                        console.log('Errors: ' + err);
                        console.log('links array: ' + faqs[0].links);
                        res.send({success : true, question : req.body.question, keyPhrases : parsedBody.documents[0].keyPhrases, answer : faqs[0].message, link : faqs[0].links[0], found : true});
                    }

                });
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