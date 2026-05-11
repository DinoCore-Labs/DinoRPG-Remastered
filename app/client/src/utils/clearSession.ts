import { dinozStore } from '../store/dinozStore';
import { userStore } from '../store/userStore';

const SESSION_STORAGE_KEYS = ['userStore', 'dinozStore'];

export function clearClientSession() {
	const uStore = userStore();
	const dStore = dinozStore();
	uStore.clearUser();
	dStore.clearDinoz();
	for (const key of SESSION_STORAGE_KEYS) {
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
