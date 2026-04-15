const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Tworzy giveaway')
        .addStringOption(opt =>
            opt.setName('nagroda')
                .setDescription('Co można wygrać?')
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName('wymagania')
                .setDescription('Wymagania do udziału')
                .setRequired(true)
        )
        .addIntegerOption(opt =>
            opt.setName('czas')
                .setDescription('Czas trwania w minutach')
                .setRequired(true)
        )
        .addIntegerOption(opt =>
            opt.setName('zwyciezcy')
                .setDescription('Ilu zwycięzców ma być?')
                .setRequired(true)
        ),

    async execute(interaction) {

        const prize = interaction.options.getString('nagroda');
        const req = interaction.options.getString('wymagania');
        const minutes = interaction.options.getInteger('czas');
        const winners = interaction.options.getInteger('zwyciezcy');

        const endTime = Date.now() + minutes * 60 * 1000;

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('🎉 Giveaway!')
            .setDescription(
                `**Nagroda:** ${prize}\n` +
                `**Wymagania:** ${req}\n` +
                `**Zwycięzców:** ${winners}\n\n` +
                `⏳ Obliczanie czasu...`
            )
            .setFooter({ text: 'Giveaway trwa...' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('join_giveaway')
                .setLabel('Dołącz 🎉')
                .setStyle(ButtonStyle.Success)
        );

        const msg = await interaction.reply({
            embeds: [embed],
            components: [row],
            fetchReply: true
        });

        const data = {
            participants: [],
            messageId: msg.id,
            prize: prize,
            requirements: req,
            endTime: endTime,
            winners: winners
        };

        fs.writeFileSync('./giveawayData.json', JSON.stringify(data, null, 4));

        updateGiveaway(interaction.client);
    }
};

function updateGiveaway(client) {
    setInterval(async () => {
        const fs = require('fs');
        const data = JSON.parse(fs.readFileSync('./giveawayData.json', 'utf8'));

        if (!data.messageId) return;

        const channel = client.channels.cache.find(ch =>
            ch.messages?.cache.has(data.messageId)
        );

        if (!channel) return;

        const msg = await channel.messages.fetch(data.messageId).catch(() => null);
        if (!msg) return;

        const now = Date.now();
        const remaining = data.endTime - now;

        if (remaining <= 0) {

            let winnersList = [];

            if (data.participants.length) {
                for (let i = 0; i < data.winners; i++) {
                    const winner = data.participants[Math.floor(Math.random() * data.participants.length)];
                    winnersList.push(`<@${winner}>`);
                }
            }

            const endEmbed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setTitle('🎉 Giveaway zakończony!')
                .setDescription(
                    data.participants.length
                        ? `**Nagroda:** ${data.prize}\n🎉 **Zwycięzcy:**\n${winnersList.join('\n')}`
                        : 'Brak uczestników!'
                );

            await msg.edit({ embeds: [endEmbed], components: [] });

            return;
        }

        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((remaining / (1000 * 60)) % 60);
        const seconds = Math.floor((remaining / 1000) % 60);

        const timeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('🎉 Giveaway!')
            .setDescription(
                `**Nagroda:** ${data.prize}\n` +
                `**Wymagania:** ${data.requirements}\n` +
                `**Zwycięzców:** ${data.winners}\n` +
                `**Uczestnicy:** ${data.participants.length}\n\n` +
                `⏳ **Pozostały czas:** ${timeString}`
            )
            .setFooter({ text: 'Giveaway trwa...' });

        await msg.edit({ embeds: [embed] });

    }, 10000);
}
