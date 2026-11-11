#!/usr/bin/env python3
"""Step 10 — original Yakuzi Totem epilogue (kabuki 21, 22, 23).

Run at repository root. Atomic preflight: no files are written until checks finish.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

LANGS = {'FR': 'fr', 'EN': 'en', 'ES': 'es', 'DE': 'de'}
IDS = ('yakuzi_totem_reward', 'yakuzi_totem_wait', 'yakuzi_totem_eggs')
EXPORTS = ('yakuziTotemRewardDialog', 'yakuziTotemWaitDialog', 'yakuziTotemEggsDialog')
ROOT = Path.cwd()


def require(test: bool, msg: str) -> None:
    if not test:
        raise RuntimeError(msg)


def original(lang: str, archive: Path | None) -> str:
    relative = Path('DinoRPG') / 'xml' / lang / 'dialogs' / 'yakuzi.xml'
    if archive is not None:
        p = archive / relative
        require(p.is_file(), f'Original file missing: {p}')
        return p.read_text('utf-8-sig')
    url = f'https://raw.githubusercontent.com/DinoCore-Labs/WebGamesArchives/main/{relative.as_posix()}'
    try:
        with urllib.request.urlopen(url, timeout=20) as response:
            return response.read().decode('utf-8-sig')
    except Exception as exc:
        raise RuntimeError(f'Cannot retrieve {url}: {exc}. Use --archives DIR for offline import.') from exc


def texts(el: ET.Element) -> str:
    return re.sub(r'\s+', ' ', ''.join(el.itertext())).strip()


def parse(xml: str, lang: str) -> list[dict]:
    root = ET.fromstring('<root>' + xml.lstrip('\ufeff').strip() + '</root>')
    dialogs = [el for el in root if el.tag == 'd' and el.get('place') == 'itotem']
    result: list[dict] = []
    for progression in (21, 22, 23):
        candidates = [d for d in dialogs if d.get('cond') == f'scenario(kabuki,{progression})']
        require(len(candidates) == 1, f'{lang}: expected one MT Yakuzi Totem dialogue for stage {progression}, got {len(candidates)}')
        d = candidates[0]
        phases: dict[str, dict] = {}
        links: dict[str, dict] = {}
        for child in d:
            key = child.get('id')
            if not key:
                continue
            if child.tag == 'phase':
                phases[key] = {
                    'text': texts(child), 'next': [x for x in child.get('next', '').split(':') if x],
                    'fast': child.get('fast') == '1', 'scenario': child.get('scenario'),
                    'scenarioIncr': child.get('scenarioIncr'), 'give': child.get('give'),
                    'usegold': child.get('usegold')
                }
            elif child.tag == 'a':
                links[key] = {'text': texts(child), 'target': child.get('target') or key, 'cond': child.get('cond')}
        require('begin' in phases, f'{lang}: missing begin for stage {progression}')
        for pid, phase in phases.items():
            for lid in phase['next']:
                require(lid in links and links[lid]['target'] in phases, f'{lang}: broken MT dialogue link {progression}:{pid}->{lid}')
        result.append({'name': d.get('name'), 'gfx': d.get('gfx'), 'background': d.get('background'), 'cond': d.get('cond'), 'phases': phases, 'links': links})
    # Semantic guard: ensure original reward mechanics have not unexpectedly changed.
    p21, p22, p23 = (x['phases'] for x in result)
    require(p21['yes']['give'] == 'kabegg' and p21['yes']['scenario'] == 'kabuki:22', f'{lang}: unexpected first reward')
    require(p22['noegg']['scenario'] == 'kabuki:23', f'{lang}: unexpected waiting stage')
    require(p23['buy']['usegold'] == '50000' and p23['buy']['give'] == 'kabegg'
            and p23['buy']['scenarioIncr'] == 'kabegg' and p23['buy']['scenario'] == 'kabuki:22',
            f'{lang}: unexpected egg purchase mechanics')
    return result


def q(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def render(dialogs: list[dict]) -> str:
    parts = [
        "import { PlaceEnum } from '../../enums/PlaceEnum.js';",
        "import { Item } from '../../items/itemList.js';",
        "import { parseCondition } from '../../utils/conditions/parseConditions.js';",
        "import { defineDialog } from '../defineDialog.js';", '',
        '// Original MT: DinoRPG/xml/{fr,en,es,de}/dialogs/yakuzi.xml (itotem, kabuki 21-23).',
        '// Intentionally does NOT unlock the island or advance kabuki 19 -> 21.', ''
    ]
    for i, d in enumerate(dialogs):
        parts.extend([
            f'export const {EXPORTS[i]} = defineDialog({{',
            f"\tid: '{IDS[i]}',", '\tplace: PlaceEnum.ITOTEM,',
            "\tname: 'npc.yakuziTotem.name',",
            f"\tpnj: {{ image: false, gfx: {q(d['gfx'] or 'yakuzi')}, frame: 'speak', background: {q(d['background'] or '2')} }},",
            f'\tcond: parseCondition({q(d["cond"])}),', "\tfirst: 'begin',", '\tphases: {'
        ])
        for pid, p in d['phases'].items():
            parts.extend([f'\t\t{q(pid)}: {{', f'\t\t\tid: {q(pid)},', f'\t\t\ttext: {q(f"npc.yakuziTotem.dialog.{IDS[i]}.{pid}")},'])
            if p['fast']:
                parts.append('\t\t\tfast: true,')
            if p['next']:
                parts.append('\t\t\tnext: [' + ', '.join(q(v) for v in p['next']) + '],')
            specials = []
            effects = []
            if p['usegold']:
                specials.append(f"{{ type: 'useGold', amount: {int(p['usegold'])} }}")
            if p['give']:
                require(p['give'] == 'kabegg', f'Unmapped item {p["give"]}')
                effects.append("{ type: 'giveItem', itemId: Item.KABUKI_EGG, count: 1 }")
            if p['scenarioIncr']:
                require(p['scenarioIncr'] == 'kabegg', 'Unexpected scenarioIncr')
                effects.append("{ type: 'scenarioDelta', scenario: 'kabegg', delta: 1 }")
            if p['scenario']:
                code, value = p['scenario'].split(':')
                require(code == 'kabuki', f'Unexpected scenario {code}')
                effects.append(f"{{ type: 'scenario', scenario: 'kabuki', phase: {int(value)} }}")
            if specials:
                parts.append('\t\t\tspecial: [' + ', '.join(specials) + '],')
            if effects:
                parts.append('\t\t\teffects: [' + ', '.join(effects) + '],')
            parts.append('\t\t},')
        parts.append('\t},')
        parts.append('\tlinks: {')
        used = set(x for p in d['phases'].values() for x in p['next'])
        for lid, link in d['links'].items():
            if lid not in used:
                continue
            parts.extend([f'\t\t{q(lid)}: {{', f'\t\t\tid: {q(lid)},', f'\t\t\ttext: {q(f"npc.yakuziTotem.choice.{IDS[i]}.{lid}")},'])
            if link['target'] != lid:
                parts.append(f'\t\t\ttarget: {q(link["target"])},')
            if link['cond']:
                parts.append(f'\t\t\tcond: parseCondition({q(link["cond"])}),')
            parts.append('\t\t},')
        parts.extend(['\t}', '});', ''])
    return '\n'.join(parts)


def make_test() -> str:
    return """import { describe, expect, it } from 'vitest';

