const { SlashCommandBuilder,
		ChannelType } = require('discord.js');
const { joinVoiceChannel, 
		getVoiceConnection, 
		createAudioPlayer, 
		createAudioResource,
		VoiceConnectionStatus, 
		entersState } = require('@discordjs/voice');
const ytdl = require('play-dl');


module.exports = {

	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play music track from YT (insert URL)')
		.setDescriptionLocalizations({ru: 'Проигрывает трек с ютуба (нужно вставить ссылку)'})
		.addChannelOption((option) => 
			option
				.setName('channel')
				.setDescription('channel u want to use')
				.setDescriptionLocalizations({ru: 'Канал который вы хотите использовать'})
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildVoice),
		)
		.addStringOption(option => 
			option
				.setName('url')	
				.setDescription('URL u want to play!')
				.setDescriptionLocalizations({ru: 'Ссылка которую вы хотите использовать!'})
				.setRequired(true)),
	async execute(interaction) {
		const voiceChannel = interaction.options.getChannel('channel');
		const voiceConnection = joinVoiceChannel({
			channelId: voiceChannel.id,
			guildId: interaction.guildId,
			adapterCreator: interaction.guild.voiceAdapterCreator,
		});
		try {
			await entersState(voiceConnection, VoiceConnectionStatus.Ready, 5000);
			console.log('Connected: ' + voiceChannel.guild.name);
		} catch (error) {
			console.log('Voice Connection not ready within 5s.', error);
			return null;
		}
		const url = interaction.options.getString('url');
		const streamdis = await ytdl.stream(url, { discordPlayerCompatibility: true });
		const video = await ytdl.video_info(url);
		const vc = getVoiceConnection(interaction.guildId);
		try {
			interaction.reply(`Playing: ${video.video_details.title} from user: ${video.video_details.channel}`);
			const ap = createAudioPlayer();
			vc.subscribe(ap);
			const track = createAudioResource(streamdis.stream);
			ap.play(track);
		} catch (e) {
			console.log(e);
			voiceConnection.disconnect();
		}
	},
};