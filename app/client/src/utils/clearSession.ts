import { clanStore } from '../store/clanStore';
import { dinozStore } from '../store/dinozStore';
import { dojoStore } from '../store/dojoStore';
import { userStore } from '../store/userStore';

const PERSISTED_STORE_KEYS = ['userStore', 'dinozStore', 'dojoStore', 'clanStore'];

export function clearClientSession() {
	const uStore = userStore();
	const dStore = dinozStore();
	const doStore = dojoStore();
	const cStore = clanStore();
	uStore.clearUser();
	dStore.clearDinoz();
	doStore.$reset();
	cStore.$reset();
	for (const key of PERSISTED_STORE_KEYS) {
		window.sessionStorage.removeItem(key);
		window.localStorage.removeItem(key);
	}
}

let logoutInProgress = false;

export function startLogoutSession() {
	logoutInProgress = true;
}

export function stopLogoutSession() {
	logoutInProgress = false;
}

export function isLogoutSessionInProgress() {
	return logoutInProgress;
}
