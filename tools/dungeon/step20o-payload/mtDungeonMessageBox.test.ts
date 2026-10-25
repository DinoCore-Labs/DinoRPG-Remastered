import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import MtDungeonMessageBox from '../../../src/components/dungeon/MtDungeonMessageBox.vue';

describe('Original Motion Twin dungeon message box', () => {
	const props = { title: 'Les Cavernes Magnétiques', text: 'Un texte original Motion Twin', confirmLabel: 'Continuer' };

	it('shows the original text with all eight message-box sprite segments', () => {
		const wrapper = mount(MtDungeonMessageBox, { props });
		expect(wrapper.get('[role="dialog"]').attributes('aria-modal')).toBe('true');
		expect(wrapper.text()).toContain(props.text);
		expect(wrapper.findAll('.mt-msgbox__piece')).toHaveLength(8);
	});

	it('never settles a reward itself; it emits only explicit confirmation', async () => {
		const wrapper = mount(MtDungeonMessageBox, { props });
		await wrapper.get('button').trigger('click');
		expect(wrapper.emitted('confirm')).toHaveLength(1);
	});

	it('blocks confirmation while server transaction is pending', async () => {
		const wrapper = mount(MtDungeonMessageBox, { props: { ...props, busy: true } });
		await wrapper.get('button').trigger('click');
		expect(wrapper.get('button').attributes('disabled')).toBeDefined();
		expect(wrapper.emitted('confirm')).toBeUndefined();
	});

	it('allows dismissing without settling', async () => {
		const wrapper = mount(MtDungeonMessageBox, { props: { ...props, cancelLabel: 'Plus tard' } });
		await wrapper.findAll('button')[1]!.trigger('click');
		expect(wrapper.emitted('close')).toHaveLength(1);
		expect(wrapper.emitted('confirm')).toBeUndefined();
	});
});
