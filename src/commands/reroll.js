const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reroll')
        .setDescription('Losuje nowych zwycięzców giveaway'),

    async execute(interaction) {

        const data = JSON.parse(fs.readFileSync('./giveawayData.json', 'utf8'));

        if (!data.participants.length) {
            return interaction.reply({ content: 'Brak uczestników!', ephemeral: true });
        }

        let winnersList = [];

        for (let i = 0; i < data.winners; i++) {
            const winner = data.participants[Math.floor(Math.random() * data.participants.length)];
            winnersList.push(`<@${winner}>`);
        }

        return interaction.reply(`🎉 **Nowi zwycięzcy:**\n${winnersList.join('\n')}`);
    }
};
