export type ToastKind = 'success' | 'error' | 'info';
export type Toast = { id: number; kind: ToastKind; text: string };

let nextId = 1;

class ToastStore {
	toasts = $state<Toast[]>([]);

	show(kind: ToastKind, text: string, timeoutMs = 4500) {
		const id = nextId++;
		this.toasts = [...this.toasts, { id, kind, text }];
		setTimeout(() => this.dismiss(id), timeoutMs);
	}

	success(text: string) {
		this.show('success', text);
	}

	error(text: string) {
		this.show('error', text, 8000);
	}

	info(text: string) {
		this.show('info', text);
	}

	dismiss(id: number) {
		this.toasts = this.toasts.filter((t) => t.id !== id);
	}
}

export const toasts = new ToastStore();
