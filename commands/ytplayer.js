const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, 
		getVoiceConnection, 
		createAudioPlayer, 
		createAudioResource,
		VoiceConnectionStatus, 
		entersState, 
		AudioPlayerStatus} = require('@discordjs/voice');
const ytdl = require('play-dl');


module.exports = {

	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play music track from YT (insert URL)')
		.setDescriptionLocalizations({ru: 'Проигрывает трек с ютуба (нужно вставить ссылку)'})
		.addStringOption(option => 
			option
				.setName('url')	
				.setDescription('URL u want to play!')
				.setDescriptionLocalizations({ru: 'Ссылка которую вы хотите использовать!'})
				.setRequired(true)),
	async execute(interaction) {
		if (interaction.member.voice.channel && AudioPlayerStatus.Idle) {
			const voiceChannel = interaction.member.voice.channelId;
			const url = interaction.options.getString('url');
			const video = await ytdl.video_info(url);
			interaction.reply(`**Playing:** ${video.video_details.title} \n from channel: **${video.video_details.channel}**`);
			const voiceConnection = joinVoiceChannel({
				channelId: voiceChannel,
				guildId: interaction.guildId,
				adapterCreator: interaction.guild.voiceAdapterCreator,
			});
			const streamdis = await ytdl.stream(url, { discordPlayerCompatibility: true });
			try {
				await entersState(voiceConnection, VoiceConnectionStatus.Ready, 5000);
				console.log('Connected: ' + interaction.guild.name);
			} catch (error) {
				console.log('Voice Connection not ready within 5s.', error);
				return null;
			}
			const vc = getVoiceConnection(interaction.guildId);
			try {
				const ap = createAudioPlayer();
				vc.subscribe(ap);
				const track = createAudioResource(streamdis.stream);
				ap.play(track);
			} catch (e) {
				console.log(e);
				voiceConnection.disconnect();
			}
		} else {
			await interaction.reply('Connect to voice channel first!');
		}
	},
};