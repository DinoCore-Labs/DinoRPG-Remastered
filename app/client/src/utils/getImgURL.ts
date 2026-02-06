export function getImgURL(path: string, imgName: string, pixel?: boolean, animated?: boolean): string {
	const ext = animated ? 'gif' : pixel ? 'png' : 'webp';
	const normalizedPath = `/src/assets/${path}/${imgName}.${ext}`.replace(/\/+/g, '/');
	return new URL(normalizedPath, import.meta.url).toString();
}
