import mitt from 'mitt';

type Events = {
	authMenu: boolean;
};

const eventBus = mitt<Events>();

export default eventBus;
