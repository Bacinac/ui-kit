import { describe, expect, it } from 'vitest';
import { i18n, registerModule, t } from './i18n.svelte';

describe('words the server hands over after the boot', () => {
	registerModule({ hr: { 'engine.own': 'Vlastiti' }, en: { 'engine.own': 'Own' } });

	it('are said beside the registered ones, and asking again replaces them', () => {
		i18n.extend({ hr: { 'engine.added': 'Dodani' }, en: { 'engine.added': 'Added' } });
		expect(t('engine.added')).toBe('Dodani');
		expect(t('engine.own')).toBe('Vlastiti');
		i18n.extend({ hr: {}, en: {} });
		expect(t('engine.added')).toBe('engine.added');
	});

	it('may not say a registered word again', () => {
		expect(() => i18n.extend({ hr: { 'engine.own': 'Drugi' }, en: {} })).toThrow(/already said/);
		expect(t('engine.own')).toBe('Vlastiti');
	});
});
