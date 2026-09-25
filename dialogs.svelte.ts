/* A question put to the person, answered before the page goes on: `await
   dialog.confirm(…)` or `dialog.alert(…)`, drawn by the one <Dialogs /> a product
   mounts in its frame. The browser's own confirm and alert wear the browser's
   chrome and none of the product's; DIDA and BABA had each written this store
   the same way, line for line. One question at a time is every case there is. */

export type DialogKind = 'confirm' | 'alert';

export interface DialogRequest {
	kind: DialogKind;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	/** the answer that does not come back, drawn as such */
	danger?: boolean;
	resolve: (value: boolean) => void;
}

class DialogStore {
	current = $state<DialogRequest | null>(null);

	// A question asked over an unanswered one settles the old one as a no, or
	// its `await` hangs for good: its resolver was the only thing holding it.
	#supersede() {
		const prev = this.current;
		if (prev) {
			this.current = null;
			prev.resolve(false);
		}
	}

	confirm(opts: {
		title: string;
		message: string;
		confirmLabel?: string;
		cancelLabel?: string;
		danger?: boolean;
	}): Promise<boolean> {
		this.#supersede();
		return new Promise((resolve) => {
			this.current = { kind: 'confirm', ...opts, resolve };
		});
	}

	alert(opts: { title: string; message: string; confirmLabel?: string }): Promise<void> {
		this.#supersede();
		return new Promise<void>((resolve) => {
			this.current = { kind: 'alert', ...opts, resolve: () => resolve() };
		});
	}

	/** Settles the open question; a second answer to the same one is nothing. */
	resolve(value: boolean) {
		const req = this.current;
		if (!req) return;
		this.current = null;
		req.resolve(value);
	}
}

export const dialog = new DialogStore();
