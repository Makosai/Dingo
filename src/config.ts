(async function() {
  await import('@firebase/firebase.config');
  await (await import('@twitch/twitch.config')).default;
  await import('@discord/discord.config');
})();
