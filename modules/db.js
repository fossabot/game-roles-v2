const sqlite = require('better-sqlite3');
const config = require('../config.js');
const fs = require('fs');

if (!fs.existsSync('./db/')) {
    fs.mkdirSync('./db/');
}

const db = new sqlite('./db/GameRolesV2.db');
db.prepare('CREATE TABLE IF NOT EXISTS guilds (guildID TEXT, roleID TEXT, activityName TEXT)').run();
db.prepare('CREATE TABLE IF NOT EXISTS users (userID TEXT, activity TEXT, autoRole BOOL)').run();
db.prepare('CREATE TABLE IF NOT EXISTS guildData (guildID TEXT)').run();
db.prepare('CREATE TABLE IF NOT EXISTS userData (userID TEXT, autoRole BOOL)').run();
console.log('SQLITE > Database loaded!');


function checkGuild(guild) { // checks for and adds the guild to the database
    if (typeof db.prepare("SELECT * FROM guildData WHERE guildID=?").get(guild.id.toString()) == "undefined") {
        db.prepare("INSERT INTO guildData (guildID) VALUES (?)").run(guild.id.toString());
        console.log(`SQLITE > Added guild ${guild.name} (${guild.id}) to the database.`);
    }
}

function checkUser(user) { // checks for and adds the user to the database
    if (typeof db.prepare("SELECT * FROM userData WHERE userID=?").get(user.id.toString()) == "undefined") {
        db.prepare("INSERT INTO userData (userID, autoRole) VALUES (?, 1)").run(user.id.toString());
        console.log(`SQLITE > Added user ${user.username} (${user.id}) to the database.`);
    }
}

function checkRoles(member) {
    if (member.user.bot) return;
    checkUser(member.user);
    checkGuild(member.guild);
    const userAutoRole = Boolean(db.prepare("SELECT autoRole FROM userData WHERE userID=?").get(member.id.toString()).autoRole);
    if (!userAutoRole) return;

    const activityList = db.prepare("SELECT activityName, roleID FROM guilds WHERE guildID=?").all(member.guild.id.toString());

    i = 0;
    while (i < activityList.length) {
        let userPlaysGame = db.prepare("SELECT autoRole FROM users WHERE activity=? AND userID=?").get(activityList[i].activityName, member.id.toString());
        if (typeof userPlaysGame !== "undefined") {

            if (!member.roles.cache.has(activityList[i].roleID.toString()) && Boolean(userPlaysGame.autoRole)) {
                const role = member.guild.roles.cache.find(role => role.id === activityList[i].roleID.toString());
                member.roles.add(role);
                console.log(`DISCORD.JS > added Role ${role.name} (${activityList[i].roleID.toString()}) to user: ${member.user.username} (${member.user.id}) on guild: ${member.guild.name} (${member.guild.id})`)
            }
        } else if (!userPlaysGame && member.roles.cache.has(activityList[i].roleID.toString())) {
            const role = member.guild.roles.cache.find(role => role.id === activityList[i].roleID.toString());
            member.roles.remove(role);
            console.log(`DISCORD.JS > deleted Role ${role.name} (${activityList[i].roleID.toString()}) from user: ${member.user.username} (${member.user.id}) on guild: ${member.guild.name} (${member.guild.id})`)
        }
        i++;
    }

}

function checkAllRoles(guild) {
    checkGuild(guild);
    const activityList = db.prepare("SELECT activityName, roleID FROM guilds WHERE guildID=?").all(guild.id.toString());

    guild.members.cache.forEach((member) => {
        if (member.user.bot) return;
        checkUser(member.user);
        const userAutoRole = Boolean(db.prepare("SELECT autoRole FROM userData WHERE userID=?").get(member.id.toString()).autoRole);
        if (userAutoRole) {
            i = 0;
            while (i < activityList.length) {
                let userPlaysGame = db.prepare("SELECT autoRole FROM users WHERE activity=? AND userID=?").get(activityList[i].activityName, member.id.toString());

                if (typeof userPlaysGame !== "undefined") {
                    if (!member.roles.cache.has(activityList[i].roleID.toString()) && userPlaysGame.autoRole) {
                        const role = member.guild.roles.cache.find(role => role.id === activityList[i].roleID.toString());
                        member.roles.add(role);
                        console.log(`DISCORD.JS > added Role ${role.name} (${activityList[i].roleID.toString()}) to user: ${member.user.username} (${member.user.id}) on guild: ${member.guild.name} (${member.guild.id})`)
                    }
                } else if (!userPlaysGame && member.roles.cache.has(activityList[i].roleID.toString())) {
                    const role = member.guild.roles.cache.find(role => role.id === activityList[i].roleID.toString());
                    member.roles.remove(role);
                    console.log(`DISCORD.JS > deleted Role ${role.name} (${activityList[i].roleID.toString()}) from user: ${member.user.username} (${member.user.id}) on guild: ${member.guild.name} (${member.guild.id})`)
                }
                i++;
            }
        }
    });
}


module.exports = { db, checkGuild, checkUser, checkRoles, checkAllRoles };