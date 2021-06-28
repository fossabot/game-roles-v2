// const mongoose = require('mongoose');
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const guildDataSchema = new Schema({
  guildID: {
    type: String,
    required: true
  },
  roleID: {
    type: String,
    required: true
  },
  activityName: {
    type: String,
    required: true
  },
  only_included_allowed: {
    type: Boolean,
    required: true
  }
}, { timestamps: true });

const GuildData = mongoose.model('GuildData', guildDataSchema);
export default GuildData;
// module.exports = GuildData;