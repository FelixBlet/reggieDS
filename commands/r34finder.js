const { ButtonBuilder, ButtonStyle, SlashCommandBuilder, ActionRowBuilder } = require('discord.js');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const xhr = new XMLHttpRequest();

module.exports = {
	data: new SlashCommandBuilder()
		.setNSFW(true)
		.setName('r34find')
		.setDescription('Give r34 art for your request.')
		.setDescriptionLocalizations({
			ru: 'Показывает случайный r34 арт по вашему запросу',
		})

		.addStringOption(option =>
			option
				.setName('tag')
				.setDescription('Tags u want to use')
				.setDescriptionLocalizations({
					ru: 'Теги которые вы хотите использовать.',
				})
				.setRequired(true))

		.addIntegerOption(option =>
			option.setName('id')
				.setDescription('ID of post')
				.setDescriptionLocalizations({
					ru: 'ID поста.',
				}),
		),
	async execute(interaction) {
		let tag = interaction.options.getString('tag');
		console.log(tag);
		let num = interaction.options.getInteger('id') ?? 1;
		xhr.responseType = 'json';
		let url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&limit=1&pid=${num}&json=1&tags=${tag}`;
		console.log(url);
		console.log(fetch(url));
		// кнопка вперед
		const next = new ButtonBuilder()
			.setCustomId('next')
			.setEmoji('➡')
			.setStyle(ButtonStyle.Primary);
		// кнопка назад
		const previous = new ButtonBuilder()
			.setCustomId('previous')
			.setEmoji('⬅')
			.setStyle(ButtonStyle.Primary);
		const row = new ActionRowBuilder()
			.addComponents(previous, next);
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
				try {
					const click = await mess.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

					if (click.customId === 'next') {
						num = num + 1;
						url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&limit=1&pid=${num}&json=1&tags=${tag}`;
						response = await fetch(url);
						art = await response.json();
						console.log(num);
						await click.update({ content: art[0].file_url, components: [row] });
					}
					else if (click.customId === 'previous') {
						num = num - 1;
						url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&limit=1&pid=${num}&json=1&tags=${tag}`;
						response = await fetch(url);
						art = await response.json();
						console.log(num);
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
			console.log(`Запрос не удался. Ошибка XHR: ${xhr.status}, выданный результат: ${xhr.response}`);
			interaction.reply('Error ocured! :C');
		}
	},
};
