const {
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const fs = require('fs');
const counterPath = './ticketCounter.json';

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {

        // --- OBSŁUGA KOMEND ---
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: 'Wystąpił błąd podczas wykonywania komendy!',
                    ephemeral: true
                });
            }
        }

        // --- SELECT MENU TICKETÓW ---
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {

            const choice = interaction.values[0];
            const guild = interaction.guild;

            const categoryId = '1491474974878208270';
            const ownerRoleId = '1491425920391581747';

            // --- NUMERACJA TICKETÓW ---
            let counter = JSON.parse(fs.readFileSync(counterPath, 'utf8'));
            counter.count++;
            fs.writeFileSync(counterPath, JSON.stringify(counter, null, 4));

            const ticketNumber = counter.count;
            const channelName = `${choice}-${ticketNumber}`;

            const channel = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: categoryId,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    },
                    {
                        id: ownerRoleId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageChannels
                        ]
                    }
                ]
            });

            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setTitle(`🎫 Ticket #${ticketNumber}`)
                .setDescription(`Wybrałeś kategorię: **${choice.toUpperCase()}**.\nNapisz swoją wiadomość poniżej.`);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('🔒 Zamknij ticket')
                    .setStyle(ButtonStyle.Danger)
            );

            await channel.send({
                content: `@everyone <@${interaction.user.id}>`,
                embeds: [embed],
                components: [row]
            });

            return interaction.reply({
                content: `Ticket utworzony: ${channel}`,
                ephemeral: true
            });
        }

        // --- ZAMYKANIE TICKETU ---
        if (interaction.isButton() && interaction.customId === 'close_ticket') {

            const channel = interaction.channel;

            await interaction.reply({
                content: 'Ticket zostanie zamknięty za 3 sekundy...',
                ephemeral: true
            });

            setTimeout(() => {
                channel.delete().catch(() => {});
            }, 3000);
        }

        // --- GIVEAWAY JOIN / LEAVE ---
        if (interaction.isButton() && interaction.customId.startsWith('join_giveaway_')) {

            const db = JSON.parse(fs.readFileSync('./giveaways.json', 'utf8'));
            const giveawayId = interaction.customId.replace('join_giveaway_', '');

            if (!db.giveaways[giveawayId]) {
                return interaction.reply({
                    content: 'Ten giveaway już nie istnieje.',
                    ephemeral: true
                });
            }

            const g = db.giveaways[giveawayId];

            if (g.participants.includes(interaction.user.id)) {

                g.participants = g.participants.filter(id => id !== interaction.user.id);
                fs.writeFileSync('./giveaways.json', JSON.stringify(db, null, 4));

                return interaction.reply({
                    content: '❌ Wyszedłeś z giveaway.',
                    ephemeral: true
                });
            }

            g.participants.push(interaction.user.id);
            fs.writeFileSync('./giveaways.json', JSON.stringify(db, null, 4));

            return interaction.reply({
                content: '🎉 Dołączyłeś do giveaway!',
                ephemeral: true
            });
        }

        // --- PANEL CENNIKA ---
        if (interaction.isButton() && interaction.customId === 'show_price_list') {

            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setTitle('💰 Cennik NATØDDØS')
                .setDescription(
                    `**Nazwa:** NATØ DDOS\n` +
                    `**Miesiąc użytkowania:** 40 zł\n` +
                    `**Rok użytkowania:** 60 zł\n` +
                    `**Na zawsze:** 80 zł\n\n` +
                    `🛒 **Do zakupu zapraszamy w ticketach!**`
                );

            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }

        // --- PANEL BOOSTÓW (SELECT MENU) ---
        if (interaction.isStringSelectMenu() && interaction.customId === 'boost_menu') {

            const choice = interaction.values[0];

            if (choice === 'boost_1') {

                const embed = new EmbedBuilder()
                    .setColor('#b84dff')
                    .setTitle('✨ Benefity za 1 Boost')
                    .setDescription(
                        `Za **jednego boosta** możesz otrzymać:\n\n` +
                        `🟣 **Wybraną przez siebie ddosiarkę**\n\n` +
                        `Dziękujemy za wspieranie NATØDDØS!`
                    );

                return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                });
            }

            if (choice === 'boost_2') {

                const embed = new EmbedBuilder()
                    .setColor('#ff4db8')
                    .setTitle('🚀 Benefity za 2 Boosty')
                    .setDescription(
                        `Za **dwa boosty** możesz otrzymać:\n\n` +
                        `💎 **Jeszcze niewypuszczoną przez nas ddosiarkę** (early access)\n\n` +
                        `Dziękujemy za wspieranie NATØDDØS!`
                    );

                return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                });
            }
        }
    },
};
