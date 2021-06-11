const Discord = require("discord.js");
const config = require("../config.js");
const { db, checkGuild, checkUser, checkRoles, checkAllRoles } = require("../modules/db.js");

module.exports = {
  slash: true,
  testOnly: true,
  description: "Add a GameRole to your guild!",
  category: 'Fun & Games',
  description: 'Replies with "Pong!"',
  callback: ({ }) => {
    if (!message.member.hasPermission("MANAGE_ROLES")) {
      return ":x: You need to have the permission 'manage roles' to access this command! :x:";
    }
    if (args < 2) {
      message.channel.send(
        new Discord.MessageEmbed()
          .setColor(embedColor)
          .setTitle(`Help with ${prefix}addRole / ${prefix}add`)
          .addField(
            "Usage:",
            "`" +
            `${prefix}addRole (/${prefix}add) <the role I give to users> <the game>` +
            "`"
          )
          .addField(
            "<the game>",
            "You have to type the exact name (it has to be exactly exact), as it is only checked this way."
          )
          .setTimestamp()
          .setFooter("© 2021 tippfehlr#3575", botOwnerLogoLink)
      );
    } else {
      i = 2;
      let roleID = args[0].replace(/[\\<>@#&!]/g, "");
      let activityName = args[1];
      let roleName = "role not valid";

      while (i < args.length) {
        activityName = activityName + " " + args[i];
        i++;
      }

      if (message.guild.roles.cache.get(roleID.toString())) {
        roleName = message.guild.roles.cache.get(roleID);

        if (
          typeof db
            .prepare(
              "SELECT * FROM guilds WHERE guildID=? AND roleID=? AND activityNAME=?"
            )
            .get(message.guild.id, roleID, activityName) === "undefined"
        ) {
          db.prepare(
            "INSERT INTO guilds (guildID, roleID, activityName) VALUES (?, ?, ?)"
          ).run(message.guild.id, roleID, activityName);

          message.channel.send(
            new Discord.MessageEmbed()
              .setColor(embedColor)
              .setTitle("Set!")
              .addField("Game:", activityName)
              .addField("Role:", roleName)
          );

          console.log(
            `SQLITE | New game role added: on guild ${message.guild.name} (${message.guild.id
            }) role: ${message.guild.roles.cache.get(roleID).name
            } (${roleID}) activityName: ${activityName}`
          );
        } else {
          message.channel.send(
            `:x: Error: this gameRole is already added! :x:`
          );

          console.log(
            `SQLITE | game role already added: on guild ${message.guild.name} (${message.guild.id}) role: ${roleName} (${roleID}) activityName: ${activityName}`
          );
        }
      } else {
        message.channel.send(
          `:x: Error: the role you specified does not exist :x:\n`
        );
        console.log(
          `SQLITE | role invalid: on guild ${message.guild.name} (${message.guild.id}) role: ${roleName} (${roleID}) activityName: ${activityName}`
        );
      }
    }
    checkAllRoles(message.guild);
  },
};
