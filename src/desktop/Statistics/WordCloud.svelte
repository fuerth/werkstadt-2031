<svelte:head>
	<script src="//unpkg.com/d3@5.15.0/dist/d3.min.js"></script>
	<script src="//unpkg.com/d3-cloud@1.2.5/build/d3.layout.cloud.js"></script>
</svelte:head>

<svelte:window on:load={showWordCloud}/>

<script>
	export let data = [];
	export let color = "#6bbda5";

	const id = "wsf-word-cloud";

	function showWordCloud() {
		var cloud = d3.layout.cloud;
		const element = document.getElementById(id);
		element.innerHTML = "";

		const width = element.parentElement.clientWidth * 0.9;
		const height = width > 300 ? width*0.5 : width;

		const maxLength = Math.max(...data.map(s => s.key.length));
		const maxValue = Math.max(...data.map(s => s.value));

		function opacity(d) {
			return d.text.length / maxLength;
		}

		var layout = cloud()
			.size([width, height])
			.words(
				data.map(d => ({ text: d.key, size: 16+(d.value*0.2) }))
			)
			.padding(1)
			.rotate(() => {
				return 0;
			})
			.font("Arial")
			.fontSize((d) => {
				return d.size;
			})
			.on("end", drawWords);

		function drawWords(words) {
			d3.select(`#${id}`)
				.append("svg")
				.attr("width", layout.size()[0])
				.attr("height", layout.size()[1])
				.append("g")
				.attr(
					"transform",
					"translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")"
				)
				.selectAll("text")
				.data(words)
				.enter()
				.append("text")
				.style("font-size", (d) => {
					return d.size + "px";
				})
				.style("font-family", "Arial")
				.style("fill", color)
				.style("opacity", opacity)
				.attr("text-anchor", "middle")
				.attr("transform", (d) => {
					return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
				})
				.text((d) => {
					return d.text;
				});
		}

		layout.start();
	}
</script>

<div class="wsf-word-cloud" id="wsf-word-cloud">
	{#if data && data.length}
	<dl>
		{#each data as entry}
		<dt>{entry.key}</dt><dd>{entry.value}</dd>
		{/each}
	</dl>
	{:else}
	<p>lade Daten...</p>
	{/if}
</div>