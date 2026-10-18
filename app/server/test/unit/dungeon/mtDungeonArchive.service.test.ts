import { describe, expect, it } from 'vitest';

import { mtGitBlobSha } from '../../../src/Dungeon/Service/mtDungeonArchive.service.js';

// Git object identity is computed from exactly the original bytes, not modified text.
describe('MT archive integrity', () => {
	it('uses Git blob SHA1 rather than raw SHA1', () => {
		expect(mtGitBlobSha(Buffer.from('test\n', 'utf8'))).toBe('9daeafb9864cf43055ae93beb0afd6c7d144bfa4');
	});
});
