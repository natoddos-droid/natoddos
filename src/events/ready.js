module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`Zalogowano jako ${client.user.tag}`);
    },
};
