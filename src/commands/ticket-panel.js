const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-panel')
        .setDescription('Wysyła panel ticketów'),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('🎫 Panel Ticketów')
            .setDescription('Wybierz kategorię ticketu z menu poniżej.');

        const menu = new StringSelectMenuBuilder()
            .setCustomId('ticket_select')
            .setPlaceholder('Wybierz typ ticketu')
            .addOptions([
                {
                    label: 'Zakup',
                    value: 'zakup',
                    emoji: '🛒'
                },
                {
                    label: 'Pomoc',
                    value: 'pomoc',
                    emoji: '❓'
                }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};
