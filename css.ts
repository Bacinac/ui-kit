/** An address as a CSS url(): quoted, with what would end the string escaped,
 *  so a parenthesis or a quote in somebody's image address cannot end the
 *  declaration early. */
export function cssUrl(address: string): string {
	return `url("${address.replace(/[\\"]/g, '\\$&').replace(/[\n\r\f]/g, (c) => `\\${c.charCodeAt(0).toString(16)} `)}")`;
}
