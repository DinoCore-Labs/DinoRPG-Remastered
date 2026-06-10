export const BANK_TREASURE_TICKET_GOLD_VALUE = 1000;

export const BANK_EXCHANGE_RATE_MIN_BPS = 9000;
export const BANK_EXCHANGE_RATE_MAX_BPS = 12000;
export const BANK_EXCHANGE_RATE_SCALE = 10000;

export const BANK_EXCHANGE_RATE_SECRET_KEY = 'bank.treasureTicketExchangeRateBps';
export const BANK_EXCHANGE_RATE_JOB_KEY = 'bank-refresh-treasure-ticket-rate';

export function generateBankExchangeRateBps() {
	return (
		Math.floor(Math.random() * (BANK_EXCHANGE_RATE_MAX_BPS - BANK_EXCHANGE_RATE_MIN_BPS + 1)) +
		BANK_EXCHANGE_RATE_MIN_BPS
	);
}

export function getBankExchangeRateFromBps(rateBps: number) {
	return rateBps / BANK_EXCHANGE_RATE_SCALE;
}

export function getTreasureTicketGoldValue(quantity: number, rateBps: number) {
	return Math.round((quantity * BANK_TREASURE_TICKET_GOLD_VALUE * rateBps) / BANK_EXCHANGE_RATE_SCALE);
}

export const BANK_SAVING_RATE_SCALE = 10000;

export const BANK_SAVING_PLANS = [
	{
		durationDays: 7,
		interestRateBps: 2500
	},
	{
		durationDays: 14,
		interestRateBps: 4000
	},
	{
		durationDays: 21,
		interestRateBps: 5000
	},
	{
		durationDays: 30,
		interestRateBps: 8000
	}
] as const;

export function getBankSavingPlan(durationDays: number) {
	return BANK_SAVING_PLANS.find(plan => plan.durationDays === durationDays);
}

export function getBankSavingInterestRateFromBps(interestRateBps: number) {
	return interestRateBps / BANK_SAVING_RATE_SCALE;
}

export function getBankSavingInterestGold(amount: number, interestRateBps: number) {
	return Math.round((amount * interestRateBps) / BANK_SAVING_RATE_SCALE);
}

export function getBankSavingTotalGold(amount: number, interestRateBps: number) {
	return amount + getBankSavingInterestGold(amount, interestRateBps);
}
