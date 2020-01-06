import * as glob from 'glob';

const files = glob.sync('./**/*.event.[jt]s', { cwd: __dirname });

files.forEach((file: string) => {
  require(file);
});
