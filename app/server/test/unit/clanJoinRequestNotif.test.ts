import { ClanMemberRight } from '@dinorpg/core/models/enums/ClanMemberRight.js';
import { describe, expect, it } from 'vitest';

import { getClanJoinRequestNotificationRecipients } from '../../src/Clan/Service/clanJoinRequest.service.js';

describe('getClanJoinRequestNotificationRecipients', () => {
	it('should return leader ID when clan has a leader and no members have accept/deny rights', () => {
		const recipients = getClanJoinRequestNotificationRecipients({
			leaderId: 'leader-123',
			members: [
				{ userId: 'member-1', rights: [] },
				{ userId: 'member-2', rights: [ClanMemberRight.MEMBER_EDIT] }
			]
		});

		expect(recipients).toEqual(['leader-123']);
	});

	it('should return both leader and members who have MEMBER_ACCEPT_AND_DENY_REQUESTS right', () => {
		const recipients = getClanJoinRequestNotificationRecipients({
			leaderId: 'leader-123',
			members: [
				{ userId: 'member-1', rights: [ClanMemberRight.MEMBER_ACCEPT_AND_DENY_REQUESTS] },
				{ userId: 'member-2', rights: [] },
				{
					userId: 'member-3',
					rights: [ClanMemberRight.MEMBER_ACCEPT_AND_DENY_REQUESTS, ClanMemberRight.MEMBER_EXCLUDE]
				}
			]
		});

		expect(recipients).toEqual(['leader-123', 'member-1', 'member-3']);
	});

	it('should not duplicate leader ID if leader also appears in members with accept/deny rights', () => {
		const recipients = getClanJoinRequestNotificationRecipients({
			leaderId: 'leader-123',
			members: [
				{ userId: 'leader-123', rights: [ClanMemberRight.MEMBER_ACCEPT_AND_DENY_REQUESTS] },
				{ userId: 'member-1', rights: [ClanMemberRight.MEMBER_ACCEPT_AND_DENY_REQUESTS] }
			]
		});

		expect(recipients).toEqual(['leader-123', 'member-1']);
	});

	it('should work when leaderId is null or missing', () => {
		const recipients = getClanJoinRequestNotificationRecipients({
			leaderId: null,
			members: [
				{ userId: 'member-1', rights: [ClanMemberRight.MEMBER_ACCEPT_AND_DENY_REQUESTS] },
				{ userId: 'member-2', rights: [] }
			]
		});

		expect(recipients).toEqual(['member-1']);
	});

	it('should return empty array if no leader and no authorized members', () => {
		const recipients = getClanJoinRequestNotificationRecipients({
			leaderId: null,
			members: [{ userId: 'member-1', rights: [] }]
		});

		expect(recipients).toEqual([]);
	});
});
