<script>
	import BarChart from "./BarChart.svelte";
	//import WordCloud from './WordCloud.svelte';
	import DonatChart from "./DonatChart.svelte";
	
	import { statisticsStore } from "../stores.js";

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

	$: datalocation = locationData.sort((a, b) => b.value - a.value).reduce((data, entry) => ({
		...data,
		[entry.key]: entry.value
	}), {});
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
		<BarChart 
			data={datalocation} 
			width=960 
			height=320 
			fontSize=16
			xVertical=true 
			color="#6bbda5"/>
		<!-- <DonatChart data={locationData} /> -->
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