import { Message } from 'discord.js';

class Roles {
  handler(msg: Message, cmd: string, params?: string[]) {
    switch (cmd) {
      case 'set':
        // Verify that the user provided a role.
        if (params === undefined || params.length <= 0) {
          msg.channel.send(`A role is required \`!role set <role_name>\``);
          return;
        }

        msg.channel.send(`Set ${params?.join()}`);
    }
  }
}

export default new Roles();