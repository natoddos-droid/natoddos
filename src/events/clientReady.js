const { REST, Routes } = require('discord.js');
require('dotenv').config();

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Bot zalogowany jako ${client.user.tag}`);

        const commands = client.commands.map(cmd => cmd.data.toJSON());
        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

        try {
            console.log('Rejestrowanie komend...');
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );
            console.log('Komendy zarejestrowane!');
        } catch (error) {
            console.error(error);
        }
    },
};
