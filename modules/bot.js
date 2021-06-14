const Discord = require('discord.js');
const WOKcommands = require('wokcommands');
require('dotenv').config();

const client = new Discord.Client();
const { db, checkGuild, checkUser, checkRoles, checkAllRoles } = require('../old/db-14.06.2021-sqlite.js');

const { TOKEN } = require('../index.js');
// const MONGODB_URI = process.env.MONGODB_URI;
const config = require('../config.js');
const { presence } = config;
const testGuildIDs = ['782687651492790314'];

var i = 0;

function changeActivity() {
    if (presence.nextActivityNumber >= presence.activity.length) {
        presence.nextActivityNumber = 0;
    }
    client.user.setPresence({
        status: 'online',
        activity: {
            name: presence.activity[presence.nextActivityNumber],
            type: presence.activityType[presence.nextActivityNumber]
        }
    });
    presence.nextActivityNumber++;
}


client.once('ready', () => {
    new WOKcommands(client, {
        commandsDir: 'commands',
        // featuresDir: '../features',
        testServers: testGuildIDs,
        showWarns: false
    }).setBotOwner(config.botOwner)
        .setDisplayName('Game Roles V2');
    // .setMongoPath(MONGODB_URI);

    if (presence.activity.length > 0) {
        changeActivity();
        setInterval(changeActivity, 15 * 1000);
    }

    console.log('DISCORD.JS > Ready!');
});

client.on('presenceUpdate', function (oldMember, newMember) {
    if (newMember.member.user.bot) return;
    checkGuild(newMember.guild);
    checkUser(newMember.user);

    i = 0;
    while (i < newMember.activities.length) {
        if (newMember.activities[i].name !== 'Custom Status') {
            if (typeof db.prepare('SELECT * FROM users WHERE userID=? and activity=?').get(newMember.user.id.toString(), newMember.activities[i].name) === 'undefined') {
                db.prepare('INSERT INTO users (userID, activity, autoRole) VALUES (?, ?, 1)').run(newMember.user.id.toString(), newMember.activities[i].name);
                console.log(`SQLITE > New activity: ${newMember.user.username} (${newMember.user.id}) plays ${newMember.activities[i].name}.`
                );
            }
        }
        i++;
    }
    checkRoles(newMember.member);
});

client.on('guildCreate', function (guild) {
    console.log(`DISCORD.JS > the client joined ${guild.name}`);
    checkGuild(guild);
});

client.on('guildDelete', function (guild) {
    console.log(`the client left ${guild.name}`);
});

client.on('disconnect', function (event) {
    console.log(
        `DISCORD.JS > The WebSocket has closed and will no longer attempt to reconnect`
    );
});

client.on('error', function (error) {
    console.error(
        `DISCORD.JS > The client's WebSocket encountered a connection error: ${error}`
    );
});

client.login(TOKEN);

module.exports = client;