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
    .setName("add-role")
    .setDescription(`Add a role to a member`)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to add a role to")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The role to add to the user")
        .setRequired(true)
    ),
  async execute(interaction) {
    let member = interaction.options.getMember("user");
    let role = interaction.options.getRole("role");
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
    for (let i = 0; i < existing.length; i++) {
      if (member.roles.cache.some((r) => r.id === existing[i].role_id)) {
        let split = existing[i].manageable.split(",");
        console.log(split);
        if (split.includes(role.id)) {
          await member.roles.add(role.id);
          const Embed = new EmbedBuilder()
            .setTitle(":white_check_mark: | Successfully Added")
            .setThumbnail(interaction.guild.iconURL())
            .setDescription(
              `> Dear ${interaction.member}, you have successfully added ${role} to ${member}. The role that allowed you to perform this action was <@&${existing[i].role_id}>.`
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
      }
    }
    const Embed = new EmbedBuilder()
      .setTitle(":x: | Invalid Authorization")
      .setThumbnail(interaction.guild.iconURL())
      .setDescription(
        `> Dear ${interaction.member}, you are missing any of the authorized roles that are allowed to manage ${role}. This action could therefore not be completed.`
      )
      .setTimestamp()
      .setAuthor({
        name: `${interaction.client.user.username}`,
        iconURL: `${interaction.client.user.displayAvatarURL()}`,
      })
      .setColor("#9D00FF")
      .setFooter({ text: `👾 | Role System` });
    return interaction.reply({ ephemeral: true, embeds: [Embed] });
  },
};
