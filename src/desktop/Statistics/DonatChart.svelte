<script>
	export let width = 960;
	export let height = 500;
	export let data = [];
	export let fontSize = width*0.03;

	$: centerX = width / 2;
	$: centerY = height / 2;
	$: viewBox = `0 0 ${width} ${height}`;
	$: radius = width*0.15;
	$: radiusDistance = radius*0.25;
	$: maxValue = data.reduce((sum, d) => sum+d.value, 0);
	$: arcs = getArcs(data);
	$: spacing = 1;

	/**
	 * @see http://jsbin.com/quhujowota/1
	 */
	function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
		var angleInRadians = (angleInDegrees-90) * Math.PI / 180;
		return {
			x: centerX + (radius * Math.cos(angleInRadians)),
			y: centerY + (radius * Math.sin(angleInRadians))
		};
	}

	/**
	 * @see http://jsbin.com/quhujowota/1
	 */
	function describeArc(x, y, radius, startAngle, endAngle) {
		var start = polarToCartesian(x, y, radius, endAngle);
		var end = polarToCartesian(x, y, radius, startAngle);
		var largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
		var invert = 0;
		var d = [
			"M", start.x, start.y, 
			"A", radius, radius, 0, largeArcFlag, invert, end.x, end.y
		].join(" ");
		return d;
	}

	function getArcs(data) {
		let lastAngle = 0;
		return data.map((arc, index) => {
			let percentage = arc.value / maxValue;
			let startAngle = lastAngle
			let endAngle = lastAngle = startAngle + 360 * percentage;
			const labelPointPosition = polarToCartesian(centerX, centerY, radius+radiusDistance, endAngle - 360 * percentage / 2);
			const x = labelPointPosition.x;
			const y = labelPointPosition.y;
			const d = describeArc(centerX, centerY, radius, startAngle + spacing, endAngle - spacing);
			return {
				x,
				y,
				d,
				color: arc.color || `rgba(107, 189, 165, ${percentage+0.2})`,
				title: `${arc.title || arc.key} ${(percentage * 100).toFixed(0)}%`,
				subTitle: arc.subTitle || arc.keys.join(', '),
				value: arc.value,
			};
		});
	}
</script>

<div class="wsf-donatchart">
	{#if data && data.length}
	<figure>
		<svg width={width} height={height} {viewBox} >
			{#each arcs as arc}
			<path 
				d={arc.d}
				stroke={arc.color}
				stroke-width="30"
				stroke-linecap="butt"
				fill="none"
			/>
			<circle 
				cx={arc.x}
				cy={arc.y}
				r={radius * 0.03}
				fill={arc.color}
				stroke-width="1"
				stroke="none"
			/>
			<line 
				x1={arc.x}
				y1={arc.y}
				x2={arc.x > centerX ? arc.x+(radius*0.5) : arc.x-(radius*0.5)}
				y2={arc.y}
				stroke={arc.color}
				stroke-width={radius * 0.02}
				stroke-linecap="round"
			/>
			<foreignObject 
				x={arc.x > centerX ? arc.x+(radius*0.6) : arc.x-(radius*0.6)-width*0.2}
				y={arc.y-height*0.05}
				width={width*0.2}
				height={height*0.2}>
				<p xmlns="http://www.w3.org/1999/xhtml"
					style={[
						`color: ${arc.color}`,
						`font-size: ${fontSize}px`,
						`line-height: ${fontSize}px`,
						`text-align: ${arc.x > centerX ? 'left' : 'right'}`,
					].join(';')}>
					{arc.title}
				</p>
			</foreignObject>
			<foreignObject 
				x={arc.x > centerX ? arc.x+(radius*0.6) : arc.x-(radius*0.6)-width*0.2}
				y={arc.y - height*0.05 + fontSize*1}
				width={width*0.2}
				height={height*0.2}>
				<p xmlns="http://www.w3.org/1999/xhtml"
					style={[
						`color: ${arc.color}`,
						`font-size: ${fontSize*0.4}px`,
						`line-height: ${fontSize*0.5}px`,
						`text-align: ${arc.x > centerX ? 'left' : 'right'}`,
					].join(';')}>
					{arc.subTitle}
				</p>
			</foreignObject>
			{/each}
		</svg>
		<figcaption class="sr-only">
			<table border=1>
				<tr>
					<th>Key</th><th>Value</th>
				</tr>
				{#each data as entry}
				<tr>
					<td>{entry.key}</td><td>{entry.value.toFixed(2)}</td>
				</tr>
				{/each}
			</table>
		</figcaption>
	</figure>
	{:else}
	<p>lade Daten...</p>
	{/if}
</div>

<style>
.wsf-donatchart path:hover {
	opacity: 0.5;
}
</style>