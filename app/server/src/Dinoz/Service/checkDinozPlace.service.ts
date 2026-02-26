import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { ShopType } from '@dinorpg/core/models/enums/ShopType.js';
import { ShopFiche } from '@dinorpg/core/models/shop/shopFiche.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { Dinoz, DinozStatus } from '../../../../prisma/index.js';
// Check if player can access the shop
// The check is done for the shops that are not accessible from anywhere (i.e does not apply to the flying shop)
export function checkDinozPlace(
	theShop: ShopFiche,
	player: {
		dinoz: (Pick<Dinoz, 'placeId'> & {
			status: Pick<DinozStatus, 'statusId'>[];
		})[];
	},
	shopId: number
) {
	if (theShop.placeId !== PlaceEnum.ANYWHERE) {
		// For cursed shops, the player needs a non frozen, non sacrificed dinoz with the curse status at the location of the shop
		if (theShop.type == ShopType.CURSED) {
			const hasCursedDinozAtShop = player.dinoz.some(
				dinoz =>
					dinoz.status.some(status => status.statusId === DinozStatusId.CURSED) && dinoz.placeId === theShop.placeId
			);
			if (!hasCursedDinozAtShop) {
				throw new ExpectedError(`You need a cursed dinoz at the location of the shop to access it`);
			}
		} else {
			// Check at least one dinoz that is not frozen or sacrificed is at the location of the shop
			if (!player.dinoz.some(dinoz => dinoz.placeId === theShop.placeId)) {
				throw new ExpectedError(`You don't have any dinoz at the shop's location ${shopId}`);
			}
		}
	}
}
