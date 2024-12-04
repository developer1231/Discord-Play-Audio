const fs = require("fs");
const config = require("../config.json");
const { Initialization, execute } = require("../database/database");
const {
  Events,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    await Initialization();
  },
};
