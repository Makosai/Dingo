import { LocalError } from '@utils/errors.utils';
import TwitchWebhooks from '@twitch/twitch.webhooks';
import twitchAuth from '@twitch/twitch.auth';
import TwitchStreams from '@twitch/twitch.streams';
import { Message, TextChannel } from 'discord.js';
import { client } from '@discord/discord.main';

class Streams {
  constructor() {
    this.loadStreams();
  }

  async loadStreams() {
    TwitchStreams.users.forEach(user => {
      TwitchStreams.subscribe(user);
    });
  }

  /**
   *
   * @param cmd The streams-specific command.
   * @param params Params, if any, that go with the cmd.
   */
  handler(msg: Message, cmd: string, params?: string[]) {
    switch (cmd) {
      case 'list':
        msg.channel.send(this.getStreams());
        return;

      case 'register':
        TwitchStreams.addChannel(msg.channel.id)
          .then(async () => {
            await msg.author.send(
              `I am now registered to ${msg.channel.toString()}`
            );
            await msg.delete();
          })
          .catch(async () => {
            await msg.author.send(
              `Something went wrong. Maybe I'm already registered to #${msg.channel.toString()}?`
            );
            await msg.delete();
          });
        return;

      case 'unregister':
        TwitchStreams.removeChannel(msg.channel.id)
          .then(async () => {
            await msg.author.send(
              `I am no longer registered to ${msg.channel.toString()}`
            );
            await msg.delete();
          })
          .catch(async () => {
            await msg.author.send(
              `Oopsie! Check if I'm actually registered to #${msg.channel.toString()}.`
            );
            await msg.delete();
          });
        return;

      case 'registered':
        const parsedChannels =
          TwitchStreams.channels
            .map(channel => {
              const foundChannel = client.channels.get(channel) as TextChannel;

              return `# ${foundChannel.name}`;
            })
            .join('\n') || `# I'm not registered to any channels.`;

        msg.author
          .send(
            `\`\`\`ini
[Registration]

${parsedChannels}\`\`\``
          )
          .then(() => msg.delete())
          .catch(() => msg.delete());

        return;
    }

    if (params === undefined) {
      return;
    }

    switch (cmd) {
      case 'add':
        this.addStream(params.join(' ')).then(user =>
          msg.channel.send(`Added ${user.displayName} to the stream list.`)
        );
        return;

      case 'remove':
        this.removeStream(params.join(' ')).then(user =>
          msg.channel.send(`Removed ${user.displayName} from the stream list.`)
        );
        return;
    }
  }

  private async addStream(user: string) {
    if (
      TwitchStreams.users.find(
        userData => userData.name.toLowerCase() === user.toLowerCase()
      ) !== undefined
    ) {
      throw new LocalError(
        `Failed to add ${user} to the stream list. User already exists.`
      );
    }

    const userData = await twitchAuth.twitchCredentials.helix.users.getUserByName(
      user
    );

    if (!userData) {
      throw new LocalError(`Failed to add ${user} to the streams list.`);
    }

    await TwitchStreams.addUser(userData);

    await TwitchStreams.subscribe(userData);

    return userData;
  }

  private getStreams() {
    const users =
      TwitchStreams.users.length <= 0
        ? '# The streams list is empty.'
        : TwitchStreams.users.map(user => `# ${user.displayName}`).join('\n');

    return `\`\`\`ini
[Streams]

${users}\`\`\``;
  }

  private async removeStream(user: string) {
    const foundUser = TwitchStreams.users.find(
      userData => userData.name.toLowerCase() === user.toLowerCase()
    );

    if (foundUser === undefined) {
      throw new LocalError(
        `Couldn't find a user in the list with the name ${user}.`
      );
    }

    const sub = TwitchWebhooks.subscriptions.get(foundUser.id);

    if (sub === undefined) {
      throw new LocalError(`Couldn't find the webhook for ${user}.`);
    }

    await sub.stop();

    await TwitchStreams.removeUser(foundUser);

    return foundUser;
  }
}

export default new Streams();
