import '@eternaltwin/dinorpg_animations';

/** Missing named smonster export from @eternaltwin/dinorpg_animations/src/sdino.d.ts. */
declare module '@eternaltwin/dinorpg_animations' {
	export class smonster {
		constructor(data: { type: string; autoUpdate?: boolean; pflag?: boolean; shadow?: boolean });
	}
}
