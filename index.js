'use strict';

const natural = require('natural');

const Bot = require('./Bot');

const stemmer = natural.PorterStemmer;
stemmer.attach();

const bot = new Bot({
    token: process.env.SLACK_TOKEN,
    autoReconnect: true,
    autoMark: true
});


// bot.respondTo('', (message, channel, user) => {
//    let stemmedMessage = message.text.tokenizeAndStem();
//    bot.send(`Tokenized message: ${JSON.stringify(stemmedMessage)}`, channel);
//});

bot.respondTo('', (message, channel, user) => {
    let command = message.text.split(' ')[0];

    let distance = natural.LevenshteinDistance('weather', command);

    let tolerance = 2;

    if (distance <= tolerance) {
        bot.send(`Looks like you were trying to get the weather, ${user.name}`, channel);
    }
}, true);

bot.respondTo('inflector', (message, channel, user) => {
    let inflector = new natural.NounInflector();

    console.log(inflector.pluralize('virus'));
    console.log(inflector.singularize('octopi'));

    let inflector2 = natural.CountInflector;

    console.log(inflector2.nth(25));
    console.log(inflector2.nth(42));
    console.log(inflector2.nth(111));

});

bot.respondTo('what day is it', (message, channel) => {
    let inflector = natural.CountInflector;
    let date = new Date();

    let locale = 'en-us';
    let month = date.toLocaleString(locale, { month: 'long' });

    bot.send(`It is the ${inflector.nth(date.getDate())} of ${month}.`, channel);
}, true);