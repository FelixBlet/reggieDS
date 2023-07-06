const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, 
	getVoiceConnection, 
	createAudioPlayer, 
	createAudioResource,
	VoiceConnectionStatus, 
	entersState,
	AudioPlayerStatus } = require('@discordjs/voice');
const { ytapi } = require('../config.json');
const ytdl = require('play-dl');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const xhr = new XMLHttpRequest();
let vc; let ap;


module.exports= {
	data: new SlashCommandBuilder()
		.setName('search')
		.setDescription('Search and play YT video')
		.setDescriptionLocalizations({ ru: 'Ищет и играет видео из ютуба', })
		.addStringOption(option =>
			option
				.setName('request')
				.setDescription('Search request')
				.setDescriptionLocalizations({ru: 'Запросы поиска',})
				.setRequired(true)),
	async execute(interaction) { 
		const request = interaction.options.getString('request');
		const temp = `https://www.googleapis.com/youtube/v3/search?q=${request}&key=${ytapi}`;
		const spaces = / /gi;
		const url = temp.replace(spaces, '+');
		xhr.responseType = 'json';
		console.log(url);
		try {
			if (interaction.member.voice.channel && AudioPlayerStatus.Idle) {
				const response = await fetch(url);
				const video = await response.json();
				const result = `https://youtube.com/watch?v=${video.items[0].id.videoId}`;
				const vidinf = await ytdl.video_info(result);
				interaction.reply(`**Playing:** ${vidinf.video_details.title} \n from channel: **${vidinf.video_details.channel}**`);
				const voiceConnection = joinVoiceChannel({
					channelId: interaction.member.voice.channelId,
					guildId: interaction.guildId,
					adapterCreator: interaction.guild.voiceAdapterCreator,
				});
				const streamdis = await ytdl.stream(result, { discordPlayerCompatibility: true });
				try {
					await entersState(voiceConnection, VoiceConnectionStatus.Ready, 5000);
					console.log('Connected: ' + interaction.guild.name);
				} catch (error) {
					console.log('Voice Connection not ready within 5s.', error);
					return null;
				}
				vc = getVoiceConnection(interaction.guildId);
				try {
					ap = createAudioPlayer();
					vc.subscribe(ap);
					const track = createAudioResource(streamdis.stream);
					ap.play(track);
				} catch (e) {
					console.log(e);
					voiceConnection.disconnect();
				}
			}
		} catch (e) {
			if ((await fetch(url)).json() == null) {
				interaction.reply('There was none result or error occured!');
			}
		}

	}
}