const updateStats = require('../utils/updateStats');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        updateStats(member.guild);
    },
};
