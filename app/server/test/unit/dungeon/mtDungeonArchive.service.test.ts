import { describe, expect, it } from 'vitest';

import { MtDungeonArchive } from '../../../src/Dungeon/Service/mtDungeonArchive.service.js';

describe('MT static archive', () => {
	it('loads authentic MT definitions without filesystem XML', () => {
		const archive = new MtDungeonArchive();
		expect(archive.definition('stepp').name).toBe('Les Cavernes Magnétiques');
		expect(archive.localizedDefinition('stepp', 'en').definition.name).toBe('The Magnetic Caverns');
		expect(archive.configuration('stepp_0').map.levels.length).toBeGreaterThan(0);
	});
});
