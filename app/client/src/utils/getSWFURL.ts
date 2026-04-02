export function getSWFURL(path: string, imgName: string): string {
	return new URL(`/src/assets/${path}/${imgName}.swf`, import.meta.url).toString();
}
