
<script>
	export let data = [];
	export let width = 320;
	export let height = 320;
	export let color = "rgb(0, 0, 255)";
	export let title = null;
	export let xVertical = false;
	export let fontSize = Math.abs(height*0.06);
	export let subtitle = null;

	const marginTop = height*0.1;
	const marginBottom = xVertical ? height*0.3: height*0.1;
	const marginRight = width*0.15;
	const marginLeft = width*0.15;


	$: chartWidth = width-marginLeft-marginRight;
	$: chartHeight = height-marginTop-marginBottom;

	$: labelsHeight = fontSize*2;
	$: canvasHeight = chartHeight - labelsHeight;

	$: barCount = data.length;

	$: bars = data.map(entry => {
		return {
			label: `${entry.key}`,
			value: entry.value,
		}
	});

	$: maxValue = Math.max(...bars.map(bar => bar.value));

	$: barWidth = chartWidth / barCount * 0.65;

	$: barSpacing = (chartWidth-(barWidth*barCount)) / (barCount-1);
</script>

<div class="wsf-barchart">
	{#if title}
	<h3 class="wsf-barchart__title" style="background-color:{color}">{title}</h3>
	{/if}

	<figure>
		<svg class="wsf-barchart__chart"
			width="100%"
			height="100%"
			viewBox="0 0 {width} {height}">

			{#if !bars || !bars.length }
			<text
				x={width/2}
				y={height/2}
				dominant-baseline="middle" text-anchor="middle"
				style:fill={color}
			>lade Daten...</text>
			{/if}

			<!-- draw the bars -->
			{#each bars as bar, index}
			<g>
				<rect 
					x={marginLeft + index*barWidth + index*barSpacing} 
					y={marginTop + canvasHeight-((bar.value/maxValue)*canvasHeight)} 
					width={barWidth} 
					height={(bar.value/maxValue)*canvasHeight} 
					style:fill={color} 
					title={bar.value}
				/>
				<title>{bar.value}</title>
			</g>
			{/each}

			<!-- draw the x-axes labels -->
			{#each bars as bar, index}
			<text 
				x={marginLeft + (index)*barWidth + barWidth/2 + index*barSpacing} 
				y={
					!xVertical && 
					barCount > 3 && index%2 ? 
					(marginTop + canvasHeight + fontSize*1.75)
					: (marginTop + canvasHeight + fontSize*.75)
					
				}
				dominant-baseline="{ xVertical ? 'start' : 'middle' }"
				text-anchor="{ xVertical ? 'start' : 'middle' }"
				writing-mode="{ xVertical ? 'tb' : 'lr'}"
				style:fill={color}
				style:font-size={fontSize + 'px'}
				style:font-weight="bold"
			>{bar.label}</text>
			{/each}

			{#if subtitle}
			<text
				x={width/2}
				y={marginTop+chartHeight+fontSize}
				dominant-baseline='middle'
				text-anchor='middle'
				style:fill={color}
			>{subtitle}</text>
			{/if}
		</svg>
		<figcaption class="sr-only" >
			<table border="1">
				<thead>
					<tr>
						<th>{title || "Key"}</th>
						<th>Anzahl</th>
					</tr>
				</thead>
				<tbody>
					{#each bars as bar, index}
					<tr>
						<td>{bar.label}</td>
						<td>{bar.value}</td>
					</tr>
					{/each}
				</tbody>
			</table>
		</figcaption>
	</figure>
</div>


<style>
.wsf-barchart {
	display: flex;
	flex-direction: column;
	justify-content: center;
}
h3.wsf-barchart__title {
	color: white;
	padding: 0.25em 1em;
	border-radius: 0.75em;
	font-size: 150%;
	font-weight: bold;
	max-width: fit-content;
	margin: 0 auto;
}
svg.wsf-barchart__chart {
	font-family: Arial, sans-serif;
}

svg.wsf-barchart__chart rect:hover {
	opacity: 0.5;
}

.sr-only {
	position: absolute;
	left: -10000px;
	top: auto;
	width: 1px;
	height: 1px;
	overflow: hidden;
}
</style>
