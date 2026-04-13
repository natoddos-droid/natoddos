const updateStats = require('../utils/updateStats');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        updateStats(member.guild);
    },
};
