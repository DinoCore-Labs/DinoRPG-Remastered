const images = import.meta.glob('../assets/**/*.{webp,png,gif,jpg,jpeg,svg}', {
	eager: true,
	query: '?url',
	import: 'default'
}) as Record<string, string>;

export function getImgURL(path: string, imgName: string, pixel?: boolean, animated?: boolean): string {
	const ext = animated ? 'gif' : pixel ? 'png' : 'webp';
	const key = `../assets/${path}/${imgName}.${ext}`.replace(/\/+/g, '/');

	const image = images[key];

	if (!image) {
		console.warn(`[getImgURL] Missing image: ${key}`);
		return '';
	}

	return image;
}
