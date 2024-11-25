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
    .setName("profile")
    .setDescription(`View logging Profile`)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user's profile to view")
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
        .setFooter({ text: `Farmer Dan | Profile System` });
      return interaction.reply({ ephemeral: true, embeds: [Embed] });
    }
    let eggsData = await execute(
      `SELECT * FROM inventory WHERE guild = ? AND owner = ? AND type = ? AND old = ?`,
      [interaction.guild.id, user.id, "eggs", false]
    );
    let milkData = await execute(
      `SELECT * FROM inventory WHERE guild = ? AND owner = ? AND type = ? AND old = ?`,
      [interaction.guild.id, user.id, "milk", false]
    );
    let suppliesData = await execute(
      `SELECT * FROM inventory WHERE guild = ? AND owner = ? AND type = ? AND old = ?`,
      [interaction.guild.id, user.id, "supplies", false]
    );
    let materialsData = await execute(
      `SELECT * FROM inventory WHERE guild = ? AND owner = ? AND type = ? AND old = ?`,
      [interaction.guild.id, user.id, "materials", false]
    );
    let milkBalance = milkData
      .map((x) => Number(x["amount"]))
      .reduce((a, b) => a + b, 0);
    let suppliesBalance = suppliesData
      .map((x) => Number(x["amount"]))
      .reduce((a, b) => a + b, 0);
    let materialsBalance = materialsData
      .map((x) => Number(x["amount"]))
      .reduce((a, b) => a + b, 0);
    let eggsBalance = eggsData
      .map((x) => Number(x["amount"]))
      .reduce((a, b) => a + b, 0);

    const Embed = new EmbedBuilder()
      .setTitle("👤 | User Logging Profile")
      .setThumbnail(user.displayAvatarURL())
      .setDescription(
        `> Dear ${interaction.member}, below you can find the requested profile:\n### Account Details\n> **User:** ${user} (${user.id})\n### Weekly Logs \n> - **Milk:** ${milkBalance}\n> - **Supplies:** ${suppliesBalance}\n> - **Materials:** ${materialsBalance}\n> - **Eggs:** ${eggsBalance}\n\n> You can wipe their whole profile using */reset* and or wait till the end of the week when the user automatically gets reset.`
      )
      .setTimestamp()
      .setAuthor({
        name: `${interaction.client.user.username}`,
        iconURL: `${interaction.client.user.displayAvatarURL()}`,
      })
      .setColor("#6488EA")
      .setFooter({ text: `Farmer Dan | Profile System` });
    return interaction.reply({ ephemeral: true, embeds: [Embed] });
  },
};
