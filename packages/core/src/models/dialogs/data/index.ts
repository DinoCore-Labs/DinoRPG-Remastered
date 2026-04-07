import { archisageDialog } from './archisage.dialog.js';
import { atlanteGuardDialog } from './atlanteGuard.dialog.js';
import { coralMinerDialog } from './coralMiner.dialog.js';
import { hydargolDialog } from './hydargol.dialog.js';
import { jovebozeDialog } from './joveboze.dialog.js';
import { padamoineDialog } from './padamoine.dialog.js';
import { professorEugeneDialog } from './prof.dialog.js';
import { speleleologueDialog, speleleologueIceDialog } from './spelele.dialog.js';
import { testDialog } from './test.dialog.js';
import { strangePterozDialog } from './totems.dialog.js';
import { weirdManDialog } from './weirdMan.dialog.js';

export const dialogDefinitions = [
	// Dinoville
	professorEugeneDialog,
	jovebozeDialog,
	padamoineDialog,
	// Iles Atlantéinées
	coralMinerDialog,
	atlanteGuardDialog,
	hydargolDialog,
	archisageDialog,
	// GTC
	strangePterozDialog,
	speleleologueDialog,
	speleleologueIceDialog,
	// Foret
	weirdManDialog,
	// Test
	testDialog
];
