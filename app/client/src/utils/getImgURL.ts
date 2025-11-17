export function getImgURL(path: string, imgName: string, pixel?: boolean, animated?: boolean): string {
	const ext = animated ? 'gif' : pixel ? 'png' : 'webp';
	return new URL(`/src/assets/${path}/${imgName}.${ext}`, import.meta.url).toString();
}
