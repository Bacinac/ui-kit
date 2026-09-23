<script lang="ts">
	// A list of short values, edited as the list it is. Storing them as one
	// comma-separated line is the store's business; making somebody read and
	// punctuate that line is not.

	let {
		id,
		label,
		value = $bindable(),
		placeholder = ''
	}: {
		id: string;
		label: string;
		/** the stored form: values joined by commas */
		value: string;
		placeholder?: string;
	} = $props();

	let entry = $state('');

	let items = $derived(
		value.split(',').map((v) => v.trim()).filter(Boolean)
	);

	function commit(next: string[]) {
		value = next.join(',');
	}

	function add() {
		const fresh = entry.trim();
		if (fresh && !items.includes(fresh)) commit([...items, fresh]);
		entry = '';
	}

	function drop(item: string) {
		commit(items.filter((v) => v !== item));
	}

	function key(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ',') {
			event.preventDefault();
			add();
		} else if (event.key === 'Backspace' && !entry && items.length) {
			commit(items.slice(0, -1));
		}
	}
</script>

<div class="chips">
	<label for={id}>{label}</label>
	<div class="box">
		{#each items as item (item)}
			<span class="chip">
				{item}
				<button type="button" onclick={() => drop(item)} aria-label={item}>×</button>
			</span>
		{/each}
		<input {id} bind:value={entry} onkeydown={key} onblur={add} {placeholder} />
	</div>
</div>

<style>
	.chips {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		min-width: 0;
	}
	label {
		font-size: var(--fs-s);
		color: var(--muted);
	}
	.box {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem;
		padding: 0.3rem 0.4rem;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: var(--surface);
	}
	.box:focus-within {
		border-color: var(--accent);
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.15rem 0.2rem 0.15rem 0.55rem;
		border-radius: 999px;
		border: 1px solid var(--border);
		font-size: var(--fs-m);
	}
	.chip button {
		display: grid;
		place-items: center;
		width: 1.1rem;
		height: 1.1rem;
		border: none;
		border-radius: 999px;
		background: none;
		color: var(--muted);
		font-size: var(--fs-m);
		line-height: 1;
		cursor: pointer;
	}
	.chip button:hover {
		color: var(--warn);
	}
	.box input {
		flex: 1;
		min-width: 6rem;
		padding: 0.15rem 0.25rem;
		border: none;
		background: none;
	}
	.box input:focus {
		outline: none;
	}
</style>
