<template>
	<table>
		<tbody>
			<slot />
		</tbody>
	</table>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'DZTable'
});
</script>

<style lang="scss" scoped>
table {
	width: 98%;
	align-self: center;
	margin-top: 10px;
	margin-bottom: 5px;
	background-color: #ecbd84;
	border-collapse: separate;
	border-spacing: 1px;
	:deep(tr) {
		display: table-row;
		cursor: help;
		th {
			font-size: 8pt;
			text-shadow: 1px 1px 0px #356847;
			height: 41px;
			vertical-align: bottom;
			color: #fffdba;
			text-transform: uppercase;
			font-weight: bold;
			letter-spacing: 1pt;
			text-align: left;
			white-space: nowrap;
			border: 1px solid #356847;
			background-color: #c64e36;
			background-image: url('../../assets/background/table_header.webp');
			background-position: left bottom;
			padding-left: 4px;
			padding-right: 4px;
			padding-bottom: 8px;
		}
		td {
			font-size: 9pt;
			font-family: 'Trebuchet MS', Arial, sans-serif;
			color: #710;
			background-color: #f3ca92;
			border: 1px solid #c88f44;
			background-image: url('../../assets/background/table_cell.webp');
			background-position: -10px 0px;
			padding: 2px 4px;
		}
		&.full td {
			background-image: url('../../assets/background/table_cell_hover.webp') !important;
			background-position: -10px 0px;
			color: #fffdba;
		}
		&.even td {
			background-image: url('../../assets/background/table_cell_even.webp');
			background-position: -10px 0px;
		}
	}
}
</style>
