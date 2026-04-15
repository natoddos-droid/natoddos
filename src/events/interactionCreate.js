const {
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

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

            // Sprawdzenie czy user ma już ticket tego typu
            const existing = guild.channels.cache.find(
                ch => ch.name === `${choice}-${interaction.user.id}`
            );

            if (existing) {
                return interaction.reply({
                    content: 'Masz już otwarty ticket tego typu!',
                    ephemeral: true
                });
            }

            // Tworzenie kanału ticketu
            const channel = await guild.channels.create({
                name: `${choice}-${interaction.user.id}`,
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
                .setTitle('🎫 Ticket otwarty')
                .setDescription(`Wybrałeś kategorię: **${choice.toUpperCase()}**.\nNapisz swoją wiadomość poniżej.`);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('🔒 Zamknij ticket')
                    .setStyle(ButtonStyle.Danger)
            );

            await channel.send({
                content: `<@${interaction.user.id}>`,
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
    },
};
