const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const fs = require("fs");
const n = require("../../config.json");
const { execute, makeid } = require("../../database/database");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("log")
    .setDescription(`Log new items`)
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("The type to log")
        .addChoices(
          { name: `Milk`, value: `milk` },
          { name: `Eggs`, value: `eggs` },
          { name: `Supplies`, value: `supplies` },
          { name: `Materials`, value: `materials` }
        )
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of this item to log")
        .setRequired(true)
    ),
  async execute(interaction) {
    let type = interaction.options.getString("type");
    let amount = interaction.options.getNumber("amount");

    if (amount < 0) {
      const Embed = new EmbedBuilder()
        .setTitle(":x: | Invalid Amount")
        .setThumbnail(interaction.guild.iconURL())
        .setDescription(
          `> Your entered logging amount of **(${AutoModerationRuleTriggerType})** is invalid. The log amount must be atleast bigger than 0.`
        )
        .setTimestamp()
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setColor("#6488EA")
        .setFooter({ text: `Farmer Dan | Logging System` });
      return interaction.reply({ ephemeral: true, embeds: [Embed] });
    }

    let data = await execute(
      `SELECT * FROM inventory WHERE guild = ? AND owner = ? AND type = ? AND old = ?`,
      [interaction.guild.id, interaction.member.id, type, false]
    );
    await execute(
      `INSERT INTO inventory (type, owner, guild, amount, old) VALUES (?, ?, ?, ?, ?)`,
      [type, interaction.member.id, interaction.guild.id, amount, false]
    );
    let oldBalance = data
      .map((x) => Number(x["amount"]))
      .reduce((a, b) => a + b, 0);
    const Embed = new EmbedBuilder()
      .setTitle(":white_check_mark: | Successfully Logged")
      .setThumbnail(interaction.guild.iconURL())
      .setDescription(
        `> Dear ${
          interaction.member
        }, you have successfully logged an item. Please check the details below:\n\n> **Item:** ${
          type.charAt(0).toUpperCase() + type.slice(1)
        }\n> **Amount:** ${amount}\n> **New total this week:** ${oldBalance} -> ${
          oldBalance + amount
        }`
      )
      .setTimestamp()
      .setAuthor({
        name: `${interaction.client.user.username}`,
        iconURL: `${interaction.client.user.displayAvatarURL()}`,
      })
      .setColor("#6488EA")
      .setFooter({ text: `Farmer Dan | Logging System` });
    return interaction.reply({ ephemeral: true, embeds: [Embed] });
  },
};
