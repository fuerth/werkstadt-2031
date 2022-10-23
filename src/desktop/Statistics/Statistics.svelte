<script>
	import BarChart from "./BarChart.svelte";
	//import WordCloud from './WordCloud.svelte';
	import DonatChart from "./DonatChart.svelte";
	
	import { statisticsStore } from "../stores.js";

	let dataLocation = [];

	$: ageData = $statisticsStore.age || [];
	$: genderData = $statisticsStore.gender || [];
	$: locationData = $statisticsStore.location || [];

	$: dataAge = ageData.reduce((data, entry) => ({
		...data,
		[entry.key]: entry.value
	}), {});

	$: dataGender = genderData.reduce((data, entry) => ({
		...data,
		[entry.key]: entry.value
	}), {});

	$: locationSum = locationData.map(d => d.value).reduce((a, b) => a + b, 0);

	$: {
		const groups = [
			{
				key: "Zentrum",
				keys: ["Innenstadt", "Westvorstadt"],
				value: 0,
				color: "#FF0000"
			},
			{
				key: "Norden",
				keys: ["Vach", "Stadeln", "Ronhof", "Mannhof", "Ritzmannshof", "Atzenhof"],
				value: 0,
				color: "#00FF00"
			},
			{
				key: "Osten",
				keys: ["Stadtgrenze", "Poppenreuth", "Espan"],
				value: 0,
				color: "#FF0000"
			},
			{
				key: "Süden",
				keys: ["Südstadt", "Dambach"],
				value: 0,
				color: "#00FF00"
			},
			{
				key: "Westen",
				keys: ["Hardhöhe", "Eigenes Heim","Burgfarrnbach","Oberfürberg","Unterfürberg","Unterfarrnbach"],
				value: 0,
				color: "#00FF00"
			}
		]

		for (const entry of locationData) {
			let found = false;
			for (const group of groups) {
				if (group.keys.includes(entry.key)) {
					group.value += entry.value / locationSum;
					found = true;
				}
			}
			if (!found) {
				console.warn(`No group found for entry "${entry.key}"`);
			}
		}


		dataLocation = groups;
	}
</script>

<div class="wsf-statistics">
	<section>
		<BarChart 
			title="Altersverteilung" 
			data={dataAge} 
			width=480 
			height=320 
			color="var(--werkstadt-orange)"/>
		<BarChart 
			title="Gender" 
			data={dataGender} 
			width=320 
			height=320
			color="var(--werkstadt-purple)"/>
	</section>
	<section>
		<!-- <WordCloud data={locationData} color="#6bbda5"/> -->
		<!-- <BarChart 
			data={datalocation} 
			width=960 
			height=320 
			fontSize=16
			xVertical=true 
			color="#6bbda5"/> -->
		<DonatChart data={dataLocation} />
	</section>
</div>

<style>
	section {
		display: flex;
		flex-direction: row;
		justify-content: center;
		gap: 1rem;
	}
</style>