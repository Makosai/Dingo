import { db } from '@firebase/firebase.main';
import { Role } from 'discord.js';

interface ICommand extends IRawCommand {
  name: string;
}

interface IRawCommand {
  description: string;
  roles: Role[];
}

interface ICommandsConfig {
  triggers: string[];
}

class CommandsConfig {
  config: ICommandsConfig = {
    triggers: ['!', '.', '?']
  };

  commands: ICommand[] = [
    {
      name: 'help',
      description: 'Display this help dialogue.',
      roles: []
    }
  ];

  constructor() {
    Promise.all([this.loadConfig(), this.loadCommands()]);
  }

  async loadConfig() {
    const doc = await db
      .collection('discord')
      .doc('configCommands')
      .get();

    if (doc.exists) {
      this.config = doc.data() as ICommandsConfig;
    } else {
      await db
        .collection('discord')
        .doc('configCommands')
        .create({ triggers: this.config.triggers });
    }
  }

  async loadCommands() {
    const doc = await db
      .collection('discord')
      .doc('commands')
      .get();

    if (!doc.exists) {
      const defaultCommands: any = {};

      this.commands.forEach(cmd => {
        defaultCommands[cmd.name] = {
          description: cmd.description,
          roles: cmd.roles
        };
      });

      db.collection('discord')
        .doc('commands')
        .create(defaultCommands);
    } else {
      const data = doc.data() as { [name: string]: IRawCommand };

      this.commands = Object.keys(data).map(
        (key): ICommand => {
          const info = data[key];

          return {
            name: key,
            description: info.description,
            roles: info.roles
          };
        }
      );
    }
  }

  /**
   *
   * @param raw If it should return in array format.
   */
  async getCommands(raw = false) {
    if (raw) return this.commands;

    return this.commands
      .map(cmd => {
        return `[${cmd.name}]
; ${cmd.description}
`;
      })
      .join('');
  }
}

export default new CommandsConfig();
