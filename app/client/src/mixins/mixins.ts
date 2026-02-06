import type { ConfirmOptions } from '../utils/confirmPlugin';
import { formatDateTime } from '../utils/formatDate';
import { formatText } from '../utils/formatText';
import { getImgURL } from '../utils/getImgURL';
import { refreshGold } from '../utils/refreshGold';

type ConfirmHost = {
	$globalConfirm?: (options: ConfirmOptions) => Promise<boolean>;
};

export const mixins = {
	methods: {
		formatContent(value: string): string {
			return !value ? '' : formatText(value.toString());
		},
		formatDateTime,
		getImgURL,
		$confirm(this: ConfirmHost, options: ConfirmOptions): Promise<boolean> {
			if (this.$globalConfirm) {
				return this.$globalConfirm(options);
			}

			console.error(
				'Le service de confirmation ($globalConfirm) est introuvable. Assurez-vous que ConfirmPlugin est installé dans main.ts.'
			);
			return Promise.resolve(false);
		},
		$refreshGold() {
			return refreshGold();
		}
	}
};
