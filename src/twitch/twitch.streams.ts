import { HelixUser, HelixStream } from 'twitch';
import { loadData, updateDB } from '@utils/firebase.utils';
import { LocalError } from '@utils/errors.utils';
import TwitchAuth from './twitch.auth';
import TwitchWebhooks from './twitch.webhooks';
import { client } from '@discord/discord.main';
import { TextChannel, RichEmbed } from 'discord.js';
import TwitchPubSub from './twitch.pubsub';

interface ITwitchStreamsData {
  users: HelixUser[];
  channels: string[];
}

interface IFundsData {
  watching: boolean;
  value: number;
}

class TwitchStreams {
  users!: HelixUser[];
  channels!: string[];
  funds!: { [key: string]: IFundsData };
  sync: Promise<any>;

  constructor() {
    this.sync = Promise.all([this.loadStreams()]);
  }

  async loadStreams() {
    const users: HelixUser[] = [];
    const channels: string[] = [];

    const data: ITwitchStreamsData = { users, channels };

    const res = await loadData('twitch', 'streams', data);
    this.users = await TwitchAuth.twitchCredentials.helix.users.getUsersByIds(
      res.users.map((user: any) => {
        return user._data.id;
      })
    );

    this.channels = res.channels;

    this.channels.forEach(async (channel) => {
      this.funds[channel] = await loadData(`twitch/data/${channel}`, 'funds', {
        watching: false,
        value: 0
      });
    });
  }

  /**
   * Toggles watching for a channel's funds.
   * @param channel
   */
  async toggleFunds(channel: string) {
    if (this.funds[channel] === undefined) {
      throw new Error(
        `Can't toggle the funds on a channel that doesn't exist.`
      );
    }

    await updateDB(`twitch/data/${channel}`, 'funds', {
      watching: !this.funds[channel].watching
    });
  }

  /**
   * Adds (or subtracts with a negative number) a number to the funds value for a channel.
   * @param channel
   * @param value
   */
  async addFundsValue(channel: string, value: number) {
    if (this.funds[channel] === undefined) {
      throw new Error(
        `Can't update the funds value on a channel that doesn't exist.`
      );
    }

    await updateDB(`twitch/data/${channel}`, 'funds', {
      value: this.funds[channel].value + value
    });
  }

  async addUser(user: HelixUser) {
    this.users.push(user);

    this.subscribe(user);

    return updateDB('twitch', 'streams', { users: this.users }).catch((err) => {
      throw new LocalError(
        'Failed to add a user to the TwitchStreams.\n\n' + user
      );
    });
  }

  async removeUser(user: HelixUser) {
    const foundUser = this.users.indexOf(user);

    if (foundUser === undefined) {
      throw new LocalError(
        `Failed to remove ${user} from the stream list because they don't exist.`
      );
    }

    this.users.splice(foundUser, 1);

    this.unsubscribe(user.id);

    return updateDB('twitch', 'streams', { users: this.users }).catch((err) => {
      throw new LocalError(
        'Failed to remove a user from the TwitchStreams.\n\n' + user
      );
    });
  }

  async subscribe(user: HelixUser) {
    if (
      TwitchWebhooks.subscriptions.has(user.id) &&
      TwitchWebhooks.subscriptions.get(user.id) !== undefined
    ) {
      TwitchWebhooks.subscriptions.get(user.id)?.start();
    } else {
      TwitchWebhooks.subscriptions.set(
        user.id,
        await TwitchWebhooks.webhook.subscribeToStreamChanges(
          user.id,
          async (stream) => {
            if (stream !== undefined) {
              const { message, embed } = await TwitchStreams.broadcast(
                user,
                stream
              );

              this.channels.forEach((id) => {
                const channel = client.channels.get(id) as TextChannel;

                channel.send(message, { embed });
              });
            }
          }
        )
      );
    }

    TwitchPubSub.subscriptions.set(user.id, {
      subscription: await TwitchPubSub.pubsub.onSubscription(user.id, (res) => {
        if (this.funds[user.id] !== undefined && this.funds[user.id].watching) {
          this.addFundsValue(user.id, 4.99);
        }
      }),
      bits: await TwitchPubSub.pubsub.onBits(user.id, (res) => {
        if (this.funds[user.id] !== undefined && this.funds[user.id].watching) {
          this.addFundsValue(user.id, res.bits * (1.4 / 100));
        }
      })
    });
  }

  async unsubscribe(user: string) {
    if (TwitchWebhooks.subscriptions.has(user)) {
      await TwitchWebhooks.subscriptions.get(user)?.stop();
    }

    if (TwitchPubSub.subscriptions.has(user)) {
      TwitchPubSub.subscriptions.get(user)?.subscription.remove();
      TwitchPubSub.subscriptions.get(user)?.bits.remove();
    }

    return true;
  }

  async addChannel(id: string) {
    if (this.channels.includes(id)) {
      throw new LocalError(
        'Failed to add the discord channel to TwitchStreams because it already exists.'
      );
    }

    this.channels.push(id);

    return updateDB('twitch', 'streams', { channels: this.channels }).catch(
      (err) => {
        throw new LocalError(
          'Failed to remove a user from the TwitchStreams.\n\n' + id
        );
      }
    );
  }

  async removeChannel(id: string) {
    if (!this.channels.includes(id)) {
      throw new LocalError(
        'Failed to remove the discord channel from TwitchStreams because it does not exist.'
      );
    }

    this.channels.splice(this.channels.indexOf(id), 1);

    return updateDB('twitch', 'streams', { channels: this.channels }).catch(
      (err) => {
        throw new LocalError(
          'Failed to remove a channel from the TwitchStreams.\n\n' + id
        );
      }
    );
  }

  static async broadcast(user: HelixUser, stream: HelixStream) {
    const url = `https://twitch.tv/${user.name}`;
    let message;

    // TODO: Make this changeable.
    if (user.name === 'makosai') {
      message = `Hey, <@&694774892792643664> **${user.displayName}** is now live!`;
    } else {
      message = `**${user.displayName}** is now live!`;
    }

    if (stream === null) {
      throw new LocalError(
        `Failed to broadcast ${user.name}'s stream. Stream is null.`
      );
    }

    const game = await stream.getGame();

    let embed = new RichEmbed();

    // Author
    embed = embed.setAuthor(user.displayName, user.profilePictureUrl, url);

    // Game & Viewers
    embed = embed.addField('Game', game !== null ? game.name : '???', true);
    embed = embed.addField('Viewers', stream.viewers, true);

    embed = embed.setColor('6441A4');
    embed = embed.setTitle(`${stream.title}`);
    embed = embed.setURL(url);
    embed = embed.setImage(
      game !== null ? game.boxArtUrl : stream.thumbnailUrl
    );

    return { message, embed };
  }
}

export default new TwitchStreams();
