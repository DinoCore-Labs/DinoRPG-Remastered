import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import MtDungeonMessageBox from '../../../src/components/dungeon/MtDungeonMessageBox.vue';

describe('Original MT message box (native msgbox sprites)', () => {
	const props = { title: 'Les Cavernes Magnétiques', text: 'Texte Motion Twin', confirmLabel: 'Continuer' };

	it('composes the eight original pieces in the dialogue variant', () => {
		const wrapper = mount(MtDungeonMessageBox, { props });
		expect(wrapper.findAll('.mt-msgbox__piece')).toHaveLength(8);
		expect(wrapper.get('[role="dialog"]').attributes('aria-modal')).toBe('true');
		expect(wrapper.get('.mt-msgbox__title').text()).toBe(props.title);
		expect(wrapper.get('.mt-msgbox__text').text()).toBe(props.text);
		expect(wrapper.find('.mt-scroll').exists()).toBe(false);
	});

	it('shows a compact notice without title, visible action button or screen dimmer', async () => {
		const wrapper = mount(MtDungeonMessageBox, {
			props: { ...props, variant: 'notice', placement: 'viewport' }
		});
		expect(wrapper.get('.mt-msgbox-overlay--viewport').exists()).toBe(true);
		expect(wrapper.get('[role="dialog"]').attributes('aria-modal')).toBe('false');
		expect(wrapper.find('.mt-msgbox__title').exists()).toBe(false);
		expect(wrapper.get('.mt-msgbox__notice-button').text()).toBe(props.text);
		expect(wrapper.find('.mt-msgbox__actions').exists()).toBe(false);
		await wrapper.get('.mt-msgbox__notice-button').trigger('click');
		expect(wrapper.emitted('confirm')).toHaveLength(1);
	});

	it('does not confirm or dismiss while a server operation is busy', async () => {
		const wrapper = mount(MtDungeonMessageBox, {
			props: { ...props, variant: 'notice', busy: true }
		});
		await wrapper.get('.mt-msgbox__notice-button').trigger('click');
		await wrapper.get('.mt-msgbox-overlay').trigger('click');
		expect(wrapper.emitted('confirm')).toBeUndefined();
		expect(wrapper.emitted('close')).toBeUndefined();
	});

	it('does not silently dismiss a mandatory narrative by clicking outside', async () => {
		const wrapper = mount(MtDungeonMessageBox, { props });
		await wrapper.get('.mt-msgbox-overlay').trigger('click');
		expect(wrapper.emitted('close')).toBeUndefined();
		await wrapper.get('.mt-msgbox__actions button').trigger('click');
		expect(wrapper.emitted('confirm')).toHaveLength(1);
	});

	it('allows an explicit cancel without confirming a scenario', async () => {
		const wrapper = mount(MtDungeonMessageBox, { props: { ...props, cancelLabel: 'Plus tard' } });
		await wrapper.findAll('.mt-msgbox__actions button')[1]!.trigger('click');
		expect(wrapper.emitted('close')).toHaveLength(1);
		expect(wrapper.emitted('confirm')).toBeUndefined();
	});
});
