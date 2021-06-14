const mongoose = require('mongoose');

const config = require('../config.js');
// let { MONGODB_URI } = require('../index.js');

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  console.log('MONGODB > Connected to DB!');
  //TODO:: now connect the discord.js client
});

const UserConfig = require('./models/userConfig.js');
const GuildConfig = require('./models/guildConfig.js');
const GuildData = require('./models/guildData.js');
const UserData = require('./models/userData.js');


//TODO: add addUserData and addUserDataSync
//TODO: add get functions
//TODO: integrate get in add and return based if the document exists
// @param userID: Discord ID of User
// @param autoRole: default = true
async function addToUserConfig(userID, autoRole = true) {
  new UserConfig({
    _id: userID,
    autoRole: autoRole
  }).save();
}

// @param userID: Discord ID of User
// @param autoRole: default = true
async function addUserConfigSync(userID, autoRole = true) {
  await new UserConfig({
    _id: userID,
    autoRole: autoRole
  }).save();
}

// @param guildID: Discord ID of Guild
async function addGuildConfig(guildID) {
  new GuildConfig({
    _id: guildID
  }).save();
}

// @param guildID: Discord ID of Guild
async function addGuildConfigSync(guildID) {
  await new GuildConfig({
    _id: guildID
  }).save();
}

// @param guildID: Discord ID of Guild
// @param roleID: Discord ID of Role to give to users
// @param activityName: Name of the activity of users to which give the role
// @param only_included_allowed: If activityName of users has to fully match activityName
async function addGuildData(guildID, roleID, activityName, only_included_allowed = false) {
  new GuildData({
    guildID: guildID,
    roleID: roleID,
    activityName: activityName,
    only_included_allowed: only_included_allowed
  }).save();
}

// @param guildID: Discord ID of Guild
// @param roleID: Discord ID of Role to give to users
// @param activityName: Name of the activity of users to which give the role
// @param only_included_allowed: If activityName of users has to fully match activityName
async function addGuildDataSync(guildID, roleID, activityName, only_included_allowed = false) {
  await new GuildData({
    guildID: guildID,
    roleID: roleID,
    activityName: activityName,
    only_included_allowed: only_included_allowed
  }).save();
}

module.exports = {
  addUserConfig,
  addUserConfigSync,
  addGuildConfig,
  addGuildConfigSync
}


// function checkGuild(guild) { // checks for and adds the guild to the database
//     if (typeof db.prepare("SELECT * FROM guildData WHERE guildID=?").get(guild.id.toString()) == "undefined") {
//         db.prepare("INSERT INTO guildData (guildID) VALUES (?)").run(guild.id.toString());
//         console.log(`SQLITE > Added guild ${guild.name} (${guild.id}) to the database.`);
//     }
// }

// function checkUser(user) { // checks for and adds the user to the database
//     if (typeof db.prepare("SELECT * FROM userData WHERE userID=?").get(user.id.toString()) == "undefined") {
//         db.prepare("INSERT INTO userData (userID, autoRole) VALUES (?, 1)").run(user.id.toString());
//         console.log(`SQLITE > Added user ${user.username} (${user.id}) to the database.`);
//     }
// }

// function checkRoles(member) {
//     if (member.user.bot) return;
//     checkUser(member.user);
//     checkGuild(member.guild);
//     const userAutoRole = Boolean(db.prepare("SELECT autoRole FROM userData WHERE userID=?").get(member.id.toString()).autoRole);
//     if (!userAutoRole) return;

//     const activityList = db.prepare("SELECT activityName, roleID FROM guilds WHERE guildID=?").all(member.guild.id.toString());

//     i = 0;
//     while (i < activityList.length) {
//         let userPlaysGame = db.prepare("SELECT autoRole FROM users WHERE activity=? AND userID=?").get(activityList[i].activityName, member.id.toString());
//         if (typeof userPlaysGame !== "undefined") {

//             if (!member.roles.cache.has(activityList[i].roleID.toString()) && Boolean(userPlaysGame.autoRole)) {
//                 const role = member.guild.roles.cache.find(role => role.id === activityList[i].roleID.toString());
//                 member.roles.add(role);
//                 console.log(`DISCORD.JS > added Role ${role.name} (${activityList[i].roleID.toString()}) to user: ${member.user.username} (${member.user.id}) on guild: ${member.guild.name} (${member.guild.id})`)
//             }
//         } else if (!userPlaysGame && member.roles.cache.has(activityList[i].roleID.toString())) {
//             const role = member.guild.roles.cache.find(role => role.id === activityList[i].roleID.toString());
//             member.roles.remove(role);
//             console.log(`DISCORD.JS > deleted Role ${role.name} (${activityList[i].roleID.toString()}) from user: ${member.user.username} (${member.user.id}) on guild: ${member.guild.name} (${member.guild.id})`)
//         }
//         i++;
//     }

// }

// function checkAllRoles(guild) {
//     checkGuild(guild);
//     const activityList = db.prepare("SELECT activityName, roleID FROM guilds WHERE guildID=?").all(guild.id.toString());

//     guild.members.cache.forEach((member) => {
//         if (member.user.bot) return;
//         checkUser(member.user);
//         const userAutoRole = Boolean(db.prepare("SELECT autoRole FROM userData WHERE userID=?").get(member.id.toString()).autoRole);
//         if (userAutoRole) {
//             i = 0;
//             while (i < activityList.length) {
//                 let userPlaysGame = db.prepare("SELECT autoRole FROM users WHERE activity=? AND userID=?").get(activityList[i].activityName, member.id.toString());

//                 if (typeof userPlaysGame !== "undefined") {
//                     if (!member.roles.cache.has(activityList[i].roleID.toString()) && userPlaysGame.autoRole) {
//                         const role = member.guild.roles.cache.find(role => role.id === activityList[i].roleID.toString());
//                         member.roles.add(role);
//                         console.log(`DISCORD.JS > added Role ${role.name} (${activityList[i].roleID.toString()}) to user: ${member.user.username} (${member.user.id}) on guild: ${member.guild.name} (${member.guild.id})`)
//                     }
//                 } else if (!userPlaysGame && member.roles.cache.has(activityList[i].roleID.toString())) {
//                     const role = member.guild.roles.cache.find(role => role.id === activityList[i].roleID.toString());
//                     member.roles.remove(role);
//                     console.log(`DISCORD.JS > deleted Role ${role.name} (${activityList[i].roleID.toString()}) from user: ${member.user.username} (${member.user.id}) on guild: ${member.guild.name} (${member.guild.id})`)
//                 }
//                 i++;
//             }
//         }
//     });
// }


// module.exports = { db, checkGuild, checkUser, checkRoles, checkAllRoles };