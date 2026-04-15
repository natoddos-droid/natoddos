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
                `🏆 **Nagroda:** ${prize}\n` +
                `📋 **Wymagania:** ${req}\n` +
                `🥇 **Zwycięzców:** ${winners}\n\n` +
                `⏳ Obliczanie czasu...`
            )
            .setFooter({ text: 'Giveaway trwa...' });

        // 1. Najpierw wysyłamy wiadomość
        const msg = await interaction.reply({
            embeds: [embed],
            fetchReply: true
        });

        // 2. Teraz tworzymy przycisk z poprawnym ID
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`join_giveaway_${msg.id}`)
                .setLabel('Dołącz 🎉')
                .setStyle(ButtonStyle.Success)
        );

        await msg.edit({
            components: [row]
        });

        const db = JSON.parse(fs.readFileSync('./giveaways.json', 'utf8'));

        db.giveaways[msg.id] = {
            participants: [],
            prize: prize,
            requirements: req,
            endTime: endTime,
            winners: winners,
            buttonId: `join_giveaway_${msg.id}`,
            messageId: msg.id,
            channelId: msg.channel.id
        };

        fs.writeFileSync('./giveaways.json', JSON.stringify(db, null, 4));

        updateGiveaway(interaction.client);
    }
};

function updateGiveaway(client) {
    setInterval(async () => {
        const fs = require('fs');
        const db = JSON.parse(fs.readFileSync('./giveaways.json', 'utf8'));

        for (const id of Object.keys(db.giveaways)) {
            const g = db.giveaways[id];

            const channel = client.channels.cache.get(g.channelId);
            if (!channel) continue;

            const msg = await channel.messages.fetch(g.messageId).catch(() => null);
            if (!msg) continue;

            const now = Date.now();
            const remaining = g.endTime - now;

            if (remaining <= 0) {

                let winnersList = [];

                if (g.participants.length) {
                    for (let i = 0; i < g.winners; i++) {
                        const winner = g.participants[Math.floor(Math.random() * g.participants.length)];
                        winnersList.push(`<@${winner}>`);
                    }
                }

                const endEmbed = new EmbedBuilder()
                    .setColor('#2b2d31')
                    .setTitle('🎉 Giveaway zakończony!')
                    .setDescription(
                        g.participants.length
                            ? `🏆 **Nagroda:** ${g.prize}\n🎉 **Zwycięzcy:**\n${winnersList.join('\n')}`
                            : 'Brak uczestników!'
                    );

                await msg.edit({ embeds: [endEmbed], components: [] });

                delete db.giveaways[id];
                fs.writeFileSync('./giveaways.json', JSON.stringify(db, null, 4));

                continue;
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
                    `🏆 **Nagroda:** ${g.prize}\n` +
                    `📋 **Wymagania:** ${g.requirements}\n` +
                    `🥇 **Zwycięzców:** ${g.winners}\n` +
                    `👥 **Uczestnicy:** ${g.participants.length}\n\n` +
                    `⏳ **Pozostały czas:** ${timeString}`
                )
                .setFooter({ text: 'Giveaway trwa...' });

            await msg.edit({ embeds: [embed] });
        }

    }, 10000);
}
