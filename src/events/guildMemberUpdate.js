const updateStats = require('../utils/updateStats');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        updateStats(newMember.guild);
    },
};
