import { itemList } from './itemList.js';

export const itemIdByKey: Readonly<Record<string, number>> = Object.freeze(
	Object.values(itemList).reduce(
		(map, item) => {
			map[item.name] = item.itemId;
			if (item.display) {
				map[item.display] = item.itemId;
			}
			return map;
		},
		{} as Record<string, number>
	)
);

export function resolveItemIdFromKey(key: string): number | null {
	const numericId = Number(key);
	if (!Number.isNaN(numericId)) {
		return numericId;
	}
	return itemIdByKey[key] ?? null;
}
