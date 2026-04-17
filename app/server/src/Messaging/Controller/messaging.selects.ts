export const messageSelect = {
	id: true,
	content: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	senderId: true,
	senderNameSnapshot: true,
	sender: {
		select: {
			id: true,
			name: true
		}
	}
} as const;

export const participantSelect = {
	id: true,
	joinedAt: true,
	leftAt: true,
	lastReadAt: true,
	isArchived: true,
	isMuted: true,
	userId: true,
	userNameSnapshot: true,
	user: {
		select: {
			id: true,
			name: true
		}
	}
} as const;

export const lastMessageSelect = {
	id: true,
	createdAt: true,
	senderId: true
} as const;

export const threadBasicSelect = {
	id: true,
	type: true,
	title: true,
	createdAt: true,
	updatedAt: true,
	createdBy: {
		select: {
			id: true,
			name: true
		}
	},
	participants: {
		where: {
			leftAt: null
		},
		select: participantSelect
	},
	messages: {
		where: {
			deletedAt: null
		},
		orderBy: {
			createdAt: 'desc' as const
		},
		take: 1,
		select: lastMessageSelect
	}
} as const;

export const threadFullSelect = {
	...threadBasicSelect,
	pinnedMessage: {
		select: messageSelect
	}
} as const;
