const Discord = require('discord.js');
const config = require('../config.js');

module.exports = {
  slash: true,
  testOnly: true,
  description: "Test the connection",
  callback: ({ }) => {
    return new Discord.MessageEmbed()
      .setColor(config.embedColor)
      .setDescription('Pong!');
  },
};
