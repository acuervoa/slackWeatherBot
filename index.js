'use strict';

const natural = require('natural');

const Bot = require('./Bot');

const tokenizer = new natural.TreebankWordTokenizer();

const bot = new Bot({
    token: process.env.SLACK_TOKEN,
    autoReconnect: true,
    autoMark: true
});

bot.respondTo('', (message, channel, user) => {
    let tokenizedMessage = tokenizer.tokenize(message.text);

    bot.send(`Tokenized message: ${JSON.stringify(tokenizedMessage)}`, channel);
});