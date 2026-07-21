<template>
	<main class="maintenance-page">
		<section class="maintenance-card">
			<h1>{{ $t('maintenancepage.title') }}</h1>
			<p>
				{{ $t('maintenancepage.description') }}
			</p>
			<router-link :to="{ name: 'HomePage', query: { admin: '1' } }" class="login-link">
				{{ $t('maintenancepage.login') }}
			</router-link>
		</section>
	</main>
</template>

<style lang="scss" scoped>
.maintenance-page {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	padding: 20px;
	background: #5b351f;
}
.maintenance-card {
	max-width: 560px;
	padding: 24px;
	text-align: center;
	color: #fce3bc;
	background: #8f4f2e;
	border: 2px solid #ffee92;
	border-radius: 8px;
	box-shadow: 0 4px 0 #3b2115;
	h1 {
		margin-bottom: 16px;
		color: #ffee92;
		font-size: 24px;
	}
	p {
		margin-bottom: 20px;
		line-height: 1.5;
	}
	.login-link {
		display: inline-block;
		padding: 8px 14px;
		color: #5b351f;
		font-weight: bold;
		text-decoration: none;
		background: #ffee92;
		border-radius: 4px;
		&:hover {
			filter: brightness(1.08);
		}
	}
}
</style>
