import App from './App/App.svelte';
import Statistics from './Statistics/Statistics.svelte';

export const statistics = new Statistics({
	target: document.getElementById('werkstadt-2031-statistics')
});

const app = new App({
	target: document.getElementById('werkstadt-2031-app')
});

export default app;