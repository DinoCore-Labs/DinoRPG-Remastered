#!/usr/bin/env python3
"""Kabuki step 06: original MT combat epilogues and Forges survivors.

Only modifies local files; no Git or network access. All edits are checked before writes.
"""
from pathlib import Path
import sys

ROOT = Path.cwd()
GEN = Path('app/server/src/utils/fight/generateFight.ts')
HELP = Path('app/server/src/utils/fight/kabukiYakuziFight.ts')
TEST = Path('app/server/test/unit/kabuki-yakuzi-epilogue.test.ts')


def unique(source: str, needle: str, replacement: str, file: Path) -> str:
    count = source.count(needle)
    if count != 1:
        raise RuntimeError(f'{file}: expected one matching anchor; found {count}: {needle[:100]!r}')
    return source.replace(needle, replacement, 1)


def main() -> None:
    if not (ROOT / 'pnpm-workspace.yaml').is_file():
        raise RuntimeError('Run from DinoRPG-Remastered repository root.')
    for path in (GEN, HELP):
        if not (ROOT / path).is_file():
            raise RuntimeError(f'Missing prior step file: {path}')
    if (ROOT / TEST).exists():
        raise RuntimeError(f'Step 06 test already exists: {TEST} (refusing to overwrite)')

    g = (ROOT / GEN).read_text(encoding='utf-8')
    h = (ROOT / HELP).read_text(encoding='utf-8')
    if 'completeKabukiYakuziFight' in g or 'completeKabukiYakuziFight' in h:
        raise RuntimeError('Step 06 is already installed (refusing duplicate injection)')
    if 'summonKabukiAtGorges' not in h or 'setGorgesYakuziInitialLife' not in h:
        raise RuntimeError('Step 05 must be installed before Step 06')

    # Locate the lethal-hit guard regardless of indentation or Prettier wrapping.
    import re
    fun = re.search(r"export\s+function\s+summonKabukiAtGorges\s*\([^)]*\)\s*:\s*boolean\s*\{", h)
    if fun is None:
        raise RuntimeError(f'{HELP}: summonKabukiAtGorges function not found')
    # Restrict the guard search to the portion before reinforcement initialization.
    summon_tail = h[fun.end():]
    summon_limit = summon_tail.find('const count =')
    if summon_limit < 0:
        raise RuntimeError(f'{HELP}: cannot locate the reinforcement block')
    guard = re.compile(r"(?m)^(?P<indent>[ \t]*)if\s*\(\s*!yakuzi\s*\|\|\s*yakuzi\.hp\s*>\s*0\s*\)\s*return\s+false\s*;")
    matches = list(guard.finditer(summon_tail[:summon_limit]))
    if len(matches) != 1:
        raise RuntimeError(f'{HELP}: expected one Yakuzi lethal guard; found {len(matches)}')
    match = matches[0]
    indent = match.group('indent')
    addition = (
        "\n\n" + indent + "// MT Scenario.hx: m.text(Data.TEXT.kabuki_defend, y)\n"
        + indent + "fightData.steps.push({\n"
        + indent + "    action: 'fightText',\n"
        + indent + "    text: { type: 'talk', text: KABUKI_FIGHT_TEXT.kabukiDefend, speakerFid: yakuzi.id }\n"
        + indent + "});"
    )
    position = fun.end() + match.end()
    h = h[:position] + addition + h[position:]

    # Regex works with either LF or CRLF and respects any formatting of imports.
    import_anchor = re.compile(r"(?m)^import\s*\{\s*FightStep\s*\}\s*from\s*['\"]@dinorpg/core/models/fight/fightStep\.js['\"];?")
    matches = list(import_anchor.finditer(h))
    if len(matches) != 1:
        raise RuntimeError(f'{HELP}: expected one FightStep import; found {len(matches)}')
    m = matches[0]
    h = h[:m.end()] + "\nimport { FightOutcome } from '@dinorpg/core/models/fight/fightResult.js';\nimport { LifeEffect } from '@dinorpg/core/models/fight/transpiler.js';" + h[m.end():]

    h += '''

/** Original Motion Twin text: xml/fr/scenarios.xml, <s id="kabuki">. */
export const KABUKI_FIGHT_TEXT = {
    yakuziRun: "Profitant d'un instant d'inattention, Yakuzi se relève et s'enfuit !",
    kabukiDefend: "A l'aide !!!!",
    strangeDinoz: 'Mais quel était donc cet étrange dinoz ?!?'
} as const;

/**
 * MT src/fight/Scenario.hx, kabuki phases 4 and 5.
 * Must run after the engine has determined the outcome but BEFORE fighter result
 * HP losses are calculated: otherwise resurrected Dinoz would remain dead in DB.
 * No scenario rewards/progression here: existing dialog fight_win handles those.
 */
export function completeKabukiYakuziFight(
    fightData: DetailedFight,
    encounter: 'kabuki_yakuzi_forges' | 'kabuki_yakuzi_gorges' | undefined
): number {
    if (fightData.outcome !== FightOutcome.AttackerWin) return 0;

    if (encounter === 'kabuki_yakuzi_forges') {
        fightData.steps.push({
            action: 'fightText',
            text: { type: 'message', text: KABUKI_FIGHT_TEXT.yakuziRun }
        });

        let revived = 0;
        for (const fighter of fightData.fighters) {
            if (!fighter.attacker || fighter.type !== FighterType.DINOZ || fighter.hp > 0) continue;
            // Original scenario heals dead Dinoz to exactly one HP after victory.
            // Set combat HP before FightProcessResult.attackers is built.
            const hpToRestore = 1 - fighter.hp;
            fighter.hp = 1;
            fightData.steps.push({
                action: 'heal',
                fighter: {
                    id: fighter.id, name: fighter.name, type: fighter.type, attacker: fighter.attacker
                },
                hp: hpToRestore,
                fx: LifeEffect.Heal
            });
            revived++;
        }
        return revived;
    }

    if (encounter === 'kabuki_yakuzi_gorges') {
        fightData.steps.push({
            action: 'fightText',
            text: { type: 'message', text: KABUKI_FIGHT_TEXT.strangeDinoz }
        });
    }
    return 0;
}
'''
    g = unique(
        g,
        "import { escapeYakuziAfterDefeat, setGorgesYakuziInitialLife, summonKabukiAtGorges } from './kabukiYakuziFight.js';",
        "import { completeKabukiYakuziFight, escapeYakuziAfterDefeat, setGorgesYakuziInitialLife, summonKabukiAtGorges } from './kabukiYakuziFight.js';",
        GEN,
    )
    g = unique(
        g,
        "\tif (fightOutcome === null) {\n\t\tthrow new Error('Fight ended without outcome.');\n\t}",
        "\tif (fightOutcome === null) {\n\t\tthrow new Error('Fight ended without outcome.');\n\t}\n\n\t// Apply MT post-battle story effects before HP losses are calculated.\n\tcompleteKabukiYakuziFight(fightData, config.scriptedEncounter);",
        GEN,
    )

    test_source = '''import { describe, expect, it } from 'vitest';
import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import { FightOutcome } from '@dinorpg/core/models/fight/fightResult.js';
import type { DetailedFighter } from '@dinorpg/core/models/fight/detailedFighter.js';
import type { DetailedFight } from '../../src/utils/fight/generateFight.js';
import { completeKabukiYakuziFight, KABUKI_FIGHT_TEXT } from '../../src/utils/fight/kabukiYakuziFight.js';

const dinoz = (hp: number, id: number): DetailedFighter => ({
    id, name: `Dinoz ${id}`, hp, attacker: true, type: FighterType.DINOZ
}) as unknown as DetailedFighter;

function fight(outcome: FightOutcome, fighters: DetailedFighter[]): DetailedFight {
    return { outcome, fighters, steps: [] } as unknown as DetailedFight;
}

describe('Kabuki MT — fight epilogues', () => {
    it('Forges: resurrects dead attacker Dinoz to exactly 1 HP only after victory', () => {
        const dead = dinoz(0, 100);
        const alive = dinoz(12, 101);
        const f = fight(FightOutcome.AttackerWin, [dead, alive]);
        expect(completeKabukiYakuziFight(f, 'kabuki_yakuzi_forges')).toBe(1);
        expect(dead.hp).toBe(1);
        expect(alive.hp).toBe(12);
        expect(f.steps.map(step => step.action)).toEqual(['fightText', 'heal']);
        expect(f.steps[0]).toEqual({
            action: 'fightText', text: { type: 'message', text: KABUKI_FIGHT_TEXT.yakuziRun }
        });
    });

    it('Forges: no revive and no message if defeated', () => {
        const dead = dinoz(0, 100);
        const f = fight(FightOutcome.DefenderWin, [dead]);
        expect(completeKabukiYakuziFight(f, 'kabuki_yakuzi_forges')).toBe(0);
        expect(dead.hp).toBe(0);
        expect(f.steps).toEqual([]);
    });

    it('Gorges: original ending message, no Dinoz resurrection', () => {
        const dead = dinoz(0, 100);
        const f = fight(FightOutcome.AttackerWin, [dead]);
        expect(completeKabukiYakuziFight(f, 'kabuki_yakuzi_gorges')).toBe(0);
        expect(dead.hp).toBe(0);
        expect(f.steps).toEqual([{
            action: 'fightText', text: { type: 'message', text: KABUKI_FIGHT_TEXT.strangeDinoz }
        }]);
    });

    it('does not change unrelated fights', () => {
        const dead = dinoz(0, 100);
        const f = fight(FightOutcome.AttackerWin, [dead]);
        expect(completeKabukiYakuziFight(f, undefined)).toBe(0);
        expect(dead.hp).toBe(0);
        expect(f.steps).toEqual([]);
    });
});
'''

    # All guards passed, now apply writes.
    (ROOT / GEN).write_text(g, encoding='utf-8')
    (ROOT / HELP).write_text(h, encoding='utf-8')
    (ROOT / TEST).parent.mkdir(parents=True, exist_ok=True)
    (ROOT / TEST).write_text(test_source, encoding='utf-8')
    for name in (GEN, HELP, TEST):
        print('Updated' if name != TEST else 'Created', name)
    print('Step 06 applied locally. No Git operations or remote writes.')


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print(f'ERROR: {exc}', file=sys.stderr)
        sys.exit(1)
