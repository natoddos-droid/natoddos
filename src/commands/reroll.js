const { SlashCommandBuilder } = require('discord.js');
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

        if (!db.giveaways[id]) {
            return interaction.reply({ content: 'Nie znaleziono giveaway o tym ID!', ephemeral: true });
        }

        const g = db.giveaways[id];

        if (!g.participants.length) {
            return interaction.reply({ content: 'Brak uczestników!', ephemeral: true });
        }

        let winnersList = [];

        for (let i = 0; i < g.winners; i++) {
            const winner = g.participants[Math.floor(Math.random() * g.participants.length)];
            winnersList.push(`<@${winner}>`);
        }

        return interaction.reply(`🎉 **Nowi zwycięzcy giveaway ${id}:**\n${winnersList.join('\n')}`);
    }
};
