import { MediaQuery } from 'svelte/reactivity';

/** Below this width the frame folds its sidebar into a bar along the bottom,
 *  which has room for the sections and none for the pages under them. Frame's
 *  own stylesheet says the same width; a page asks here. */
export const narrow = new MediaQuery('(max-width: 767.98px)');
