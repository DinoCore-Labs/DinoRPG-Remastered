import { ItemFiche } from './itemFiche.js';
import { Item, itemList } from './itemList.js';

export function getItemFiche(itemId: number | Item | null | undefined): ItemFiche | undefined {
	if (itemId == null) return undefined;

	return (itemList as unknown as Record<number, ItemFiche>)[itemId];
}

export function hasItemFiche(itemId: number | Item | null | undefined): itemId is number | Item {
	if (itemId == null) return false;
	return getItemFiche(itemId) != null;
}
