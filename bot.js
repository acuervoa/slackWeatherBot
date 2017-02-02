'use strict';

const RtmClient = require('@slack/client').RtmClient;
const MemoryDataStore = require('@slack/client').MemoryDataStore;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

class Bot {
    constructor(opts) {
        let slackToken = opts.token;
        let autoReconnect = opts.autoReconnect || true;
        let autoMark = opts.autoMark || true;

        this.slack = new RtmClient(slackToken, {
            logLevel: 'error',
            dataStore: new MemoryDataStore(),
            autoReconnect: autoReconnect,
            autoMark: autoMark
        });

        this.slack.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
            let user = this.slack.dataStore.getUserById(this.slack.activeUserId)
            let team = this.slack.dataStore.getTeamById(this.slack.activeTeamId);

            this.name = user.name;
            this.id = user.id
            console.log(`Connected to ${team.name} as ${user.name}`);
        });

        this.slack.start();

        this.keywords = new Map();

        this.slack.on(RTM_EVENTS.MESSAGE, (message) => {
            if (!message.text) {
                return;
            }

            let channel = this.slack.dataStore.getChannelGroupOrDMById(message.channel);
            let user = this.slack.dataStore.getUserById(message.user);

            for (let regex of this.keywords.keys()) {
                if (regex.test(message.text)) {
                    let callback = this.keywords.get(regex);
                    callback(message, channel, user);
                }
            }
        });
    }

    respondTo(opts, callback, start) {
        if (!this.id) {
            this.slack.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
                createRegex(this.id, this.keywords);
            });
        } else {
            createRegex(this.id, this.keywords);
        }

        function createRegex(id, keywords) {
            if (opts === Object(opts)) {
                opts = {
                    mention: opts.mention || false,
                    keywords: opts.keywords || '',
                    start: start || false
                };
            } else {
                opts = {
                    mention: false,
                    keywords: opts,
                    start: start || false
                };
            }

            if (opts.mention) {
                opts.keywords = `<@${id}>:* ${opts.keywords}`;
            } else {
                opts.keywords = start ? '^' + opts.keywords : opts.keywords;
            }

            let regex = new RegExp(opts.keywords, 'i');
            keywords.set(regex, callback);
        }



    }

    send(message, channel, cb) {
        this.slack.sendMessage(message, channel.id, () => {
            if (cb) {
                cb();
            }
        });
    }

    getMembersByChannel(channel) {
        if (!channel.members) {
            return false;
        }

        let members = channel.members.filter((member) => {
            let m = this.slack.dataStore.getUserById(member);
            return (m.presence === 'active' && !m.is_bot);
        });

        members = members.map((member) => {
            return this.slack.dataStore.getUserById(member).name;
        });

        return members;
    }
}

module.exports = Bot;