const { SlashCommandBuilder } = require('discord.js');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const xhr = new XMLHttpRequest();

module.exports = {
	data: new SlashCommandBuilder()
		.setNSFW(true)
		.setName('r34rand')
		.setDescription('Give a random r34 art for your request.')
		.setDescriptionLocalizations({
			ru: 'Показывает случайный r34 арт по вашему запросу',
		})
		.addStringOption(option =>
			option
				.setName('tag')
				.setDescription('Tags u want to use')
				.setRequired(true)),
	async execute(interaction) {
		let tag = interaction.options.getString('tag');
		console.log(tag);
		let rand = 1 + Math.random() * 999;
		rand = Math.round(rand);
		console.log(rand);
		xhr.responseType = 'json';
		let url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&limit=1&pid=1&json=1&tags=${tag}&id=${rand}`;
		console.log(url);
		console.log(fetch(url))
		try {
			// debug output
			let response = await fetch(url);
			let art = await response.json();
			console.log(art[0]);
			interaction.reply(art[0].file_url);
		}
		catch (err) {
			console.log(`Запрос не удался. Ошибка XHR: ${xhr.status}, выданный результат: ${xhr.response}`);
			interaction.reply('Error ocured! :C');
		}
	},
};
