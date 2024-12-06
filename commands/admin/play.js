const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription(`Play the audio file`),
  async execute(interaction) {
    if (!interaction.member.voice.channel) {
      const Initial = new EmbedBuilder()
        .setTitle(":x: | Voice Channel Not Detected")
        .setThumbnail(interaction.guild.iconURL())
        .setDescription(
          `> Dear ${interaction.member}, you are currently not in a voice channel, hence we cannot play the audio file. Please join a voice channel and use \`\`/play\`\` again.`
        )
        .setTimestamp()
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setColor("Red")
        .setFooter({ text: `👾 | Audio Player` });
      return interaction.reply({
        embeds: [Initial],
        ephemeral: true,
      });
    }
    const voiceChannel = interaction.member?.voice.channel;

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });
    try {
      const player = createAudioPlayer();
      const resource = createAudioResource("./music/audio.mp3");

      await player.play(resource);
      await connection.subscribe(player);

      player.on("error", (error) => {
        console.error(`[❌] Audio player error: ${error.message}`);
      });
      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
        console.log("[✅] Stopped playing. Left the voice channel.");
      });
    } catch (e) {
      console.log(e);
    }

    const Initial = new EmbedBuilder()
      .setTitle("✅ | Successfully started playing")
      .setThumbnail(interaction.guild.iconURL())
      .setDescription(
        `> Dear ${interaction.member}, i have successfully joined the voice channel and started playing. Once the audio has finished, i shall leave the channel again. Please use \`\`/play\`\` again to have me join and play the audio again.`
      )
      .setTimestamp()
      .setAuthor({
        name: `${interaction.client.user.username}`,
        iconURL: `${interaction.client.user.displayAvatarURL()}`,
      })
      .setColor("Red")
      .setFooter({ text: `👾 | Audio Player` });
    await interaction.reply({
      ephemeral: true,
      embeds: [Initial],
    });
  },
};
