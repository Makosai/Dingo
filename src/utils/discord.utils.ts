interface String {
  toParams(variable: string): string[]
}

/**
 * Converts a string of text to parameters by seperating it via quotations, apostrophes, or spaces.
* @param variable The string to convert to a param.
 */
String.prototype.toParams = function (variable: string) {
  const PARAM_REGEX = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  let match = null;
  const parts = [];

  while (match = PARAM_REGEX.exec(variable)) {
    parts.push(match[1] || match[2] || match[0]);
  }

  return parts;
};
