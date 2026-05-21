<template>
	<div class="chart">
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

const props = withDefaults(
	defineProps<{
		title: string;
		labels: string[];
		values: number[];
		type?: 'bar' | 'line';
	}>(),
	{
		type: 'bar'
	}
);

const option = computed(() => ({
	tooltip: {
		trigger: 'axis'
	},
	grid: {
		left: 40,
		right: 20,
		top: 30,
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
			data: props.values,
			smooth: props.type === 'line'
		}
	]
}));
</script>

<style scoped lang="scss">
.chart {
	width: 100%;
	height: 320px;
	margin-top: 12px;
}
.chart__canvas {
	width: 100%;
	height: 100%;
}
</style>
