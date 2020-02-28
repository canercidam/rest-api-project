import { escape } from 'mysql';

/**
 * Returns limit or default limit by checking against hard limit.
 * @param defaultLimit - default limit for this limit param
 * @param hardLimit - hard limit for this limit param
 * @param limit - limit param itself
 */
export function makeLimit(defaultLimit: number, hardLimit: number, limit?: number): number {
  if (limit !== undefined) {
    return (limit > hardLimit ? hardLimit : limit);
  }
  return (defaultLimit > hardLimit ? hardLimit : defaultLimit);
}

const ignoreEscape = [
  'NULL',
  'ASC',
  'DESC',
];

/**
 * For using custom query format e.g. :param
 * @param pool - connection pool object
 * @param query - query string
 * @param values - params
 */
export function queryFormat(query: string, values: any) {
  if (!values) return query;

  return query.replace(/:(\w+)/g, (txt, key) => {
    const value = values[key];
    if (value !== undefined) {
      return ignoreEscape.includes(value) ? value : escape(value);
    }
    return txt;
  });
}
