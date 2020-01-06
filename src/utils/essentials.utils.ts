/**
 * Wraps some data in a timestamp.
 */
export function timestamp(data: any) {
  const now = new Date().toLocaleString('en-US');
  return `[${now}]: ${data}`;
}

/**
 * Prints to the console with a timestamp in dev mode.
 * @param data
 * @param bypass If it should ignore the node_env.
 */
export function debug(data: any, bypass = false) {
  if (process.env.NODE_ENV === 'development' || bypass) {
    console.log(timestamp(data)); // NOTE Keep
  }
}

/**
 * Or not to be? This verifies that the variable exists.
 */
export function toBe(variable: any) {
  if (typeof variable === 'undefined' || variable === null) {
    return false;
  }
  return true;
}

/**
 * Determines if an object has certain properties.
 * Throws on false by default.
 * @param props
 * @param data
 * @param throwError If it should throw an error on false.
 */
export function hasProps(
  props: string[],
  data: Object,
  throwError = true
): boolean {
  let info: string = 'undefined';
  const status = props.every(elem => {
    info = elem;
    return data.hasOwnProperty(elem);
  });

  if (!status) {
    if (throwError) {
      throw new Error(
        LocalError(info + ' is missing from the list of properties.')
      );
    }
  }

  return status;
}

export function LocalError(msg: string) {
  return '\x1b[31m' + msg + '\x1b[37m';
}
