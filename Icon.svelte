<script lang="ts">
	// The small marks that say what a thing is.
	//
	// Solid silhouettes in one colour, tinted by whatever is drawing them — the
	// language the skin this surface is modelled on uses for every icon it has:
	// a white glyph with alpha, coloured at draw time by the state it is in.
	// Outlines were the opposite of that. At fourteen pixels a stroked drawing
	// is a grey smudge, and ten feet away it is nothing at all.
	//
	// Drawn here rather than fetched: a handful of paths costs nothing, and an
	// icon that arrives over the network is an icon that is missing on the one
	// screen where the network is the thing being waited on.

	let { name, size = 14 }: { name: string; size?: number } = $props();

	const MARKS: Record<string, string[]> = {
		// a television, for how big the picture is
		screen: [
			'M2.5 4h19A1.5 1.5 0 0 1 23 5.5v10a1.5 1.5 0 0 1-1.5 1.5h-19A1.5 1.5 0 0 1 1 15.5v-10A1.5 1.5 0 0 1 2.5 4Z',
			'M8 19h8a1 1 0 0 1 0 2H8a1 1 0 0 1 0-2Z'
		],
		// a photograph: a frame with a horizon and a sun in it
		photo: [
			'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1.6 11.4h14.8l-4.6-5.9-3.4 4.2-2.2-2.5-4.6 4.2ZM7.8 8.1a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z'
		],
		// two heads, for who is in them
		people: [
			'M9 4a3.2 3.2 0 1 1 0 6.4A3.2 3.2 0 0 1 9 4Zm0 7.8c3.3 0 6 1.5 6 3.4V19H3v-3.8c0-1.9 2.7-3.4 6-3.4Z',
			'M16.6 5.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6Zm.6 7c2.4.2 4.3 1.5 4.3 3.1V19h-4.8v-3.8c0-1.1-.4-2.1-1.1-2.9.5-.1 1-.1 1.6-.1Z'
		],
		// a pin, for where they were taken
		pin: [
			'M12 2c3.9 0 7 3.1 7 7 0 5.1-7 13-7 13S5 14.1 5 9c0-3.9 3.1-7 7-7Zm0 4.4A2.6 2.6 0 1 0 12 11.6 2.6 2.6 0 0 0 12 6.4Z'
		],
		// a strip of film, for what it is encoded with
		film: [
			'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm1.2 2.2v2.1h2.1V5.2H5.2Zm0 5.7v2.2h2.1v-2.2H5.2Zm0 5.8v2.1h2.1v-2.1H5.2Zm11.5-11.5v2.1h2.1V5.2h-2.1Zm0 5.7v2.2h2.1v-2.2h-2.1Zm0 5.8v2.1h2.1v-2.1h-2.1Z'
		],
		// a speaker, for a sound track
		sound: [
			'M11.3 3.6a1 1 0 0 1 1.7.7v15.4a1 1 0 0 1-1.7.7L6.6 15.8H3.5A1.5 1.5 0 0 1 2 14.3V9.7a1.5 1.5 0 0 1 1.5-1.5h3.1l4.7-4.6Z',
			'M16.2 8.3a1.2 1.2 0 0 1 1.7 0 5.9 5.9 0 0 1 0 7.4 1.2 1.2 0 1 1-1.8-1.5 3.5 3.5 0 0 0 0-4.4 1.2 1.2 0 0 1 .1-1.5Z'
		],
		// a line of words under a picture, for a subtitle
		text: [
			'M3 4h18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm2.8 10.6v2.1h7.1v-2.1H5.8Zm9.3 0v2.1h3.1v-2.1h-3.1Z'
		],
		// a drive, for how much room it takes
		disk: [
			'M4 3h11.6L21 8.4V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm3.4 1.6v4.9h7.2V4.6H7.4Zm-.9 8.6V20h11v-6.8h-11Z'
		],
		// a box, for the container it is wrapped in
		box: ['M12 1.8 21.5 7v10L12 22.2 2.5 17V7L12 1.8Z'],
		// four tiles: everything else the box has
		grid: [
			'M3 3h8v8H3V3Z',
			'M13 3h8v8h-8V3Z',
			'M3 13h8v8H3v-8Z',
			'M13 13h8v8h-8v-8Z'
		],
		// a building, for whoever made it
		studio: [
			'M3.6 21V5.9a1 1 0 0 1 .7-1l5.6-1.8a1 1 0 0 1 1.3 1V21H3.6Zm2.5-12.3v2.1h2.4V8.7H6.1Zm0 4.4v2.1h2.4v-2.1H6.1Zm0 4.4V19h2.4v-1.5H6.1Z',
			'M12.6 21V9.6h7.2a1 1 0 0 1 1 1V21h-8.2Zm2.4-8.3v2.1h3.1v-2.1H15Zm0 4.4V19h3.1v-1.9H15Z'
		],
		// two notes, for a shelf of music
		note: [
			'M20.4 3.5a1 1 0 0 0-1.2-1L9.6 4.6a1 1 0 0 0-.8 1v9.7h2.1V8.3l7.4-1.6v5.8h2.1V3.5Z',
			'M6.4 14.2a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Z',
			'M17.6 12.1a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Z'
		],
		// a record, for how many of them there are
		disc: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 7.9a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2Z'],
		// a clock, for how long a shelf would take to watch
		clock: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 4.4v5.9l3.6 2.1-1 1.8-4.6-2.7V6.4H13Z'],
		// a list, for how many episodes are behind the series
		list: [
			'M3 5.2h3v3H3v-3Zm5.2.4H21v2.2H8.2V5.6ZM3 10.5h3v3H3v-3Zm5.2.4H21v2.2H8.2v-2.2ZM3 15.8h3v3H3v-3Zm5.2.4H21v2.2H8.2v-2.2Z'
		],
		// a play mark, for what was taken off the web
		clip: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-2 5.4 7 4.6-7 4.6V7.4Z'],
		// a calendar, for the years a shelf runs between
		years: [
			'M6.2 2h2.1v2h7.4V2h2.1v2h1.7A1.5 1.5 0 0 1 21 5.5v14a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5v-14A1.5 1.5 0 0 1 4.5 4h1.7V2ZM5.1 9.9v9h13.8v-9H5.1Zm2.2 2.2h3.2v3H7.3v-3Z'
		]
	};
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="currentColor"
	fill-rule="evenodd"
	aria-hidden="true"
>
	{#each MARKS[name] ?? [] as d (d)}
		<path {d} />
	{/each}
</svg>
