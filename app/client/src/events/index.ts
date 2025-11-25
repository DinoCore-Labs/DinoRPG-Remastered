import mitt from 'mitt';

type Events = {
	authMenu: {
		show: boolean;
		mode: string;
	};
};

const eventBus = mitt<Events>();

export default eventBus;
