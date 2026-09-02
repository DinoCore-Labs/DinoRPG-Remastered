import type { Language } from '@dinorpg/core/models/config/language.js';
import type { RoadmapEntry } from '@dinorpg/core/models/roadmap/roadmap.js';

import { api } from '../utils/http';

export const RoadmapService = {
	getRoadmap(lang: Language): Promise<RoadmapEntry[]> {
		return api.get<RoadmapEntry[]>('/roadmap', {
			params: {
				lang
			}
		});
	}
};
