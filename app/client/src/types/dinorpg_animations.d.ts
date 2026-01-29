declare module '@eternaltwin/dinorpg_animations' {
	export class dino {
		constructor(options: {
			data: string;
			flip?: boolean;
			damages?: number;
			dark?: boolean;
			scale?: number;
			shadow?: boolean;
			congel?: boolean;
		});

		toRawImage(callback: (base64: string) => void, width?: number, height?: number): void;
	}
}
