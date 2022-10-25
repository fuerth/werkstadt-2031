
<script>
	export let data = [];
	export let width = 320;
	export let height = 320;
	export let color = "rgb(0, 0, 255)";
	export let title = null;
	export let xVertical = false;
	export let fontSize = Math.abs(height*0.06);
	export let subtitle = null;

	const DEBUG = false;

	const marginTop = height*0.1;
	const marginBottom = xVertical ? height*0.3: height*0.1;
	const marginRight = width*0.15;
	const marginLeft = width*0.15;


	$: chartWidth = width-marginLeft-marginRight;
	$: chartHeight = height-marginTop-marginBottom;

	$: labelsHeight = fontSize*2;
	$: canvasHeight = chartHeight - labelsHeight;

	$: barCount = Object.keys(data).length;

	$: bars = Object.keys(data).map(key => {
		return {
			label: `${key}`,
			value: data[key],
		}
	});

	$: maxValue = Math.max(...bars.map(bar => bar.value));

	$: barWidth = chartWidth / barCount * 0.65;

	$: barSpacing = (chartWidth-(barWidth*barCount)) / (barCount-1);
</script>

<div class="wsf-barchart">
	{#if title}
	<h3 class="wsf-barchart__title" style="font-size:{fontSize}px;background-color:{color}">{title}</h3>
	{/if}

	{#if DEBUG}
	<dl>
		<dt>maxValue</dt><dd>{maxValue}</dd>
		<dt>barCount</dt><dd>{barCount}</dd>
		<dt>barWidth</dt><dd>{barWidth}</dd>
		<dt>barSpacing</dt><dd>{barSpacing}</dd>
	</dl>
	{/if}

	<figure>
		<svg class="wsf-barchart__chart" {width} {height} viewBox="0 0 {width} {height}">
			{#if DEBUG}
			<!-- show the drawing canvas -->
			<rect 
				x={marginLeft}
				y={marginTop}
				width={chartWidth}
				height={canvasHeight}
				style:fill="transparent" style:stroke="red"
			/>
			<!-- show the labels area -->
			<rect 
				x={marginLeft}
				y={marginTop+canvasHeight}
				width={chartWidth}
				height={labelsHeight}
				style:fill="transparent" style:stroke="green"
			/>
			{/if}

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
			<rect 
				x={marginLeft + index*barWidth + index*barSpacing} 
				y={marginTop + canvasHeight-((bar.value/maxValue)*canvasHeight)} 
				width={barWidth} 
				height={(bar.value/maxValue)*canvasHeight} 
				style:fill={color} 
			/>
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
	align-items: center;
	justify-content: center;
	background-color: rgba(0, 0, 0, 0);
}

h3.wsf-barchart__title {
	color: white;
	padding: 0.25em 1em;
	border-radius: 0.75em;
	font-weight: bold;
}
svg.wsf-barchart__chart {
	font-family: Arial, sans-serif;
}

svg.wsf-barchart__chart rect:hover {
	opacity: 0.5;
}
</style>
