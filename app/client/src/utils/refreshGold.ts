import { UserService } from '../services';
import { userStore } from '../store/userStore';

export const refreshGold = async () => {
	const me = await UserService.me();
	userStore().setGold(+me.gold);
};

export const refreshTreasureTicket = async () => {
	const me = await UserService.me();
	userStore().setTicket(+me.treasureTicket);
};
