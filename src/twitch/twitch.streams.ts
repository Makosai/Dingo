import { HelixUser, HelixStream } from 'twitch';
import { loadData, updateDB } from '@utils/firebase.utils';
import { LocalError } from '@utils/errors.utils';
import TwitchAuth from './twitch.auth';
import TwitchWebhooks from './twitch.webhooks';
import { client } from '@discord/discord.main';
import { TextChannel, RichEmbed } from 'discord.js';
import { debug } from '@utils/essentials.utils';

interface ITwitchStreamsData {
  users: HelixUser[];
  channels: string[];
}

class TwitchStreams {
  users!: HelixUser[];
  channels!: string[];
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
  }

  async addUser(user: HelixUser) {
    this.users.push(user);

    return updateDB('twitch', 'streams', { users: this.users }).catch(err => {
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

    return updateDB('twitch', 'streams', { users: this.users }).catch(err => {
      throw new LocalError(
        'Failed to remove a user from the TwitchStreams.\n\n' + user
      );
    });
  }

  async subscribe(user: HelixUser) {
    TwitchWebhooks.subscriptions.set(
      user.id,
      await TwitchWebhooks.webhook.subscribeToStreamChanges(
        user.id,
        async stream => {
          if (stream !== undefined) {
            const { message, embed } = await TwitchStreams.broadcast(
              user,
              stream
            );

            this.channels.forEach(id => {
              const channel = client.channels.get(id) as TextChannel;

              channel.send(message, { embed });
            });
          }
        }
      )
    );
  }

  async addChannel(id: string) {
    if (this.channels.includes(id)) {
      throw new LocalError(
        'Failed to add the discord channel to TwitchStreams because it already exists.'
      );
    }

    this.channels.push(id);

    return updateDB('twitch', 'streams', { channels: this.channels }).catch(
      err => {
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
      err => {
        throw new LocalError(
          'Failed to remove a channel from the TwitchStreams.\n\n' + id
        );
      }
    );
  }

  static async broadcast(user: HelixUser, stream: HelixStream) {
    const url = `https://twitch.tv/${user.name}`;
    let message;
    
    if(user.name === 'makosai') {
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
