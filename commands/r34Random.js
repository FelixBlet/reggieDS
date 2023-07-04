const { ButtonBuilder, ButtonStyle, SlashCommandBuilder, ActionRowBuilder } = require('discord.js');
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
		// making things "random"
		let rand = 1 + Math.random() * 999;
		rand = Math.round(rand);
		console.log(rand);
		// making request to api
		xhr.responseType = 'json';
		let url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&limit=1&pid=1&json=1&tags=${tag}&id=${rand}`;
		// little debug stuff
		console.log(fetch(url));
		// make button with emoji
		const roll = new ButtonBuilder()
			.setCustomId('roll')
			.setEmoji('🎲')
			.setStyle(ButtonStyle.Primary);
		// make row!
		const row = new ActionRowBuilder().addComponents(roll);
		try {
			// debug output
			let response = await fetch(url);
			let art = await response.json();
			console.log(art[0]);
			const mess = await interaction.reply({
				content: art[0].file_url,
				components: [row],
			});
			while (true) {
				const collectorFilter = i => i.user.id === interaction.user.id;
				// reroll things
				try {
					const click = await mess.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

					if (click.customId === 'roll') {
						rand = 1 + Math.random() * 999;
						rand = Math.round(rand);
						console.log(rand);
						url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&limit=1&pid=${rand}&json=1&tags=${tag}`;
						response = await fetch(url);
						art = await response.json();
						console.log(art[0].file_url);
						await click.update({ content: art[0].file_url, components: [row] });
					}
				}
				catch (e) {
					await interaction.editReply({ content: 'Button wasnt pressed within 1 minute, closing!', components: [] });
					break;
				}
			}
		}
		catch (err) {
			if (err.code !== 'InteractionAlreadyReplied') {
				console.log(`Запрос не удался. Ошибка XHR: ${xhr.status}, выданный результат: ${xhr.response}`);
				interaction.reply('Error occurred! :C Error:' + err);
			}
		}
	},
};
