const Discord = require('discord.js');
const WOKcommands = require('wokcommands');
require('dotenv').config();

const client = new Discord.Client();
const { db, checkGuild, checkUser, checkRoles, checkAllRoles } = require('./modules/db.js');

//--------------------------------------------------- VARIABLES -----------------------------------------------------------

const TOKEN = process.env.TOKEN;
const MONGODB_URI = process.env.MONGODB_URI; // for WOKCommands

const help = require('./modules/help.js');
const config = require('./config.js');
const { presence } = config;
const testGuildIDs = ['782687651492790314'];
var i = 0;

//--------------------------------------------------- FUNCTIONS -----------------------------------------------------------

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

//!-------------------------------------------------- DISCORD.JS EVENTS ----------------------------------------------------
client.once('ready', () => {
  new WOKcommands(client, {
    commandsDir: 'commands',
    featuresDir: 'features',
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

//TODO: commands => ./commands
// client.on('message', message => {
//   if (!message.content.startsWith(prefix)) return;
//   if (message.author.bot) return;

//   const args = message.content.slice(prefix.length).trim().split(/ +/);
//   const command = args.shift().toLowerCase();

//   checkUser(message.author);

//   if (message.guild === null) { //for PNs
//     if (command === 'help') {
//       message.author.send('Sorry, not implemented yet.');
//     } else if (command === 'ping') {
//       message.author.send(new Discord.MessageEmbed()
//         .setColor(embedColor)
//         .setDescription('Pong!')
//       );
//     } else if (command === 'invite') {
//       message.author.send(help.inviteLink);
//     } else if (command === 'autoRole') {
//       if (args.length < 1) {
//         message.author.send(help.autoRole);
//         return;
//       } else if (args.length === 1 && (args[0] === 'true' || args[0] === '1' || args[0] === 'an' || args[0] === 'on')) {
//         db.prepare('UPDATE userData SET autoRole=1 WHERE userID=?').run(message.author.id);
//         message.author.send(new Discord.MessageEmbed()
//           .setColor(embedColor)
//           .setTitle(`Set!`)
//           .setDescription(`autoRole is now **true**`)
//         );
//       } else if (args.length === 1 && (args[0] === 'false' || args[0] === '0' || args[0] === 'aus' || args[0] === 'off')) {
//         db.prepare('UPDATE userData SET autoRole=0 WHERE userID=?').run(message.author.id);
//         message.author.send(new Discord.MessageEmbed()
//           .setColor(embedColor)
//           .setTitle(`Set!`)
//           .setDescription(`autoRole is now **false**`)
//         );
//       } else if (args[0] === 'true' || args[0] === '1' || args[0] === 'an' || args[0] === 'on') {
//         i = 2;
//         let activity = args[1];
//         while (i < args.length) {
//           activity = activity + ' ' + args[i];
//           i++;
//         }

//         if (typeof db.prepare('SELECT * FROM users WHERE userID=? AND activity=?').get(message.author.id, activity) === 'undefined') {
//           message.author.send(new Discord.MessageEmbed()
//             .setColor('red')
//             .setTitle('Error')
//             .setDescription(`for this please use ${prefix}get as it does the same thing`)
//           )
//         } else {
//           db.prepare('UPDATE users SET autoRole=1 WHERE userID=? AND activity=?').run(message.author.id, activity);
//           message.author.send(new Discord.MessageEmbed()
//             .setColor(embedColor)
//             .setTitle('Set!')
//             .setDescription(`autoRole for ${activity} is now **true**.`)
//           )
//         }
//       } else if (args[0] === 'false' || args[0] === '0' || args[0] === 'aus' || args[0] === 'off') {
//         i = 2;
//         let activity = args[1];
//         while (i < args.length) {
//           activity = activity + ' ' + args[i];
//           i++;
//         }
//         console.log(activity);
//         if (typeof db.prepare('SELECT * FROM users WHERE userID=? AND activity=?').get(message.author.id, activity) === 'undefined') {
//           db.prepare('INSERT INTO users (userID, activity, autoRole) VALUES (?, ?, 0)').run(message.author.id, activity);
//           message.author.send(new Discord.MessageEmbed()
//             .setColor(embedColor)
//             .setTitle('Set!')
//             .setDescription(`autoRole for ${activity} is now **false**.`)
//           )
//         } else {
//           db.prepare('UPDATE users SET autoRole=0 WHERE userID=? AND activity=?').run(message.author.id, activity);
//           message.author.send(new Discord.MessageEmbed()
//             .setColor(embedColor)
//             .setTitle('Set!')
//             .setDescription(`autoRole for ${activity} is now **false**.`)
//           )
//         }
//       } else {
//         message.author.send(help.autoRole);
//         return;
//       }
//     } else {
//       message.author.send('It looks like you can't use that command in a private chat.');
//     }
//     return;
//   }

//   checkGuild(message.guild);

//?   if (command === 'ping') {
//?     message.channel.send(new Discord.MessageEmbed()
//?       .setColor(embedColor)
//?       .setDescription('Pong!')
//?     );
//?   } else if (command === 'help') {
//?     message.channel.send(help.default);
//?   } else if (command === 'invite') {
//?     message.channel.send(help.inviteLink);
//   } else if (command === 'autoRole') {
//     if (args.length < 1) {
//       message.channel.send(help.autoRole);
//       return;
//     } else if (args.length === 1 && (args[0] === 'true' || args[0] === '1' || args[0] === 'an' || args[0] === 'on')) {
//       db.prepare('UPDATE userData SET autoRole=1 WHERE userID=?').run(message.member.id);
//       message.channel.send(new Discord.MessageEmbed()
//         .setColor(embedColor)
//         .setTitle(`Set!`)
//         .setDescription(`autoRole is now **true**`)
//       );
//     } else if (args.length === 1 && (args[0] === 'false' || args[0] === '0' || args[0] === 'aus' || args[0] === 'off')) {
//       db.prepare('UPDATE userData SET autoRole=0 WHERE userID=?').run(message.member.id);
//       message.channel.send(new Discord.MessageEmbed()
//         .setColor(embedColor)
//         .setTitle(`Set!`)
//         .setDescription(`autoRole is now **false**`)
//       );
//     } else if (args[0] === 'true' || args[0] === '1' || args[0] === 'an' || args[0] === 'on') {
//       i = 2;
//       let activity = args[1];
//       while (i < args.length) {
//         activity = activity + ' ' + args[i];
//         i++;
//       }

//       if (typeof db.prepare('SELECT * FROM users WHERE userID=? AND activity=?').get(message.member.user.id, activity) === 'undefined') {
//         message.channel.send(new Discord.MessageEmbed()
//           .setColor('red')
//           .setTitle('Error')
//           .setDescription(`for this please use ${prefix}get as it does the same thing`)
//         )
//       } else {
//         db.prepare('UPDATE users SET autoRole=1 WHERE userID=? AND activity=?').run(message.member.id, activity);
//         message.channel.send(new Discord.MessageEmbed()
//           .setColor(embedColor)
//           .setTitle('Set!')
//           .setDescription(`autoRole for ${activity} is now **true**.`)
//         )
//       }
//     } else if (args[0] === 'false' || args[0] === '0' || args[0] === 'aus' || args[0] === 'off') {
//       i = 2;
//       let activity = args[1];
//       while (i < args.length) {
//         activity = activity + ' ' + args[i];
//         i++;
//       }
//       console.log(activity);
//       if (typeof db.prepare('SELECT * FROM users WHERE userID=? AND activity=?').get(message.member.user.id, activity) === 'undefined') {
//         db.prepare('INSERT INTO users (userID, activity, autoRole) VALUES (?, ?, 0)').run(message.member.user.id, activity);
//         message.channel.send(new Discord.MessageEmbed()
//           .setColor(embedColor)
//           .setTitle('Set!')
//           .setDescription(`autoRole for ${activity} is now **false**.`)
//         )
//       } else {
//         db.prepare('UPDATE users SET autoRole=0 WHERE userID=? AND activity=?').run(message.member.id, activity);
//         message.channel.send(new Discord.MessageEmbed()
//           .setColor(embedColor)
//           .setTitle('Set!')
//           .setDescription(`autoRole for ${activity} is now **false**.`)
//         )
//       }
//     } else {
//       message.channel.send(help.autoRole);
//       return;
//     }
//!   } else if (command === 'addRole' || command === 'add') {
//     if (!message.member.hasPermission('MANAGE_ROLES')) {
//       message.channel.send(':x: You need to have the permission 'manage roles' to access this command! :x:');
//       return;
//     }
//     if (args < 2) {
//       message.channel.send(new Discord.MessageEmbed()
//         .setColor(embedColor)
//         .setTitle(`Help with ${prefix}addRole / ${prefix}add`)
//         .addField('Usage:', '`' + `${prefix}addRole (/${prefix}add) <the role I give to users> <the game>` + '`')
//         .addField('<the game>', 'You have to type the exact name (it has to be exactly exact), as it is only checked this way.')
//         .setTimestamp()
//         .setFooter('© 2021 tippfehlr#3575', botOwnerLogoLink
//         ));
//     } else {
//       i = 2;
//       let roleID = args[0].replace(/[\\<>@#&!]/g, '');
//       let activityName = args[1];
//       let roleName = 'role not valid';

//       while (i < args.length) {
//         activityName = activityName + ' ' + args[i];
//         i++;
//       }

//       if (message.guild.roles.cache.get(roleID.toString())) {
//         roleName = message.guild.roles.cache.get(roleID);

//         if (typeof db.prepare('SELECT * FROM guilds WHERE guildID=? AND roleID=? AND activityNAME=?').get(message.guild.id, roleID, activityName) === 'undefined') {
//           db.prepare('INSERT INTO guilds (guildID, roleID, activityName) VALUES (?, ?, ?)').run(message.guild.id, roleID, activityName);

//           message.channel.send(new Discord.MessageEmbed()
//             .setColor(embedColor)
//             .setTitle('Set!')
//             .addField('Game:', activityName)
//             .addField('Role:', roleName)
//           );

//           console.log(`SQLITE | New game role added: on guild ${message.guild.name} (${message.guild.id}) role: ${message.guild.roles.cache.get(roleID).name} (${roleID}) activityName: ${activityName}`);
//         } else {
//           message.channel.send(`:x: Error: this gameRole is already added! :x:`);

//           console.log(`SQLITE | game role already added: on guild ${message.guild.name} (${message.guild.id}) role: ${roleName} (${roleID}) activityName: ${activityName}`);
//         }
//       } else {
//         message.channel.send(`:x: Error: the role you specified does not exist :x:\n`);
//         console.log(`SQLITE | role invalid: on guild ${message.guild.name} (${message.guild.id}) role: ${roleName} (${roleID}) activityName: ${activityName}`)
//       }
//     }
//     checkAllRoles(message.guild);
//!   } else if(command === 'update') {
//     checkAllRoles(message.guild);
//   }

// });

client.login(TOKEN);