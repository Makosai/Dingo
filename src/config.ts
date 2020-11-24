(async function () {
  await import('@express/express.config');
  await import('@firebase/firebase.config');
  await (await import('@twitch/twitch.config')).default;
  await import('@discord/discord.config');
})();
