import { LocalError } from '@utils/essentials.utils';

class Streams {
  constructor() {}

  loadStreams() {}

  /**
   *
   * @param cmd The streams-specific command.
   * @param params Params, if any, that go with the cmd.
   */
  handler(cmd: string, params?: string[]) {
    switch (cmd) {
      case 'list':
        this.getStreams();
        return;
    }

    if (params === undefined) {
      return;
    }

    switch (cmd) {
      case 'add':
        this.addStream(params.join(' '));
        return;

      case 'remove':
        this.removeStream(params.join(' '));
        return;

      case 'update':
        if (params.length > 2) {
          throw new Error(
            LocalError(
              'Failed to update the stream. Make sure to wrap the names in quotes or apostrophes.'
            )
          );
        }
        this.updateStream(params[0], params[1]);
        return;
    }
  }

  private addStream(user: string) {}

  private getStreams() {}

  private updateStream(user: string, newUser: string) {}

  private removeStream(user: string) {}
}

export default new Streams();
