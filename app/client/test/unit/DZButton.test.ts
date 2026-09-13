import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import DZButton from '../../src/components/utils/DZButton.vue';

describe('DZButton', () => {
	it('renders a native button by default', () => {
		const wrapper = mount(DZButton, {
			slots: {
				default: 'Jouer'
			}
		});
		const button = wrapper.get('button');
		expect(button.text()).toBe('Jouer');
		expect(button.attributes('type')).toBe('button');
		expect(button.classes()).toContain('button');
		expect(button.classes()).toContain('button--normal');
	});
	it('emits click when enabled', async () => {
		const wrapper = mount(DZButton);
		await wrapper.get('button').trigger('click');
		expect(wrapper.emitted('click')).toHaveLength(1);
	});
	it('does not emit click when disabled', async () => {
		const wrapper = mount(DZButton, {
			props: {
				disabled: true
			}
		});
		const button = wrapper.get('button');
		expect(button.attributes('disabled')).toBeDefined();
		expect(button.classes()).toContain('button--disabled');
		await button.trigger('click');
		expect(wrapper.emitted('click')).toBeUndefined();
	});
	it('renders an anchor when href is provided', () => {
		const wrapper = mount(DZButton, {
			props: {
				href: '/help'
			},
			slots: {
				default: 'Aide'
			}
		});
		const link = wrapper.get('a');
		expect(link.attributes('href')).toBe('/help');
		expect(link.text()).toBe('Aide');
	});
	it('supports the small size', () => {
		const wrapper = mount(DZButton, {
			props: {
				size: 'small'
			}
		});
		expect(wrapper.classes()).toContain('button--small');
	});
});
