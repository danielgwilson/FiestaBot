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

var recognizer = new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v2.0/apps/2420934d-e9c4-476e-b186-59acfe37bad0?subscription-key=33eb75ecc58540f1a7cb15d107fd23e4&verbose=true');
var intents = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', intents);

intents.matches('change name', [
    function (session, results, next) {
        var name = builder.EntityRecognizer.findEntity(results.entities, 'name');
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
intents.matches('ingredients,'[
    function(session, results){
        console.log("~~~~", results.response.entity)
        console.log("INTENTS 2", intents)
        if(results.response.entity === "See ingredients"){
            if(session.userData.ingredients){
                 session.send("You currently have "+ session.userData.ingredients.join(", "))
            }
            else{
                session.send("You haven't added any ingredients")
            }
        }
        else{
            session.send("You sent a wrong response")
        }
    }
    ]
)

// Hi nice to meet you, what's your name
// Wanna have a party? What ingredients do you have
// 
intents.matches('addIngredient', '/addIngredient');
// intents.matches('addMusic', '/addMusic')


intents.onDefault([
    function (session, results, next) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Hello %s!', session.userData.name);
        builder.Prompts.choice(session, "What would you like to do? Type it in or check your smart reccomendations", "See ingredients|See music")
    },
    function(session, results){
        console.log("~~~~", results.response.entity)
        console.log("INTENTS 2", intents)
        if(results.response.entity === "See ingredients"){
            if(session.userData.ingredients){
                 session.send("You currently have "+ session.userData.ingredients.join(", "))
            }
            else{
                session.send("You haven't added any ingredients")
            }
        }
        else{
            session.send("You sent a wrong response")
        }
    }
]);

//dialog GET's

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
    }
]);

bot.dialog('/addIngredient', [
    function(session, results, next){
        var ingredient = builder.EntityRecognizer.findEntity(results.entities, 'ingredient');
        if (!ingredient) {
            builder.Prompts.text(session, "What ingredients do you have?");
        } else {
            next({ response: ingredient.entity });
        }
    },
    function(session, results){
        if(results.response){
            var ingredients = results.response.split(/[ ,]+/);
            ingredients.forEach(ingredient => session.userData.ingredients.push(ingredient))
            builder.Prompts.text(session, "You have added "+ session.userData.ingredients.join(", "))
        }
    }
]);
bot.dialog('/recommendMusic', [
    function(session, results, next){
        var music = //insert music understanding ai here
        builder.Prompts.text(session, "What artists do you like?")
    }
])


