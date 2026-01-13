import { formatDateTime } from '../utils/formatDate';
import { formatText } from '../utils/formatText';
import { getImgURL } from '../utils/getImgURL';

export const mixins = {
	methods: {
		formatContent(value: string): string {
			return !value ? '' : formatText(value.toString());
		},
		formatDateTime,
		getImgURL
	}
};
