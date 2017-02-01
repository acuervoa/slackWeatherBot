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


bot.respondTo('', (message, channel, user) => {

    let stemmedMessage = message.text.tokenizeAndStem();
    bot.send(`Tokenized message: ${JSON.stringify(stemmedMessage)}`, channel);
});