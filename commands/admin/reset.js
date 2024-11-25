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
    .setName("reset")
    .setDescription(`Reset a user's profile`)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to reset")
        .setRequired(true)
    ),
  async execute(interaction) {
    let user = interaction.options.getMember("user");
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      const Embed = new EmbedBuilder()
        .setTitle(":x: | Invalid Permissions")
        .setThumbnail(interaction.guild.iconURL())
        .setDescription(
          `> Dear ${interaction.member}, you are missing the **Administrator** permissions required for this command. Please ask for permissions and try again.`
        )
        .setTimestamp()
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setColor("#6488EA")
        .setFooter({ text: `Farmer Dan | Reset System` });
      return interaction.reply({ ephemeral: true, embeds: [Embed] });
    }
    await execute(
      `DELETE FROM inventory WHERE owner = ? AND guild = ? AND old = ?`,
      [user.id, interaction.guild.id, false]
    );
    const Embed = new EmbedBuilder()
      .setTitle(":white_check_mark: | User Successfully Reset")
      .setThumbnail(interaction.guild.iconURL())
      .setDescription(
        `> Dear ${interaction.member}, you have successfully manually reset ${user}. The member has also been sent a notification to let them know of this reset.`
      )
      .setTimestamp()
      .setAuthor({
        name: `${interaction.client.user.username}`,
        iconURL: `${interaction.client.user.displayAvatarURL()}`,
      })
      .setColor("#6488EA")
      .setFooter({ text: `Farmer Dan | Reset System` });

    const toUser = new EmbedBuilder()
      .setTitle(":white_check_mark: | Profile got Reset")
      .setThumbnail(interaction.guild.iconURL())
      .setDescription(
        `> Dear ${user}, ${interaction.member} has reset your profile and wiped all of your weekly **Eggs, Materials, Supplies and Milk** logs.`
      )
      .setTimestamp()
      .setAuthor({
        name: `${interaction.client.user.username}`,
        iconURL: `${interaction.client.user.displayAvatarURL()}`,
      })
      .setColor("#6488EA")
      .setFooter({ text: `Farmer Dan | Reset System` });
    await user.send({ embeds: [toUser] });
    return interaction.reply({ ephemeral: true, embeds: [Embed] });
  },
};
