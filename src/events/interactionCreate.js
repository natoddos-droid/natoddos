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

            const choice = interaction.values[0]; // zakup / pomoc
            const guild = interaction.guild;

            const categoryId = '1491474974878208270'; // Twoja kategoria
            const ownerRoleId = '1491425920391581747'; // Rola właściciela

            // --- NUMERACJA TICKETÓW ---
            let counter = JSON.parse(fs.readFileSync(counterPath, 'utf8'));
            counter.count++;
            fs.writeFileSync(counterPath, JSON.stringify(counter, null, 4));

            const ticketNumber = counter.count;
            const channelName = `${choice}-${ticketNumber}`;

            // Tworzenie kanału ticketu
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
                        id: ownerRoleId, // właściciele widzą wszystkie tickety
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
        if (interaction.isButton() && interaction.customId === 'join_giveaway') {

            const data = JSON.parse(fs.readFileSync('./giveawayData.json', 'utf8'));

            // Jeśli user już jest → usuń go
            if (data.participants.includes(interaction.user.id)) {

                data.participants = data.participants.filter(id => id !== interaction.user.id);

                fs.writeFileSync('./giveawayData.json', JSON.stringify(data, null, 4));

                return interaction.reply({
                    content: '❌ Wyszedłeś z giveaway.',
                    ephemeral: true
                });
            }

            // Jeśli user nie jest → dodaj go
            data.participants.push(interaction.user.id);
            fs.writeFileSync('./giveawayData.json', JSON.stringify(data, null, 4));

            return interaction.reply({
                content: '🎉 Dołączyłeś do giveaway!',
                ephemeral: true
            });
        }
    },
};
