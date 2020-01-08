import TwitchClient from '@twitch/twitch.client';
import TwitchSettings from '@twitch/twitch.settings';

TwitchClient.client.onRegister(() =>
  TwitchSettings.settings.channels.forEach(chan =>
    TwitchClient.client.join(chan)
  )
);
