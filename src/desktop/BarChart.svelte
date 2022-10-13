
<script>
    export let data = [];
    export let width = 320;
    export let height = 320;
    export let color = "rgb(0, 0, 255)";

    const DEBUG = false;

    const marginTop = height*0.1;
    const marginBottom = height*0.1;
    const marginRight = width*0.1;
    const marginLeft = width*0.1;

    const fontSize = Math.abs(width*0.05);

    $: chartWidth = width-marginLeft-marginRight;
    $: chartHeight = height-marginTop-marginBottom;

    $: canvasHeight = chartHeight * 0.85;
    $: labelsHeight = chartHeight * 0.15;

    $: barCount = Object.keys(data).length;

    $: bars = Object.keys(data).map(key => {
        return {
            label: `${key}`,
            value: data[key],
        }
    });

    $: maxValue = Math.max(...bars.map(bar => bar.value));

    $: barWidth = chartWidth / barCount * 0.5;

    $: barSpacing = (chartWidth-(barWidth*barCount)) / (barCount-1);
</script>

{#if DEBUG}
<dl>
    <dt>maxValue</dt><dd>{maxValue}</dd>
    <dt>barCount</dt><dd>{barCount}</dd>
    <dt>barWidth</dt><dd>{barWidth}</dd>
    <dt>barSpacing</dt><dd>{barSpacing}</dd>
</dl>
{/if}

<svg {width} {height} viewBox="0 0 {width} {height}">
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
        y={marginTop + canvasHeight + labelsHeight/2}
        dominant-baseline="middle" text-anchor="middle"
        style:fill={color}
        style:font-size={fontSize + 'px'}
    >{bar.label}</text>
    {/each}
</svg>

<!-- For screenreaders:
<table>
    <thead>
        <tr>
            <th>key</th>
            <th>value</th>
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
-->


<style>
svg {
    background-color: rgba(0, 0, 0, 0.025);
    font-family: Arial, sans-serif;
}
</style>
