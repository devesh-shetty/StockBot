/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. 
For a complete walkthrough of creating this type of bot see the article at
http://docs.botframework.com/builder/node/guides/understanding-natural-language/
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var yahooFinance = require('yahoo-finance');

var express = require('express');
    var fs = require('fs');
    var request = require('request');
    var cheerio = require('cheerio');
    var app     = express();

//var useEmulator = (process.env.NODE_ENV == 'development');

var useEmulator = true;

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: 'ad6d25e4-a8b4-426e-ae29-85956e466348',
    appPassword: 'nCAWAfwse1d72rNx9gkYadx',
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

// Make sure you add code to validate these fields
var luisAppId = "320564d9-42e2-4735-8223-c234f258c5ae";
var luisAPIKey = "6d4c78dafadb481ea52898920ff6bcd5";
var luisAPIHostName = process.env.LuisAPIHostName || 'api.projectoxford.ai';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;
//const LuisModelUrl = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/320564d9-42e2-4735-8223-c234f258c5ae?subscription-key=d9fd47aa-191e-4e17-96f3-cc98c89495ba&verbose=true';
// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
.matches('greet', (session, args) => {
    session.send('Hi this you personal stockbot here, how can i help?');
})
.matches('stock info', (session, args) => {

    //session.send(' Debugging (%s)\'.', args);
    var companyEntity = builder.EntityRecognizer.findEntity(args.entities, 'stockname');
    companyEntity = 'aapl';
    //console.table(args);

    var url = 'http://finance.yahoo.com/quote/'+companyEntity+'?ltr=1';


    request(url, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);

            var title, release, rating;
            var json = { price : "", name : "", rating : ""};

             var parent = $("#quote-header-info");
            json.name = parent.children().first().children().first().children().first().text();

            json.price = parent.children().next().children().first().children().first().text();

             
                // json.name = $('h1').filter(function(i, el) {
                            
                //             return $(this).attr('data-reactid') === '250';
                //             }).text();

                //             json.price = $('span').filter(function(i, el) {
                            
                //             return $(this).attr('data-reactid') === '279';
                //             }).val();

             //json.price = $('span').attr('data-reactid','279').text();

            // json.name = $('h1[data-reactid="250"]').text();
            // json.price = $('span[data-reactid="279"]').text();
            //console.log(json);

            session.send(' \'%s \n (%s)\'.', json.name,
         json.price);
        }
    })
   
   
   
    // var SYMBOL = 'AAPL';

    // yahooFinance.historical({
    // symbol: SYMBOL,
    // from: '2017-01-27',
    // to: '2017-01-28',
    // period: 'd'
    // }, function (err, quotes) {
    // if (err) { throw err; }

   

    //         session.send('Hi! This is the stock intent handler. You said: \'%s (%d)\'.', SYMBOL,
    //     quotes.length);
    // if (quotes[0]) {
    //     console.log(
    //     '%s\n...\n%s',
    //     JSON.stringify(quotes[0], null, 2),
    //     JSON.stringify(quotes[quotes.length - 1], null, 2)
    //     );
    // } else {
    //     console.log('N/A');
    // }
    // });
    
    //session.send('Hi! This is the stock intent handler. You said: \'%s\'.', session.message.text);
})
.matches('buy stocks', (session, args) => {
    session.send('Hi! This is the buy stock handler. You said: \'%s\'.', session.message.text);
})
.matches('trending stocks', (session, args) => {
    session.send('Hi! This is the trending handler. You said: \'%s\'.', session.message.text);
})
.matches('sell stocks', (session, args) => {
    session.send('Hi! This is the sell stock handler. You said: \'%s\'.', session.message.text);
})
.onDefault((session) => {
    session.send('Sorry, I did not understand \'%s\'.', session.message.text);
});

bot.dialog('/', intents);    

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}

