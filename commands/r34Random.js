const { SlashCommandBuilder } = require('discord.js');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const xhr = new XMLHttpRequest();
const parseString = require('xml2js').parseString;


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
		const tag = interaction.options.getString('tag');
		let rand = 1 + Math.random() * 999;
		xhr.responseType = 'json';
		xhr.open('GET', `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&limit=1&pid=1&tags=${tag}&id=${rand}`, false);
		try {
			xhr.send();
			if (xhr.status != 200) {
				console.log(`Ошибка ${xhr.status}: ${xhr.statusText}`);
			}
			else {
				xhr.onload = function() {
					parseString(xhr.response, function(err, result) {
						interaction.reply(result);
					});
					let responseObj = xhr.response;
					console.log(responseObj.sample_url);
					interaction.reply(responseObj.sample_url);
				};
			}
		}
		catch (err) {
			console.log('Запрос не удался.');
			interaction.reply('Error ocured! :C');
		}
	},
};
