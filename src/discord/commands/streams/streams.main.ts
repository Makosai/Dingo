import { LocalError } from '@utils/errors.utils';
import TwitchWebhooks from '@twitch/twitch.webhooks';
import twitchAuth from '@twitch/twitch.auth';
import { HelixStream, HelixUser } from 'twitch';
import { client } from '@discord/discord.main';
import TwitchStreams from '@twitch/twitch.streams';
import { TextChannel, RichEmbed, Message } from 'discord.js';

class Streams {
  constructor() {
    this.loadStreams();
  }

  async loadStreams() {
    TwitchStreams.users.forEach(user => {
      TwitchWebhooks.webhook.subscribeToStreamChanges(user.id, async stream => {
        if (stream !== undefined) {
          const { message, embed } = await this.broadcast(user, stream);

          TwitchStreams.channels.forEach(id => {
            const channel = client.channels.get(id);

            if (channel !== undefined && channel instanceof TextChannel) {
              channel.send(message, { embed });
            }
          });
        }
      });
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
    }

    if (params === undefined) {
      return;
    }

    switch (cmd) {
      case 'add':
        this.addStream(params.join(' ')).then(() => msg.channel.send(''));
        return;

      case 'remove':
        this.removeStream(params.join(' '));
        return;
    }
  }

  async broadcast(user: HelixUser, stream: HelixStream) {
    const url = `https://twitch.tv/${user.name}`;
    const message = `**${user.displayName}** is now live!`;

    if (stream === null) {
      throw new LocalError(
        `Failed to broadcast ${user.name}'s stream. Stream is null.`
      );
    }

    const game = await stream.getGame();

    if (game === null) {
      throw new LocalError(
        `Failed to broadcast ${user.name}'s stream. Game is null.`
      );
    }

    let embed = new RichEmbed();

    // Author
    embed = embed.setAuthor(user.displayName, user.profilePictureUrl, url);

    // Game & Viewers
    embed = embed.addField('Game', game.name, true);
    embed = embed.addField('Viewers', stream.viewers, true);

    embed = embed.setColor('6441A4');
    embed = embed.setTitle(`${stream.title}`);
    embed = embed.setURL(url);
    embed = embed.setImage(stream.thumbnailUrl);

    return { message, embed };
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

    await TwitchWebhooks.webhook.subscribeToStreamChanges(
      userData.id,
      async stream => {
        if (stream !== undefined) {
          const { message, embed } = await this.broadcast(userData, stream);

          TwitchStreams.channels.forEach(id => {
            const channel = client.channels.get(id);

            if (channel !== undefined && channel instanceof TextChannel) {
              channel.send(message, { embed });
            }
          });
        }
      }
    );

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

    TwitchStreams.removeUser(foundUser);

    const sub = TwitchWebhooks.subscriptions.get(foundUser.id);

    if (sub === undefined) {
      throw new LocalError(`Couldn't find the webhook for ${user}.`);
    }

    await sub.stop();

    return foundUser;
  }
}

export default new Streams();
