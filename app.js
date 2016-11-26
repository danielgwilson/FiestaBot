var builder = require('botbuilder');
var restify = require('restify');
var http = require("http");

// Watson

var options = {
  "method": "POST",
  "hostname": "api.ibm.com",
  "port": null,
  "path": "/chefwatson/api/v1/flavor-combinations/generator",
  "headers": {
      "accept": "application/json",
      "content-type": "application/json",
  }
  }

  // Set up the request
  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
  });

  // post the data
  post_req.write(post_data);
  post_req.end();

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

var recognizer = new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v2.0/apps/f0b89ad3-f79f-4aca-860a-09d4b77cd822?subscription-key=3ab22a9d89834a12a858adba547ab529&verbose=true');
var intents = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', intents);

intents.matches('change name', [
    function (session, args, next) {
        var name = builder.EntityRecognizer.findEntity(args.entities, 'name');
        if (!name) {
            builder.Prompts.text(session, "Okay, what would you like me to call you?");
        } else {
            next({ response: name.entity });
        }
    },
    function (session, results) {
        if (results.response) {
            session.userData.name = results.response;
            session.send('Okay... Changed your name to %s', session.userData.name);
        } else {
            session.send('Okay.')
        }
    }
]);

intents.onDefault([
    function (session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Hello %s!', session.userData.name);
    }
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);
