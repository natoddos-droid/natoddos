module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;

        const content = message.content.toLowerCase();

        if (content.startsWith('+rep')) {
            try {
                await message.react('<:NATO:1493328114011603055>');
            } catch (err) {
                console.error('Nie mogę dodać reakcji:', err);
            }
        }
    },
};
