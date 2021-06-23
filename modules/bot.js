const Discord = require('discord.js');
const WOKcommands = require('wokcommands');
require('dotenv').config();

const client = new Discord.Client();
const db = require('./db.js');

const { TOKEN } = require('../index.js');
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
    .setDisplayName('Game Roles V2')
    .setMongoPath(MONGODB_URI);

  if (presence.activity.length > 0) {
    changeActivity();
    setInterval(changeActivity, 15 * 1000);
  }

  console.log('DISCORD.JS > Ready!');
});

client.on('presenceUpdate', async function (oldMember, newMember) {
  if (newMember.member.user.bot) return;
  await db.checkGuild(newMember.guild);
  await db.checkUser(newMember.user);

  for (const i in newMember.activities) {
    if (newMember.activities[i].name !== 'Custom Status') {
      db.UserData.findOne({ userID: newMember.user.id.toString(), activityName: newMember.activities[i].name }, (err, docs) => {
        if (err) console.error(err);
        if (!docs) {
          new db.UserData({
            userID: newMember.user.id.toString(),
            activityName: newMember.activities[i].name,
            autoRole: true,
            ignored: false
          }).save();
          console.log(`MONGODB > New activity: ${newMember.user.username} (${newMember.user.id}) plays ${newMember.activities[i].name}.`);
        }
      }).lean();
    }
  }
  db.checkRoles(newMember.member);
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

function connect() {
  client.login(TOKEN);
}

module.exports = { connect, client };