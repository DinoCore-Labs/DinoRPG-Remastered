#!/usr/bin/env python3
"""Kabuki step 13: MT Totem battle intro, ordered fightText/arrive events.

Run at monorepo root; --check is read-only. No network/Git operations.
"""
from __future__ import annotations
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path.cwd()
CONTROLLER = Path('app/server/src/Scenario/Controller/kabukiScenario.controller.ts')
HELPER = Path('app/server/src/Scenario/Controller/kabukiTotemOpening.ts')
TEST = Path('app/server/test/unit/kabuki-totem-opening.test.ts')
LANGS = ['FR','EN','ES','DE']
MT = {
 'FR': {'igorFinalTalk':'QUOI ?? COMMENT as-tu pu me suivre ici sans Aura ?!?','igorFinalAttack':"Aaa l'aatttaaqquuee !!!",'yakuziFinalWait':'Attends !','yakuziFinalHelp':"Nous allons t'aider !!!"},
 'EN': {'igorFinalTalk':'WHAT?? How have you been able to follow me here without an Aura?!?','igorFinalAttack':'Attaaaaaaack!!!','yakuziFinalWait':'Wait!','yakuziFinalHelp':'We are going to help you!!!'},
 'ES': {'igorFinalTalk':'¿¿QUÉ?? ¡¿CÓMO has podido seguirme hasta aquí sin el Aura?!','igorFinalAttack':'¡¡¡Aaal ataque!!!','yakuziFinalWait':'¡Espera!','yakuziFinalHelp':'¡¡¡Vamos a ayudarte!!!'},
 'DE': {'igorFinalTalk':'WIE BITTE?? WIE zum Teufel konntest du mir bis hierher ohne Kabuki-Aura folgen?!?','igorFinalAttack':'Aaaannngriiifff!!!','yakuziFinalWait':'Warte!','yakuziFinalHelp':'Wir werden dir helfen!!!'},
}

def ensure(ok:bool, message:str)->None:
 if not ok: raise RuntimeError(message)

def patch_controller(source:str)->str:
 ensure('processFinalFight' in source and 'KABUKI_TOTEM_OPPONENTS' in source,'Step11 controller not found')
 ensure('applyKabukiTotemOpening' not in source,'Step13 already installed, refusing overwrite')
 m=re.search(r"(?m)^import\s+\{\s*getUserScenarioProgression\s*\}\s+from\s+['\"]\./scenarioProgress\.controller\.js['\"];",source)
 ensure(m is not None,'Cannot locate scenarioProgress import in Totem controller')
 source=source[:m.end()]+"\nimport { applyKabukiTotemOpening } from './kabukiTotemOpening.js';"+source[m.end():]
 # Scope insertion to processFinalFight to avoid other reward calls.
 start=source.index('async function processFinalFight(')
 end=source.index('export async function processKabukiScenarioMoveFight',start)
 fragment=source[start:end]
 match=re.search(r"(?m)^(?P<indent>[\t ]*)const result\s*=\s*await rewardFightVsMonsters\(",fragment)
 ensure(match is not None,'Cannot find fight reward call in processFinalFight')
 fragment=fragment[:match.start()]+match.group('indent')+'applyKabukiTotemOpening(fightProcess);\n'+fragment[match.start():]
 return source[:start]+fragment+source[end:]

HELPER_CODE = r'''import type { FighterRecap, FightProcessResult } from '@dinorpg/core/models/fight/fightResult.js';
import type { FightStep } from '@dinorpg/core/models/fight/fightStep.js';

/**
 * MT src/fight/Scenario.hx, P.itotem at kabuki:20.
 * All fighters already belong to the simulated fight. This function inserts
 * the original ordered narrative/arrival steps BEFORE its first combat turn;
 * it does not change stats, damage, targeting, rewards, or battle outcome.
 *
 * True on-start dynamic spawning remains a separate engine enhancement.
 */
export function buildKabukiTotemOpening(fighters: readonly FighterRecap[]): FightStep[] {
    const pick = (name: string, attacker: boolean): FighterRecap => {
        const matches = fighters.filter(f => f.name === name && f.attacker === attacker);
        if (matches.length !== 1) {
            throw new Error(`Kabuki Totem opening expected one fighter ${name} (${attacker ? 'ally' : 'enemy'}), found ${matches.length}`);
        }
        return matches[0]!;
    };
    const igor = pick('igor', false);
    const barbara = pick('Barbara', false);
    const choupette = pick('Choupette', false);
    const poupoule = pick('Poupoule', false);
    const yakuzi = pick('yakuzi', true);
    const ninjutsu = pick('Ninjutsu', true);
    const kage = pick('Kage', true);
    const talk = (speakerFid: number, text: string): FightStep => ({
        action: 'fightText', text: {type: 'talk', speakerFid, text}
    });
    const arrive = (fid: number): FightStep => ({action: 'arrive', fid});
    return [
        talk(igor.id, 'scenarios.kabuki.texts.igorFinalTalk'),
        talk(igor.id, 'Barbara !'), arrive(barbara.id),
        talk(igor.id, 'Choupette !'), arrive(choupette.id),
        talk(igor.id, 'Poupoule !'), arrive(poupoule.id),
        talk(igor.id, 'scenarios.kabuki.texts.igorFinalAttack'),
        arrive(yakuzi.id),
        talk(yakuzi.id, 'scenarios.kabuki.texts.yakuziFinalWait'),
        arrive(ninjutsu.id), arrive(kage.id),
        talk(yakuzi.id, 'scenarios.kabuki.texts.yakuziFinalHelp')
    ];
}

/** Insert just after prepare: renderer sees the roster before arrive events. */
export function applyKabukiTotemOpening(fight: Pick<FightProcessResult, 'fighters' | 'steps'>): void {
    const prepare = fight.steps.findIndex(step => step.action === 'prepare');
    if (prepare === -1) throw new Error('Kabuki Totem opening requires a prepare step');
    const steps = buildKabukiTotemOpening(fight.fighters);
    fight.steps.splice(prepare + 1, 0, ...steps);
}
'''

