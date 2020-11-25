import TwitchClient from '@twitch/twitch.client';
// import TwitchSettings from '@twitch/twitch.settings';
import { toParams } from '@utils/discord.utils';
import TwitchStreams from '@twitch/twitch.streams';
import { debug } from '@utils/essentials.utils';

interface ITwitchCommandInfo {
  options: string[];
}

const commands: Map<string, ITwitchCommandInfo> = new Map([
  [
    'funds',
    {
      options: ['all', 'add', 'reset', 'watch'],
    },
  ],
]);

TwitchClient.client.onMessage(async (channel, user, message, msg) => {
  // Handle the command & params
  const tempVal = message.indexOf(' ');
  const command = message
    .substring(1, tempVal === -1 ? message.length : tempVal)
    .toLowerCase();
  let params: string[] = [];

  if (message.includes(' ')) {
    params = toParams(message.substring(tempVal + 1, message.length));
  }

  // tslint:disable-next-line: no-parameter-reassignment
  const channelName = channel.substr(1);

  switch (command) {
    case 'commands':
      const response = [];

      for (const [key, value] of commands.entries()) {
        response.push(`${key} [${value.options.sort().join(' | ')}]`);
      }

      TwitchClient.client.say(
        channel,
        `Here's a list of the available commands: ${response.join(', ')}`
      );
      break;

    case 'funds':
      if (params.length <= 0) {
        // Handle default
        TwitchClient.client.say(
          channel,
          `We have currently raised $${
            TwitchStreams.funds[channelName].value / 100
          }`
        );
      }

      let value;

      switch (params[0]) {
        case 'all':
          TwitchClient.client.say(
            channel,
            `This command would show all historical funding entries but isn't implemnented.`
          );
          break;

        case 'add':
          value = Number(params[1]);

          if (isNaN(value)) {
            break;
          }

          value = value * 100;

          await TwitchStreams.addFundsValue(channelName, value);
          TwitchClient.client.say(
            channel,
            `${Number(value / 100).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })} has been added to the funds.`
          );
          break;

        case 'reset':
          value = -TwitchStreams.funds[channelName].value;

          await TwitchStreams.addFundsValue(channelName, value);
          TwitchClient.client.say(
            channel,
            `${Number(value / 100).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })} has been cleared from the funds.`
          );

        case 'watch':
          const isWatching = TwitchStreams.funds[channelName].watching;

          try {
            await TwitchStreams.toggleFunds(channelName);

            TwitchClient.client.say(
              channel,
              isWatching
                ? `Alright, I've put my watching on pause.`
                : `Yes, chief. I'm now watching for funds.`
            );
          } catch (e) {
            debug(e);
          }
          break;
      }
      break;
  }
});
