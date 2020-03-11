import { Message, TextChannel, Role } from 'discord.js';
import { updateDB, loadData } from '@utils/firebase.utils';
import { LocalError } from '@utils/errors.utils';

interface RoleEntry {
  roles: {
    id: string;
    name: string;
  }[];
}

/**
 * Roles that Discord users can use to give themselves.
 */
class Roles {
  settings!: RoleEntry; // An array of role IDs and the names to go with them.

  constructor() {
    this.loadRoles();
  }

  async loadRoles() {
    const data: RoleEntry = { roles: [] };
    this.settings = await loadData('data', 'roles', data);
  }

  async updateRegisteredRoles() {
    updateDB('data', 'roles', { roles: this.settings.roles }).catch(err => {
      throw new LocalError('Failed to update the roles command.\n\n');
    });
  }

  addRegisteredRole(role: Role) {
    const { id, name } = role;
    this.settings.roles.push({ id, name });

    return this.updateRegisteredRoles();
  }

  async removeRegisteredRole(roleName: string) {
    let foundIndex = this.settings.roles.findIndex(
      elem => elem.name === roleName
    );

    if (foundIndex === -1) {
      throw new LocalError(
        `Failed to find a role that matched the name ${roleName}.`
      );
    }

    this.settings.roles.splice(foundIndex);

    return this.updateRegisteredRoles();
  }

  async handler(msg: Message, cmd: string, params?: string[]) {
    const channel = msg.channel as TextChannel;

    let roleName: string;

    switch (cmd) {
      case 'set':
        // Verify that the user provided a role.
        if (params === undefined || params.length <= 0) {
          channel.send(`A role is required \`!role set <role_name>\``);
          return;
        }

        roleName = params.join(' ');

        const foundRole = this.settings.roles.find(
          elem => elem.name === roleName
        );

        if (foundRole === undefined) {
          const role = msg.guild.roles.find(elem => elem.name === roleName);

          if (role === null || role === undefined) {
            channel.send(
              `Couldn't find ${roleName} in this Discord server. Therefore it wasn't added.`
            );
            return;
          }

          this.addRegisteredRole(role)
            .then(() => {
              channel.send(
                `Added ${roleName} to the list of registered roles.`
              );
            })
            .catch(() => {
              channel.send(
                `Failed to add ${roleName} to the list of registered roles.`
              );
            });

          return;
        }

        this.removeRegisteredRole(roleName)
          .then(() => {
            channel.send(
              `Removed ${roleName} from the list of registered roles.`
            );
          })
          .catch(() => {
            channel.send(
              `Failed to remove ${roleName} from the list of registered roles.`
            );
          });

        return;

      default:
        if (params === undefined) {
          params = [];
        }

        roleName = [cmd, ...params].join(' ');

        const registeredRole = this.settings.roles.find(
          elem => elem.name === roleName
        );

        if (registeredRole === undefined) {
          const reports = [
            "I'm calling the cops!",
            "You're going to e-jail.",
            'Stop hacking.',
            'Behave.',
            "Please don't abuse my powers."
          ];

          channel.send(
            `${roleName} doesn't seem to be a registered role. ${
              reports[Math.floor(Math.random() * reports.length)]
            }`
          );

          return;
        }

        const role = msg.guild.roles.get(registeredRole.id);

        if (role === undefined) {
          channel.send(
            `${roleName} doesn't seem to exist. Maybe it was removed?`
          );
          
          return;
        }

        if (msg.member.roles.has(role.id)) {
          msg.member.removeRole(role).then(() => {
            channel.send(`Removed ${roleName} from you, ${msg.author.toString()}.`);
          });
        } else {
          msg.member.addRole(role).then(() => {
            channel.send(`I have given you the ${roleName}, ${msg.author.toString()}.`);
          });
        }

        return;
    }
  }
}

export default new Roles();
