<script>
	import BarChart from "./BarChart.svelte";
	import DonatChart from "./DonatChart.svelte";
	
	import { statisticsStore } from "../stores.js";

	let dataLocation = [];
	let ageSubtitle = null;
	let genderSubtitle = null;
	let locationSubtitle = null;

	$: ageData = $statisticsStore.age || [];
	$: genderData = $statisticsStore.gender || [];
	$: locationData = $statisticsStore.location || [];

	$: dataAge = ageData.filter(entry => entry.key !== 'unknown');

	$: {
		const unknownEntry = ageData ? ageData.find(entry => entry.key === 'unknown') : null;
		const unknownCount = unknownEntry ? unknownEntry.value : null;
		ageSubtitle = unknownCount 
			? `${unknownCount} ${unknownCount > 1 ? 'Menschen haben' 
			: 'Mensch hat'} keine Angabe gemacht` : null;
	}

	$: dataGender = genderData.filter(entry => entry.key !== 'unknown');

	$: {
		const unknownEntry = genderData? genderData.find(entry => entry.key === 'unknown') : null;
		const unknownCount = unknownEntry ? unknownEntry.value : null;
		genderSubtitle = unknownCount 
			? `${unknownCount} ${unknownCount > 1 ? 'Menschen haben' 
			: 'Mensch hat'} keine Angabe gemacht` : null;
	}

	$: locationSum = locationData
		.map(d => d.value)
		.reduce((a, b) => a + b, 0);

	$: {
		const unknownEntry = locationData? locationData.find(entry => entry.key === 'unknown') : null;
		const unknownCount = unknownEntry ? unknownEntry.value : null;
		locationSubtitle = unknownCount 
			? `${unknownCount} ${unknownCount > 1 ? 'Menschen haben' 
			: 'Mensch hat'} keine Angabe gemacht` : null;
	}

	$: {
		const groups = [
			{
				key: "Zentrum",
				keys: ["Innenstadt", "Westvorstadt"],
				value: 0,
				color: "rgba(60, 188, 150, 1)",
			},
			{
				key: "Osten",
				keys: ["Stadtgrenze", "Poppenreuth", "Espan"],
				value: 0,
				color: "rgba(60, 188, 150, 0.4)",
			},
			{
				key: "Süden",
				keys: ["Südstadt", "Dambach"],
				value: 0,
				color: "rgba(60, 188, 150, 0.9)",
			},
			{
				key: "Norden",
				keys: ["Vach", "Stadeln", "Ronhof", "Mannhof", "Ritzmannshof", "Atzenhof"],
				value: 0,
				color: "rgba(60, 188, 150, 0.6)",
			},
			{
				key: "Westen",
				keys: ["Hardhöhe", "Eigenes Heim","Burgfarrnbach","Oberfürberg","Unterfürberg","Unterfarrnbach"],
				value: 0,
				color: "rgba(60, 188, 150, 0.8)",
			}
		]

		for (const entry of locationData) {
			let found = false;
			for (const group of groups.filter(entry => entry.key !== 'unknown')) {
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
		<div class="chart">
			<BarChart 
				title="Altersverteilung" 
				subtitle={ageSubtitle} 
				data={dataAge} 
				width=480 
				height=320 
				color="var(--werkstadt-orange)"/>
		</div>
		<div class="chart">
			<BarChart 
				title="Geschlecht" 
				subtitle={genderSubtitle}
				data={dataGender} 
				width=480 
				height=320
				color="var(--werkstadt-purple)"/>
		</div>
	</section>
	<section>
		<div class="chart">
			<DonatChart 
				width=800 
				height=500 
				color="rgba(60, 188, 150, 1)" 
				subtitle={locationSubtitle}
				data={dataLocation} />
		</div>
	</section>
</div>

<style>
	section {
		display: flex;
		flex-direction: row;
		justify-content: center;
		gap: 1rem;
	}

	section > .chart {
		flex-grow: 1;
		align-items: stretch;
	}

@media (max-width: 800px) {
	section {
		flex-direction: column;
	}
}
</style>