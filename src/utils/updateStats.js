module.exports = async function updateStats(guild) {
    const verifiedRoleId = '1491431073563807834'; // Testerzy
    const clientRoleId = '1491430570884857996';   // Klienci

    const verifiedChannelId = '1493334329517015221'; // Kanał Testerzy
    const clientChannelId = '1493334022657544316';   // Kanał Klienci

    const verifiedRole = guild.roles.cache.get(verifiedRoleId);
    const clientRole = guild.roles.cache.get(clientRoleId);

    if (!verifiedRole || !clientRole) return;

    const verifiedCount = verifiedRole.members.size;
    const clientCount = clientRole.members.size;

    const verifiedChannel = guild.channels.cache.get(verifiedChannelId);
    const clientChannel = guild.channels.cache.get(clientChannelId);

    if (verifiedChannel) {
        verifiedChannel.setName(`✨ .•°. Testerzy .•°.-> ${verifiedCount}`).catch(() => {});
    }

    if (clientChannel) {
        clientChannel.setName(`✨ .•°. Klienci .•°.-> ${clientCount}`).catch(() => {});
    }
};
