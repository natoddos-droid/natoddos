const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel-boosty')
        .setDescription('Wysyła panel benefitów za boosty NATØDDØS'),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor('#9b4dff') // fiolet premium
            .setTitle('🌌 NATØDDØS × Boosty')
            .setDescription(
                `Wybierz jedną z opcji poniżej, aby zobaczyć benefity za boostowanie serwera.\n\n` +
                `Dziękujemy za wspieranie projektu NATØDDØS!`
            )
            .setImage('https://media.tenor.com/2roX3uxz_68AAAAC/galaxy-space.gif')
            .setFooter({ text: 'NATØDDØS × Boosty' });

        const menu = new StringSelectMenuBuilder()
            .setCustomId('boost_menu')
            .setPlaceholder('Wybierz ilość boostów')
            .addOptions([
                {
                    label: 'Benefity za 1 boost',
                    value: 'boost_1',
                    emoji: '✨'
                },
                {
                    label: 'Benefity za 2 boosty',
                    value: 'boost_2',
                    emoji: '🚀'
                }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
};
