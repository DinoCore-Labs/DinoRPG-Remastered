import { defineConfig } from 'vitepress';

export default defineConfig({
	lang: 'fr-FR',
	title: 'Wiki DinoRPG Remastered',
	description: 'Encyclopédie, guides et documentation du projet DinoRPG Remastered.',
	cleanUrls: true,
	lastUpdated: true,
	// Utiliser "/" avec un domaine personnalisé comme wiki.example.fr.
	// Utiliser "/DinoRPG-Remastered/" avec les GitHub Pages du dépôt.
	base: process.env.WIKI_BASE ?? '/',
	head: [
		['meta', { name: 'theme-color', content: '#5d8239' }],
		['link', { rel: 'icon', href: '/images/logo/favicon.png' }]
	],
	themeConfig: {
		logo: '/images/logo.png',
		siteTitle: 'DinoRPG Remastered',
		search: {
			provider: 'local'
		},
		nav: [
			{
				text: 'Accueil',
				link: '/'
			},
			{
				text: 'Encyclopédie',
				link: '/encyclopedie/'
			},
			{
				text: 'Guides',
				link: '/guides/'
			},
			{
				text: 'Développement',
				link: '/technique/'
			},
			{
				text: 'Contribuer',
				link: '/contribution/'
			}
		],
		sidebar: {
			'/encyclopedie/': [
				{
					text: 'Encyclopédie',
					items: [
						{
							text: 'Présentation',
							link: '/encyclopedie/'
						},
						{
							text: 'Dinoz',
							link: '/encyclopedie/dinoz/'
						},
						{
							text: 'Objets',
							link: '/encyclopedie/objets/'
						},
						{
							text: 'Compétences',
							link: '/encyclopedie/competences/'
						},
						{
							text: 'Monstres',
							link: '/encyclopedie/monstres/'
						},
						{
							text: 'Lieux',
							link: '/encyclopedie/lieux/'
						},
						{
							text: 'Missions',
							link: '/encyclopedie/missions/'
						},
						{
							text: 'Scénarios',
							link: '/encyclopedie/scenarios/'
						}
					]
				}
			],
			'/guides/': [
				{
					text: 'Guides du jeu',
					items: [
						{
							text: 'Bien débuter',
							link: '/guides/commencer'
						},
						{
							text: 'Les combats',
							link: '/guides/combats'
						},
						{
							text: 'La progression',
							link: '/guides/progression'
						}
					]
				}
			],
			'/technique/': [
				{
					text: 'Documentation technique',
					items: [
						{
							text: 'Présentation',
							link: '/technique/'
						},
						{
							text: 'Architecture',
							link: '/technique/architecture'
						},
						{
							text: 'Frontend',
							link: '/technique/frontend'
						},
						{
							text: 'Backend',
							link: '/technique/backend'
						},
						{
							text: 'Déploiement',
							link: '/technique/deploiement'
						}
					]
				}
			]
		},
		socialLinks: [
			{
				icon: 'github',
				link: 'https://github.com/DinoCore-Labs/DinoRPG-Remastered'
			}
		],
		editLink: {
			pattern: 'https://github.com/DinoCore-Labs/DinoRPG-Remastered/edit/main/app/wiki/:path',
			text: 'Modifier cette page sur GitHub'
		},
		footer: {
			message: 'Projet communautaire indépendant. DinoRPG a été créé par Motion Twin.',
			copyright: 'DinoRPG Remastered'
		},
		docFooter: {
			prev: 'Page précédente',
			next: 'Page suivante'
		},
		lastUpdated: {
			text: 'Dernière mise à jour'
		},
		outline: {
			label: 'Sur cette page',
			level: [2, 3]
		}
	}
});
