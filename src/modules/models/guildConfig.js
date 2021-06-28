// const mongoose = require('mongoose');
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const guildConfigSchema = new Schema({
  _id: {
    type: String,
    required: true
  }
  //more guild settings here
}, { timestamps: true });

const GuildConfig = mongoose.model('GuildConfig', guildConfigSchema);
export default GuildConfig;
// module.exports = GuildConfig;