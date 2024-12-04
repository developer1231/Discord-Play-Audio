const fs = require("node:fs");
const path = require("node:path");
const n = require("./config.json");
const translateAPI = require("@vitalets/google-translate-api");
const { execute, makeid } = require("./database/database");
const {
  REST,
  Routes,
  ChannelType,
  ButtonStyle,
  ButtonBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  AttachmentBuilder,
  Embed,
  ChannelSelectMenuBuilder,
  ChannelSelectMenuComponent,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const {
  Client,
  Events,
  GatewayIntentBits,
  PermissionFlagsBits,
  Collection,
  EmbedBuilder,
} = require("discord.js");

const client = new Client({
  intents: Object.keys(GatewayIntentBits).map((a) => {
    return GatewayIntentBits[a];
  }),
});
client.invites = {};
const commands = [];
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);
client.commands = new Collection();
for (const folder of commandFolders) {
  if (fs.lstatSync("./commands/" + folder).isDirectory()) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }
}

const rest = new REST().setToken(n.token);
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );
    const data = await rest.put(Routes.applicationCommands(n.clientid), {
      body: commands,
    });

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
})();

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  let id;
  try {
    id = makeid(10);
    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("translate-" + id)
        .setEmoji("🌎")
        .setLabel("Translate")
        .setStyle(ButtonStyle.Primary)
    );
    await message.reply({ components: [button] });
  } catch (e) {
    return;
  }

  await execute(
    `INSERT INTO messages (message_id, custom_id, channel_id) VALUES (?, ?, ?)`,
    [message.id, id, message.channel.id]
  );
});
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.guild)
    return interaction.reply({
      ephemeral: true,
      content: `> :x: This command can only be used in guilds, and not DMs.`,
    });

  let command = client.commands.get(interaction.commandName);
  if (interaction.isCommand()) {
    command.execute(interaction);
  }
  if (interaction.isButton()) {
    if (interaction.customId.startsWith("translate-")) {
      let customId = interaction.customId.split("-").pop();
      let data = await execute(`SELECT * FROM messages WHERE custom_id = ?`, [
        customId,
      ]);

      if (data.length > 0) {
        let channel_id = await interaction.guild.channels.fetch(
          data[0].channel_id
        );
        let message;
        try {
          message = await channel_id.messages.fetch(data[0].message_id);
        } catch (e) {}

        if (!message) {
          await interaction.message.delete();
          return;
        }

        const languageOptions = [
          { label: "Arabic", value: "ar", emoji: "🇸🇦" },
          { label: "French", value: "fr", emoji: "🇫🇷" },
          { label: "German", value: "de", emoji: "🇩🇪" },
          { label: "Polish", value: "pl", emoji: "🇵🇱" },
          { label: "Russian", value: "ru", emoji: "🇷🇺" },
          { label: "Spanish", value: "es", emoji: "🇪🇸" },
        ];

        const row = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`select-language-${customId}`)
            .setPlaceholder("Choose a language to translate")
            .addOptions(languageOptions)
        );

        await interaction.reply({
          ephemeral: true,
          content:
            "> Please select a language to translate the message (You have 1 minute to select a language):",
          components: [row],
        });

        const filter = (i) =>
          i.customId === `select-language-${customId}` &&
          i.user.id === interaction.user.id;

        const collector = interaction.channel.createMessageComponentCollector({
          filter,
          time: 60000,
        });

        collector.on("collect", async (selectInteraction) => {
          const selectedLanguage = selectInteraction.values[0];

          if (!(message.embeds.length > 0)) {
            let textObject = await translateAPI.translate(message.content, {
              to: selectedLanguage,
            });

            await selectInteraction.update({
              content: `**Translated Message (${selectedLanguage}):**\n> ${textObject.text.replaceAll(
                "\n",
                "\n> "
              )}`,
              components: [],
            });
          } else {
            let textObject1 = await translateAPI.translate(
              message.embeds[0].data.description,
              {
                to: selectedLanguage,
              }
            );
            let textObject2 = await translateAPI.translate(
              message.embeds[0].data.title,
              {
                to: selectedLanguage,
              }
            );

            const Embed = EmbedBuilder.from(message.embeds[0])
              .setTitle(textObject2.text)
              .setDescription(
                textObject1.text +
                  `\n> **Translated Message to ${selectedLanguage}**`
              );

            await selectInteraction.update({
              embeds: [Embed],
              components: [],
            });
          }

          collector.stop();
        });

        collector.on("end", async (_, reason) => {
          if (reason === "time") {
            await interaction.editReply({
              content: "> :x: | The language selection has timed out.",
              components: [],
            });
          }
        });
      }
    }
  }
});

client.login(n.token);
