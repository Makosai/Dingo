// Ordered Imports
export default (async function() {
  await import('./twitch.auth');
  await Promise.all([
    (await import('./twitch.client')).default.sync,
    (await import('./twitch.webhooks')).default.sync,
    (await import('./twitch.settings')).default.sync,
    (await import('./twitch.streams')).default.sync
  ]);
  await import('./twitch.main');
})();
