import type { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { Prisma } from '../../../../prisma/index.js';
import { buildDialogContext } from '../../Dialog/Controller/dialog.context.js';

type TutorialTransaction = Prisma.TransactionClient;

type BuildTutorialContextParams = {
	userId: string;
	dinozId: number;
};

export async function buildTutorialContext(tx: TutorialTransaction, params: BuildTutorialContextParams) {
	const dinoz = await tx.dinoz.findUnique({
		where: {
			id: params.dinozId
		},
		select: {
			placeId: true
		}
	});
	if (!dinoz) {
		throw new ExpectedError('dinozNotFound', {
			params: {
				dinozId: params.dinozId
			}
		});
	}
	/*
	 * Le moteur de conditions existant attend un DialogContext.
	 *
	 * Les conditions utilisées par le tutoriel n'utilisent pas
	 * context.dialog, mais buildDialogContext demande malgré tout
	 * un dialog.
	 *
	 * On lui fournit donc un contexte technique "tutorial" avec
	 * la position réelle du Dinoz.
	 */
	return buildDialogContext(tx, {
		userId: params.userId,
		dinozId: params.dinozId,
		dialog: {
			id: 'tutorial',
			place: dinoz.placeId as PlaceEnum
		}
	});
}
