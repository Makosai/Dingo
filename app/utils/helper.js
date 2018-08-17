/**
 * A list of functions that are used frequently and
 * specifically for this bot.
 */

module.exports.compareChans = (msg, data) => {
  if (data.categories != null && !data.categories.includes(msg.channel.parent.name)) {
    return false;
  }

  if (data.channels != null && !data.channels.includes(msg.channel.name)) {
    return false;
  }

  return true;
};

module.exports.compareRoles = (msg, data) => {
  if (msg.member == null || typeof msg.member === 'undefined') {
    return false;
  }

  const { roles } = msg.member;

  if (roles == null || typeof roles === 'undefined') {
    return false;
  }

  if (data == null) {
    return true;
  }

  const bool = data.some((elem) => {
    if (roles.exists('name', elem)) {
      return true;
    }
    return false;
  });
  return bool;
};

module.exports.compareGuilds = (msg, data) => {
  if (data != null && !data.includes(msg.guild.name)) {
    return false;
  }

  return true;
}
