import mitt from 'mitt';

type Events = {
	authMenu: {
		show: boolean;
		mode: string;
	};
	userMenu: boolean;
};

const eventBus = mitt<Events>();

export default eventBus;
