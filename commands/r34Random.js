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
		let tag = interaction.options.getString('tag');
		console.log(tag);
		let rand = 1 + Math.random() * 999;
		rand = Math.round(rand);
		console.log(rand);
		xhr.responseType = 'json';
		let url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&limit=1&pid=1&json=1&tags=${tag}&id=${rand}`;
		console.log(url);
		xhr.open('GET', url, false);
		xhr.send();
		try {
			// debug output
			console.log(xhr.open('HEAD', `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&limit=1&pid=1&json=1&tags=${tag}&id=${rand}`, false));
			// below is message code
			if (xhr.status != 200) {
				console.log(`Ошибка ${xhr.status}: ${xhr.statusText}`);
			}
			else {
				xhr.onload = function() {
					parseString(xhr.response, function(err, result) {
						console.log(result);
						console.log(result.file_url);
						interaction.reply(result.file_url);
					});
				};
			}
		}
		catch (err) {
			console.log(`Запрос не удался. Ошибка XHR: ${xhr.status}, выданный результат: ${xhr.response}`);
			interaction.reply('Error ocured! :C');
		}
	},
};
