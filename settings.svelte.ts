/* A form of settings, as every module keeps one: what is stored, the draft
 * being edited over it, whether the two differ, and the one save that writes
 * the difference back.
 *
 * Only what changed is sent. The store validates everything it is handed, and a
 * form that sent every field made one unmounted directory a reason no other
 * setting could be saved either. */

import { json, request } from './http';
import { t } from './i18n.svelte';
import type { FieldSetting } from './SettingField.svelte';
import { toasts } from './toasts.svelte';

export type StoredSetting = FieldSetting & { group: string; value: string };

export class SettingsDraft<S extends StoredSetting = StoredSetting> {
	settings = $state<S[]>([]);
	draft = $state<Record<string, string>>({});
	saving = $state(false);
	dirty = $derived(this.settings.some((s) => this.#differs(s)));
	#url: string;

	constructor(url = '/api/settings') {
		this.#url = url;
	}

	/** a blank secret means "leave it as it is", which the store reads the same way */
	#differs(s: S): boolean {
		const value = this.draft[s.key];
		if (value === undefined) return false;
		return s.secret ? value !== '' : value !== s.value;
	}

	#fill(settings: S[]) {
		this.settings = settings;
		this.draft = Object.fromEntries(settings.map((s) => [s.key, s.value]));
	}

	of(group: string): S[] {
		return this.settings.filter((s) => s.group === group);
	}

	async load(): Promise<boolean> {
		const got = await request<S[]>(this.#url);
		if (got) this.#fill(got);
		return got !== null;
	}

	async save(): Promise<boolean> {
		const changes = Object.fromEntries(
			this.settings.filter((s) => this.#differs(s)).map((s) => [s.key, this.draft[s.key]])
		);
		this.saving = true;
		const got = await request<S[]>(this.#url, json(changes, 'PUT'), {
			on: { 400: (body) => this.#refused(body.detail) }
		});
		this.saving = false;
		if (!got) return false;
		this.#fill(got);
		toasts.success(t('settings.saved'));
		return true;
	}

	#refused(detail: unknown) {
		const { key, code } = (detail ?? {}) as { key?: string; code?: string };
		if (!key || !code) {
			toasts.error(t('common.requestFailed', { detail: String(detail) }));
			return;
		}
		const spec = this.settings.find((s) => s.key === key);
		toasts.error(
			t('settings.saveFailed', {
				field: t(`field.${spec?.label ?? key}`),
				reason: t(`settings.err.${code}`)
			})
		);
	}
}
