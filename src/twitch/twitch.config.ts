// Ordered Imports
export default (async function() {
  await (await import('./twitch.auth')).default.sync;
  await (await import('./twitch.data')).default.sync,
  await Promise.all([
    (await import('./twitch.client')).default.sync,
    (await import('./twitch.webhooks')).default.sync,
    (await import('./twitch.pubsub')).default.sync,
    (await import('./twitch.settings')).default.sync,
    (await import('./twitch.streams')).default.sync
  ]);
  await import('./twitch.main');
})();
