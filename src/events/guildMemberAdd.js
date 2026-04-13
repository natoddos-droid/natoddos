module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {

        // ID kanału powitalnego
        const welcomeChannelId = '1493331964701315082';

        const channel = member.guild.channels.cache.get(welcomeChannelId);
        if (!channel) return;

        try {
            await channel.send(`👋 Witaj ${member}! Cieszymy się, że dołączyłeś na nasz serwer!`);
        } catch (err) {
            console.error('Błąd przy wysyłaniu powitania:', err);
        }
    },
};
