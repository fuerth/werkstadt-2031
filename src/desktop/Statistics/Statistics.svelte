<script>
	import BarChart from "./BarChart.svelte";
	//import WordCloud from './WordCloud.svelte';
	//import DonatChart from "./DonatChart.svelte";
	
	import { statisticsStore } from "../stores.js";

	let dataLocation = [];
	let ageSubtitle = null;
	let genderSubtitle = null;

	$: ageData = $statisticsStore.age || [];
	$: genderData = $statisticsStore.gender || [];
	$: locationData = $statisticsStore.location || [];

	$: dataAge = ageData.filter(entry => entry.key !== 'unknown').reduce((data, entry) => ({
		...data,
		[entry.key]: entry.value
	}), {});

	$: {
		const unknownEntry = ageData ? ageData.find(entry => entry.key === 'unknown') : null;
		const unknownCount = unknownEntry ? unknownEntry.value : null;
		ageSubtitle = unknownCount ? `${unknownCount} ${unknownCount > 1 ? 'Menschen' : 'Mensch'} haben keine Angabe gemacht` : null;
	}

	$: dataGender = genderData.filter(entry => entry.key !== 'unknown').reduce((data, entry) => ({
		...data,
		[entry.key]: entry.value
	}), {});

	$: {
		const unknownEntry = genderData? genderData.find(entry => entry.key === 'unknown') : null;
		const unknownCount = unknownEntry ? unknownEntry.value : null;
		genderSubtitle = unknownCount ? `${unknownCount} ${unknownCount > 1 ? 'Menschen' : 'Mensch'} haben keine Angabe gemacht` : null;
	}

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
			subtitle={ageSubtitle} 
			data={dataAge} 
			width=480 
			height=320 
			color="var(--werkstadt-orange)"/>
		<BarChart 
			title="Geschlecht" 
			subtitle={genderSubtitle}
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
		<img src="./location_statistics.svg" alt="" width="80%"/>
		<!-- <DonatChart data={dataLocation} /> -->
	</section>
</div>

<style>
	section {
		display: flex;
		flex-direction: row;
		justify-content: center;
		gap: 1rem;
	}

@media (max-width: 1024px) {
	section {
		flex-direction: column;
	}
}
</style>