export type EquipItemResponse = {
	items: DinozItems[];
	refreshDinoz: boolean;
};

export interface DinozItems {
	itemId: number;
}
