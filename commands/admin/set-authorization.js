const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  RoleSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const fs = require("fs");
const n = require("../../config.json");
const { execute, makeid } = require("../../database/database");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-authorization")
    .setDescription(`Set role authorization`)
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The role type to authorize")

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
    if (existing.length > 0) {
      const Initial = new EmbedBuilder()
        .setTitle(":x: | Role Already Authorized")
        .setThumbnail(interaction.guild.iconURL())
        .setDescription(
          `> This role ${role} is already authorized, so it cannot be authorized again.\n> - Use \`\`/delete-authorization\`\` to delete the role authorization.\n> - Use \`\`/view-authorization\`\ to view the role settings.`
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
        `> Please select all the roles that ${role} is able to **Manage** (**Delete role from users** and **Add role from users**).\n> Below you can see all roles that the user with ${role} is allowed to manage.\n### Manageable Roles\n> **No Roles Selected Yet**.`
      )
      .setTimestamp()
      .setAuthor({
        name: `${interaction.client.user.username}`,
        iconURL: `${interaction.client.user.displayAvatarURL()}`,
      })
      .setColor("#9D00FF")
      .setFooter({ text: `👾 | Role System` });

  
    const selectMenu = new RoleSelectMenuBuilder()
      .setCustomId("role_select")
      .setPlaceholder("Select roles to manage");

  
    const saveButton = new ButtonBuilder()
      .setCustomId("save_settings")
      .setLabel("Save Settings")
      .setStyle(ButtonStyle.Primary);

   
    const row1 = new ActionRowBuilder().addComponents(selectMenu);
    const row2 = new ActionRowBuilder().addComponents(saveButton);

  
    await interaction.reply({
      ephemeral: true,
      embeds: [Initial],
      components: [row1, row2],
    });

    const collector = interaction.channel.createMessageComponentCollector({});


    let selectedRoles = [];

    collector.on("collect", async (interaction) => {
      console.log("test");
      if (interaction.customId === "role_select") {
        console.log("test");
      
        selected = interaction.values[0];

        if (selectedRoles.includes(selected)) {
          let indexOf = selectedRoles.indexOf(selected);
          selectedRoles.splice(indexOf, 1);
        } else {
          selectedRoles.push(selected);
        }
        existing = await execute(
          `SELECT * FROM authorization WHERE role_id = ? AND guild = ?`,
          [role.id, interaction.guild.id]
        );
        console.log(selectedRoles);
        if (existing.length > 0) {
          await execute(
            `UPDATE authorization SET manageable = ? WHERE guild = ? AND role_id = ?`,
            [selectedRoles.join(","), interaction.guild.id, existing[0].role_id]
          );
        } else {
          await execute(
            `INSERT INTO authorization (role_id, manageable, guild) VALUES (?, ?, ?)`,
            [role.id, selectedRoles.join(","), interaction.guild.id]
          );
        }
       
        const updatedEmbed = new EmbedBuilder()
          .setTitle("📍 | Select Roles")
          .setThumbnail(interaction.guild.iconURL())
          .setDescription(
            `> Please select all the roles that ${role} is able to **Manage** (**Delete role from users** and **Add role from users**).\n> Below you can see all roles that the user with ${role} is allowed to manage.\n### Manageable Roles\n> ${
              selectedRoles.length > 0
                ? selectedRoles.map((x) => `<@&${x}>`).join(", ")
                : "**No Roles Selected Yet**"
            }.`
          )
          .setTimestamp()
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setColor("#9D00FF")
          .setFooter({ text: `👾 | Role System` });

       
        await interaction.update({ embeds: [updatedEmbed] });
      }

 
      if (interaction.customId === "save_settings") {
        const updatedEmbed = new EmbedBuilder()
          .setTitle(":white_check_mark: | Successfully Saved")
          .setThumbnail(interaction.guild.iconURL())
          .setDescription(
            `> The role settings have successfully been saved.\n> Please view the new settings by using \`\`/view-authorization\`\`.`
          )
          .setTimestamp()
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setColor("#9D00FF")
          .setFooter({ text: `👾 | Role System` });
        await interaction.update({
          embeds: [updatedEmbed],
          components: [],
        });

       
        collector.stop();
      }
    });
  },
};
