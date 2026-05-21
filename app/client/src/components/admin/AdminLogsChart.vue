<template>
	<div class="chart">
		<div v-if="highlightExtremes && hasExtremes" class="legend">
			<span class="legend__item legend__item--max">Plus haut : {{ maxValue }}</span>
			<span class="legend__item legend__item--min">Plus bas : {{ minValue }}</span>
		</div>
		<VChart class="chart__canvas" :option="option" autoresize />
	</div>
</template>

<script setup lang="ts">
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { computed } from 'vue';
import VChart from 'vue-echarts';

use([CanvasRenderer, LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent]);

const MAX_COLOR = '#2f9e44';
const MIN_COLOR = '#e03131';

const props = withDefaults(
	defineProps<{
		title: string;
		labels: string[];
		values: number[];
		type?: 'bar' | 'line';
		highlightExtremes?: boolean;
	}>(),
	{
		type: 'bar',
		highlightExtremes: true
	}
);

const maxValue = computed(() => Math.max(...props.values));
const minValue = computed(() => Math.min(...props.values));

const hasExtremes = computed(() => {
	return props.values.length > 1 && maxValue.value !== minValue.value;
});

const seriesData = computed(() => {
	if (!props.highlightExtremes || !hasExtremes.value) {
		return props.values;
	}

	return props.values.map(value => {
		if (value === maxValue.value) {
			return {
				value,
				itemStyle: {
					color: MAX_COLOR
				}
			};
		}
		if (value === minValue.value) {
			return {
				value,
				itemStyle: {
					color: MIN_COLOR
				}
			};
		}
		return value;
	});
});

const option = computed(() => ({
	tooltip: {
		trigger: 'axis'
	},
	grid: {
		left: 40,
		right: 20,
		top: props.highlightExtremes ? 42 : 30,
		bottom: 35
	},
	xAxis: {
		type: 'category',
		data: props.labels
	},
	yAxis: {
		type: 'value'
	},
	series: [
		{
			name: props.title,
			type: props.type,
			data: seriesData.value,
			smooth: props.type === 'line'
		}
	]
}));
</script>

<style scoped lang="scss">
.chart {
	width: 100%;
	height: 350px;
	margin-top: 12px;
}
.chart__canvas {
	width: 100%;
	height: 320px;
}
.legend {
	display: flex;
	gap: 12px;
	margin-bottom: 6px;
	font-size: 9pt;
	font-weight: bold;
}
.legend__item {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	&::before {
		content: '';
		width: 10px;
		height: 10px;
		border-radius: 50%;
	}
}
.legend__item--max::before {
	background: #2f9e44;
}
.legend__item--min::before {
	background: #e03131;
}
</style>