TEST_CODE = r'''import { describe, expect, it } from 'vitest';
import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import type { FighterRecap } from '@dinorpg/core/models/fight/fightResult.js';
import type { FightStep } from '@dinorpg/core/models/fight/fightStep.js';
import { applyKabukiTotemOpening, buildKabukiTotemOpening } from '../../src/Scenario/Controller/kabukiTotemOpening.js';

const names: Array<[string, boolean]> = [
    ['igor', false], ['Barbara', false], ['Choupette', false], ['Poupoule', false],
    ['yakuzi', true], ['Ninjutsu', true], ['Kage', true]
];
const roster = names.map(([name, attacker], index): FighterRecap => ({
    id: index + 101, name, attacker, type: FighterType.MONSTER,
    display: name, maxHp: 100, startingHp: 100, energy: 0, maxEnergy: 100, energyRecovery: 0
}));

describe('MT Kabuki Totem introduction', () => {
    it('replays the six arrivals in original MT order', () => {
        const steps = buildKabukiTotemOpening(roster);
        expect(steps.filter((s): s is Extract<FightStep, {action: 'arrive'}> => s.action === 'arrive').map(s => s.fid)).toEqual([102, 103, 104, 105, 106, 107]);
    });
    it('puts Igors speech before his companions, and Yakuzis help after the allies', () => {
        const steps = buildKabukiTotemOpening(roster);
        expect(steps[0]).toMatchObject({ action: 'fightText', text: {speakerFid: 101} });
        expect(steps.at(-1)).toMatchObject({action: 'fightText', text: {speakerFid: 105}});
    });
    it('inserts immediately after prepare, leaving the simulated combat steps untouched', () => {
        const hit: FightStep = { action: 'arrive', fid: 999 };
        const steps: FightStep[] = [{action: 'prepare', dinozList: [], monsterList: []}, hit];
        applyKabukiTotemOpening({ fighters: roster, steps });
        expect(steps[0]?.action).toBe('prepare');
        expect(steps.at(-1)).toBe(hit);
        expect(steps[1]?.action).toBe('fightText');
    });
    it('fails safely when a required MT character is missing or duplicated', () => {
        expect(() => buildKabukiTotemOpening(roster.slice(1))).toThrow(/igor/);
        expect(() => buildKabukiTotemOpening([...roster, roster[0]!])).toThrow(/igor/);
    });
});
'''

def prepare()->dict[Path,str]:
 ensure((ROOT/'pnpm-workspace.yaml').is_file(),'Run from monorepo root')
 for p in [CONTROLLER]:ensure((ROOT/p).is_file(),f'Missing {p}')
 for p in [HELPER,TEST]:ensure(not (ROOT/p).exists(),f'{p} already exists; refusing overwrite')
 output={CONTROLLER:patch_controller((ROOT/CONTROLLER).read_text(encoding='utf-8')),HELPER:HELPER_CODE,TEST:TEST_CODE}
 for lang in LANGS:
  p=Path(f'app/client/src/i18n/locales/{lang}.json')
  ensure((ROOT/p).is_file(),f'Missing {p}')
  source=(ROOT/p).read_text(encoding='utf-8')
  data=json.loads(source)
  ensure('kabuki' in data.get('scenarios',{}),'Step11 Kabuki translations missing')
  texts=data['scenarios']['kabuki'].setdefault('texts',{})
  ensure(not any(k in texts for k in MT[lang]),f'{p}: Step13 translation keys already exist')
  texts.update(MT[lang])
  output[p]=json.dumps(data,ensure_ascii=False,indent='\t')+'\n'
 return output

def main()->None:
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument('--check',action='store_true',help='validate all changes, do not write')
 args=parser.parse_args()
 files=prepare()
 if args.check:
  print(f'OK: validated {len(files)} file edits; nothing written');return
 for path,source in files.items():
  dest=ROOT/path
  dest.parent.mkdir(parents=True,exist_ok=True)
  dest.write_text(source,encoding='utf-8')
  print('Updated:',path)
 print('Step13 installed; run core/server/client builds and targeted test.')

if __name__=='__main__':
 try:main()
 except Exception as error:
  print('ERROR:',error,file=sys.stderr);sys.exit(1)
