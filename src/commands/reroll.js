const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reroll')
        .setDescription('Reroll giveaway po ID')
        .addStringOption(opt =>
            opt.setName('id')
                .setDescription('ID wiadomości giveaway')
                .setRequired(true)
        ),

    async execute(interaction) {

        const id = interaction.options.getString('id');
        const db = JSON.parse(fs.readFileSync('./giveaways.json', 'utf8'));

        // Sprawdzenie czy giveaway istnieje
        if (!db.giveaways[id]) {
            return interaction.reply({
                content: '❌ Nie znaleziono giveaway o tym ID!',
                ephemeral: true
            });
        }

        const g = db.giveaways[id];

        // Sprawdzenie czy są uczestnicy
        if (!g.participants.length) {
            return interaction.reply({
                content: '❌ Brak uczestników w tym giveawayu!',
                ephemeral: true
            });
        }

        // Losowanie zwycięzców bez duplikatów
        const pool = [...g.participants];
        const winnersList = [];

        for (let i = 0; i < g.winners; i++) {
            if (pool.length === 0) break;
            const index = Math.floor(Math.random() * pool.length);
            winnersList.push(`<@${pool[index]}>`);
            pool.splice(index, 1);
        }

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('🎉 Reroll zakończony!')
            .setDescription(
                `🏆 **Nagroda:** ${g.prize}\n` +
                `🎯 **ID Giveaway:** ${id}\n\n` +
                `🎉 **Nowi zwycięzcy:**\n${winnersList.join('\n')}`
            )
            .setFooter({ text: 'Powodzenia następnym razem!' });

        return interaction.reply({ embeds: [embed] });
    }
};
