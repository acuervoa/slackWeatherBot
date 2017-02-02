'use strict';

const natural = require('natural');
const request = require('superagent');
const Bot = require('./Bot');

const weatherURL = `http://api.openweathermap.org/data/2.5/weather?&units=metric&appid=${process.env.WEATHER_API_KEY}&q=`;

const stemmer = natural.PorterStemmer;
stemmer.attach();

const bot = new Bot({
    token: process.env.SLACK_TOKEN,
    autoReconnect: true,
    autoMark: true
});


bot.respondTo('weather', (message, channel, user) => {
    let args = getArgs(message.text);

    let city = args.join(' ');

    getWeather(city, (error, fullName, description, temperature) => {
        if (error) {
            bot.send(error.message, channel);
            return;
        }

        bot.send(`The weather for ${fullName} is ${description} with a temperature of ${Math.round(temperature)} celsius.`, channel);
    });
}, true);



// bot.respondTo('', (message, channel, user) => {
//    let stemmedMessage = message.text.tokenizeAndStem();
//    bot.send(`Tokenized message: ${JSON.stringify(stemmedMessage)}`, channel);
//});



/*bot.respondTo('', (message, channel, user) => {
    let command = message.text.split(' ')[0];

    let distance = natural.LevenshteinDistance('weather', command);

    let tolerance = 2;

    if (distance <= tolerance) {
        bot.send(`Looks like you were trying to get the weather, ${user.name}`, channel);
    }
}, true);
*/
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


bot.respondTo({ mention: true }, (message, channel, user) => {
    let args = getArgs(message.text);
    let city = args.join(' ');

    getWeather(city, (error, fullName, description, temperature) => {
        if (error) {
            bot.send(error.message, channel);
            return;
        }

        bot.send(`The weather for ${fullName} is ${description} with a temperature of ${Math.round(temperature)} celsius.`, channel);

    });
}, true);

function getArgs(msg) {
    return msg.split(' ').slice(1);
}

function getWeather(location, callback) {

    request.get(weatherURL + location)
        .end((err, res) => {
            if (err) throw err;
            let data = JSON.parse(res.text);

            if (data.cod === '404') {
                return callback(new Error('Sorry, I can\'t find that location!'));
            }

            console.log(data);

            let weather = [];
            data.weather.forEach((feature) => {
                weather.push(feature.description);
            });

            let description = weather.join(' and ');

            callback(err, data.name, description, data.main.temp);
        });
}