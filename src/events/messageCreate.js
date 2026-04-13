module.exports = {
    name: 'messageCreate',
    async execute(message) {

        // Ignoruj boty
        if (message.author.bot) return;

        // Treść wiadomości
        const content = message.content.toLowerCase();

        // Jeśli wiadomość zaczyna się od +rep
        if (content.startsWith('+rep')) {
            try {
                // Reakcja customową emotką
                await message.react('1493328405129592842');
            } catch (err) {
                console.error('Nie mogę dodać reakcji:', err);
            }
        }
    },
};
