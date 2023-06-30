const { SlashCommandBuilder } = require('discord.js');
const { vktoken, user_id } = require('./config.json')
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const xhr = new XMLHttpRequest();
const parseString = require('xml2js').parseString;

module.exports = {
	data: new SlashCommandBuilder()
		.setNSFW(false)
		.setName('vkmessage')
		.setDescription('Send message in vk!')
		.setDescriptionLocalizations({
			ru: 'Отправляет сообщения в ВК!',
		})
		.addStringOption(option =>
			option
				.setName('message')
				.setDescription('message u want to send!')
				.setRequired(true)),
	async execute(interaction) {
		let message = interaction.options.getString('message');
		let url = `https://api.vk.com/method/messages.send?access_token=${vktoken}&chat_id=1&random_id=${Date.now()}&message=${message}&v=5.131`;
		console.log(fetch(url));
		try {
			// debug output
			let response = await fetch(url);
			console.log(response);
			interaction.reply(`Код запроса: ${response.status}`);
		}
		catch (err) {
			console.log(`Запрос не удался. Ошибка XHR: ${xhr.status}, выданный результат: ${xhr.response}`);
			interaction.reply('Error ocured! :C');
		}
	},
};
