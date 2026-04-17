import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';
import type { UserStore } from '@dinorpg/core/models/store/userStore.js';
import type { UserData } from '@dinorpg/core/models/user/userData.js';
import type { UserReward } from '@dinorpg/core/models/user/userReward.js';
import type { UserRole } from '@dinorpg/core/models/user/userRole.js';
import { defineStore } from 'pinia';

export const userStore = defineStore('userStore', {
	state: (): UserStore => ({
		id: null,
		name: null,
		role: null as UserRole | null,
		gold: 0,
		treasureTicket: 0,
		priest: false,
		shopKeeper: false,
		sortOption: 'default',
		rewards: []
	}),
	getters: {
		isLogged: state => !!state.id,
		getUserName: state => state.name,
		isAdmin: state => state.role === 'ADMIN' || state.role === 'SUPER_ADMIN',
		isModerator: state => state.role === 'MODERATOR' || state.role === 'ADMIN' || state.role === 'SUPER_ADMIN',
		isPriest: (state: UserStore) => state.priest,
		isShopkeeper: (state: UserStore) => state.shopKeeper,
		getSortOption: (state: UserStore) => state.sortOption,
		getRewards: (state: UserStore) => state.rewards,
		hasReward: (state: UserStore) => {
			return (rewardId: number) => state.rewards.some(reward => reward.rewardId === rewardId);
		},
		canUseMessaging(): boolean {
			return this.hasReward(Reward.MSG);
		}
	},
	actions: {
		setUser(data: UserData) {
			this.id = data.id;
			this.name = data.name;
			this.role = data.role;
			this.gold = data.gold;
			this.treasureTicket = data.treasureTicket;
		},
		setGold(gold: number) {
			this.gold = gold;
		},
		setTicket(treasureTicket: number) {
			this.treasureTicket = treasureTicket;
		},
		setPriest(priest: boolean): void {
			this.priest = priest;
		},
		setShopkeeper(shopKeeper: boolean): void {
			this.shopKeeper = shopKeeper;
		},
		setSortOption(sortOption: string): void {
			this.sortOption = sortOption;
		},
		setRewards(rewards: UserReward[]) {
			this.rewards = rewards;
		},
		addReward(rewardId: number) {
			if (!this.rewards.some(reward => reward.rewardId === rewardId)) {
				this.rewards.push({ rewardId });
			}
		},
		clearUser() {
			this.id = null;
			this.name = null;
			this.role = null;
			this.gold = 0;
			this.treasureTicket = 0;
			this.priest = false;
			this.shopKeeper = false;
			this.sortOption = 'default';
			this.rewards = [];
		}
	},
	persist: {
		storage: window.sessionStorage
	}
});
