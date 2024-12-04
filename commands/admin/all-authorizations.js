const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  RoleSelectMenuBuilder,
  AttachmentBuilder,
} = require("discord.js");
const fs = require("fs");
const n = require("../../config.json");
const { execute, makeid } = require("../../database/database");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("all-authorization")
    .setDescription(`View all authorizations`),
  async execute(interaction) {
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
        .setColor("#9D00FF")
        .setFooter({ text: `👾 | Role System` });
      return interaction.reply({ ephemeral: true, embeds: [Embed] });
    }

    let existing = await execute(
      `SELECT * FROM authorization WHERE guild = ?`,
      [interaction.guild.id]
    );

    let fileContent = "";
    existing.forEach((row) => {
      const { role_id, manageable, guild } = row;

      const manageableItems = manageable
        .split(",")
        .map((item) => `  - ${item}`)
        .join("\n");

      fileContent += `--------\nrole: ${role_id}\n${manageableItems}\n--------\n`;
    });


    fs.writeFileSync("authorization_roles.txt", fileContent, "utf8");
    console.log("File has been written as authorization_roles.txt");
    const attachment = new AttachmentBuilder(
      "./authorization_roles.txt"
    ).setName("authorization_roles.txt");
    const Initial = new EmbedBuilder()
      .setTitle("⚙️ | All Authorizations")
      .setThumbnail(interaction.guild.iconURL())
      .setDescription(
        `> Below you can find a txt file containing all of the authorizations that are currently set.\n> It follows format:\n\n> Role:\n> - All manageable roles.\n> - Use */controls* to view more information about possible controls you can use to view, add and or delete an authorization.`
      )
      .setTimestamp()
      .setAuthor({
        name: `${interaction.client.user.username}`,
        iconURL: `${interaction.client.user.displayAvatarURL()}`,
      })
      .setColor("#9D00FF")
      .setFooter({ text: `👾 | Role System` });

    await interaction.reply({
      ephemeral: true,
      embeds: [Initial],
    });
    await interaction.followUp({
      ephemeral: true,
      files: [attachment],
    });
  },
};
