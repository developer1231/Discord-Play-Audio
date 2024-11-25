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
const cron = require("node-cron");
module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    await Initialization();
    // cron.schedule("*/30 * * * * *", async () => {
    cron.schedule("0 0 * * 6", async () => {
      console.log("Running task: Saturday at midnight.");

      try {
        const guild = client.guilds.cache.get(config.guild_id);
        const date = new Date().toISOString().split("T")[0];
        const fileName = `logging-${date}.txt`;

        const uniqueOwners = await execute(
          `SELECT DISTINCT owner FROM inventory WHERE guild = ?`,
          [guild.id]
        );

        let logData = "--------------\n";

        for (const entry of uniqueOwners) {
          const ownerId = entry.owner;
          const user = await client.users.fetch(ownerId);

          const milkData = await execute(
            `SELECT * FROM inventory WHERE guild = ? AND owner = ? AND type = ? AND old = ?`,
            [guild.id, ownerId, "milk", false]
          );
          const suppliesData = await execute(
            `SELECT * FROM inventory WHERE guild = ? AND owner = ? AND type = ? AND old = ?`,
            [guild.id, ownerId, "supplies", false]
          );
          const materialsData = await execute(
            `SELECT * FROM inventory WHERE guild = ? AND owner = ? AND type = ? AND old = ?`,
            [guild.id, ownerId, "materials", false]
          );
          const eggsData = await execute(
            `SELECT * FROM inventory WHERE guild = ? AND owner = ? AND type = ? AND old = ?`,
            [guild.id, ownerId, "eggs", false]
          );

          const milkBalance = milkData
            .map((x) => Number(x["amount"]))
            .reduce((a, b) => a + b, 0);
          const suppliesBalance = suppliesData
            .map((x) => Number(x["amount"]))
            .reduce((a, b) => a + b, 0);
          const materialsBalance = materialsData
            .map((x) => Number(x["amount"]))
            .reduce((a, b) => a + b, 0);
          const eggsBalance = eggsData
            .map((x) => Number(x["amount"]))
            .reduce((a, b) => a + b, 0);

          logData += `${user.username} (${ownerId}):\n`;
          logData += `  Milk: ${milkBalance}\n`;
          logData += `  Supplies: ${suppliesBalance}\n`;
          logData += `  Materials: ${materialsBalance}\n`;
          logData += `  Eggs: ${eggsBalance}\n`;
          logData += "--------------\n";
        }

        fs.writeFileSync(fileName, logData, "utf8");
        console.log(`Log file ${fileName} generated successfully.`);

        const Embed = new EmbedBuilder()
          .setTitle(":white_check_mark: | Weekly Log Generated")
          .setDescription(
            `> Dear Administrators,\n\n> The database has been reset and all members will start with a clean profile this week.\n> The weekly log has been generated and saved as \`${fileName}\`.`
          )
          .setTimestamp()
          .setAuthor({
            name: `${client.user.username}`,
            iconURL: `${client.user.displayAvatarURL()}`,
          })
          .setColor("#6488EA");

        const adminChannel = guild.channels.cache.find(
          (channel) => channel.id === config.admin_id
        );
        const { AttachmentBuilder } = require("discord.js");

        const file = new AttachmentBuilder(fileName, {
          name: "logs.txt",
        });

        if (adminChannel) {
          adminChannel.send({ embeds: [Embed], files: [file] });
        }
      } catch (error) {
        console.error("Error during the task:", error);
      }
    });
  },
};
