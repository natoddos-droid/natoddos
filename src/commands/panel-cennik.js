const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel-cennik')
        .setDescription('Wysyła panel z cennikiem NATØDDØS'),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('🛒 Zrób zakupy w NATØDDØS!')
            .setDescription(
                `Kliknij przycisk poniżej, aby zobaczyć **pełny cennik**.\n` +
                `Oferta dostępna dla każdego użytkownika!`
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('show_price_list')
                .setLabel('Zobacz cennik')
                .setEmoji('🛒')
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
};
