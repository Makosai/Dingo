import TwitchClient from '@twitch/twitch.client';
import TwitchSettings from '@twitch/twitch.settings';

const chatClient = TwitchClient.client;
const twitchSettings = TwitchSettings.settings;

chatClient.onRegister(() =>
  twitchSettings.channels.forEach(chan => chatClient.join(chan))
);