import { Item } from '../../../src/models/items/itemList.js';
import {
    yakuziTotemEggsDialog,
    yakuziTotemRewardDialog,
    yakuziTotemWaitDialog
} from '../../../src/models/dialogs/data/yakuziKabukiTotem.dialog.js';

describe('Kabuki MT — Yakuzi Totem epilogue', () => {
    it('offers the first egg only when the player accepts, then advances to stage 22', () => {
        expect(yakuziTotemRewardDialog.phases.no.effects).toBeUndefined();
        expect(yakuziTotemRewardDialog.phases.yes.effects).toEqual([
            { type: 'giveItem', itemId: Item.KABUKI_EGG, count: 1 },
            { type: 'scenario', scenario: 'kabuki', phase: 22 }
        ]);
    });
    it('moves to stage 23 after the original waiting dialogue', () => {
        expect(yakuziTotemWaitDialog.phases.noegg.effects).toEqual([
            { type: 'scenario', scenario: 'kabuki', phase: 23 }
        ]);
    });
    it('charges 50000 gold, awards an egg, and increments kabegg purchases', () => {
        expect(yakuziTotemEggsDialog.phases.buy.special).toEqual([{ type: 'useGold', amount: 50000 }]);
        expect(yakuziTotemEggsDialog.phases.buy.effects).toEqual([
            { type: 'giveItem', itemId: Item.KABUKI_EGG, count: 1 },
            { type: 'scenarioDelta', scenario: 'kabegg', delta: 1 },
            { type: 'scenario', scenario: 'kabuki', phase: 22 }
        ]);
        expect(yakuziTotemEggsDialog.links.egg.cond).toBeDefined();
        expect(yakuziTotemEggsDialog.links.maxegg.cond).toBeDefined();
    });
    it('never advances the Kabuki quest from 19 or 20', () => {
        const dialogs = [yakuziTotemRewardDialog, yakuziTotemWaitDialog, yakuziTotemEggsDialog];
        expect(dialogs.every(d => d.place !== undefined)).toBe(true);
        for (const d of dialogs) {
            for (const phase of Object.values(d.phases)) {
                expect(phase.effects?.some(e => e.type === 'scenario' && e.scenario === 'kabuki' && e.phase < 21)).not.toBe(true);
            }
        }
    });
});
"""


def prepare(archives: Path | None) -> dict[Path, str]:
    registry = ROOT / 'packages/core/src/models/dialogs/data/index.ts'
    require(registry.is_file(), 'Run from the root of DinoRPG-Remastered')
    dest = registry.parent / 'yakuziKabukiTotem.dialog.ts'
    test = ROOT / 'packages/core/test/unit/dialogs/yakuziKabukiTotem.dialog.test.ts'
    require(not dest.exists() and not test.exists(), 'Step 10 already installed; refusing to overwrite')
    data = {language: parse(original(code, archives), language) for language, code in LANGS.items()}
    for language, dialogs in data.items():
        for i, d in enumerate(dialogs):
            reference = data['FR'][i]
            require(set(d['phases']) == set(reference['phases']) and set(d['links']) == set(reference['links']),
                    f'{language}: original dialogue structure differs from French at stage {21+i}')
    modifications: dict[Path, str] = {dest: render(data['FR']), test: make_test()}
    reg = registry.read_text('utf-8')
    require('yakuziKabukiTotem.dialog.js' not in reg, 'Step10 dialogue already registered')
    # Position-independent insertion; do not depend on exact imports or indentation.
    match = re.search(r'(?m)^export const dialogDefinitions\s*=\s*\[', reg)
    require(match is not None, 'Cannot find dialogDefinitions registry opening')
    reg = reg[:match.start()] + "import { yakuziTotemRewardDialog, yakuziTotemWaitDialog, yakuziTotemEggsDialog } from './yakuziKabukiTotem.dialog.js';\n\n" + reg[match.start():]
    match = re.search(r'(?m)^\];\s*$', reg)
    require(match is not None, 'Cannot find dialogDefinitions closing array')
    prefix = reg[:match.start()].rstrip()
    require(prefix.endswith(',') or prefix.endswith('[') or bool(re.search(r'[A-Za-z0-9_]$', prefix)),
            'Registry ending is malformed')
    if not prefix.endswith(',') and not prefix.endswith('['):
        prefix += ','
    reg = prefix + '\n\tyakuziTotemRewardDialog,\n\tyakuziTotemWaitDialog,\n\tyakuziTotemEggsDialog\n' + reg[match.start():]
    modifications[registry] = reg
    for language, ds in data.items():
        path = ROOT / f'app/client/src/i18n/locales/{language}.json'
        require(path.is_file(), f'Locale not found: {path}')
        obj = json.loads(path.read_text('utf-8'))
        npc = obj.get('npc')
        require(isinstance(npc, dict), f'{language}: missing npc section')
        require('yakuziTotem' not in npc, f'{language}: already installed yakuziTotem translations')
        npc['yakuziTotem'] = {
            'name': ds[0]['name'] or 'Yakuzi',
            'dialog': {IDS[i]: {pid: p['text'] for pid, p in d['phases'].items()} for i, d in enumerate(ds)},
            'choice': {IDS[i]: {lid: link['text'] for lid, link in d['links'].items() if lid in {x for p in d['phases'].values() for x in p['next']}}
                       for i, d in enumerate(ds)}
        }
        modifications[path] = json.dumps(obj, ensure_ascii=False, indent='\t') + '\n'
    return modifications


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true', help='Preflight only, no files written')
    parser.add_argument('--archives', type=Path, help='Path containing DinoRPG/xml/... from WebGamesArchives')
    args = parser.parse_args()
    changes = prepare(args.archives)
    if args.check:
        print(f'CHECK OK: {len(changes)} local files; no changes written.')
        for path in changes:
            print('  ', path.relative_to(ROOT))
        return
    for path, content in changes.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding='utf-8')
    print(f'INSTALLED: Step 10 — {len(changes)} files updated locally.')


if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, ET.ParseError, ValueError, KeyError) as err:
        print(f'ERROR: {err}', file=sys.stderr)
        sys.exit(1)
