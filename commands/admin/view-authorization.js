const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  RoleSelectMenuBuilder,
} = require("discord.js");
const fs = require("fs");
const n = require("../../config.json");
const { execute, makeid } = require("../../database/database");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("view-authorization")
    .setDescription(`View role authorization`)
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The role type to view")

        .setRequired(true)
    ),
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
    let role = interaction.options.getRole("role");
    let existing = await execute(
      `SELECT * FROM authorization WHERE role_id = ? AND guild = ?`,
      [role.id, interaction.guild.id]
    );
    if (existing.length == 0) {
      const Initial = new EmbedBuilder()
        .setTitle(":x: | Role Not Yet Authorized")
        .setThumbnail(interaction.guild.iconURL())
        .setDescription(
          `> This role ${role} is not yet authorized, so it cannot be viewed.\n> - Use \`\`/set-authorization\`\` to add the role authorization.`
        )
        .setTimestamp()
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setColor("#9D00FF")
        .setFooter({ text: `👾 | Role System` });
      return interaction.reply({ ephemeral: true, embeds: [Initial] });
    }
    const Initial = new EmbedBuilder()
      .setTitle("📍 | Select Roles")
      .setThumbnail(interaction.guild.iconURL())
      .setDescription(
        `> Below you can find the role authorization for ${role}:\n\n> - ${existing[0].manageable
          .split(",")
          .map((x) => `<@&${x}>`)
          .join(
            "\n> - "
          )}\n\n> ${role} **can do the following to the above mentioned roles:**\n> - Delete the role from members.\n> - Add the role to members. `
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
  },
};
