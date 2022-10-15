<script>
    import BarChart from "./BarChart.svelte";

    import { statisticsStore } from "../stores.js";

    $: ageData = $statisticsStore.age || [];
    $: genderData = $statisticsStore.gender || [];

    $: dataAge = ageData.reduce((data, entry) => ({
        ...data,
        [entry.key]: entry.value
    }), {});

    $: dataGender = genderData.reduce((data, entry) => ({
        ...data,
        [entry.key]: entry.value
    }), {});

    $: entrySum = 333; //TODO get from data
</script>

<div class="wsf-statistics">
    <header>
        <h2>Statistics</h2>
    </header>
    <main>
        <div>
            <h3>Warum keine soziographischen Daten?</h3>
            <p>
                Uns wurde schnell bewusst, dass wir mit unseren begrenzten Mitteln keine wissenschaftlichen Anspruch genügen können. 
                Bei einem Großteil der Befragten hielten wir Alter und Geschlacht fest. 
                Sie sehen die Daten von {entrySum} Bürger:innen, der Rest wurde diesbezüglich nicht erfasst oder enthilet sich.
            </p>
        </div>
        <section>
            <BarChart 
                title="Altersverteilung" 
                data={dataAge} 
                width=480
                height=320
                color="blue"/>
            <BarChart 
                title="Gender*"
                data={dataGender}
                width=320
                height=320
                color="green"/>
            <p class="wfs-gender-statement">
                *die Repräsentation ist nicht unsere Intention. Wir unterstützen jeglichen Ausdruck und jede Orientierung des eigenen GEschlechts.<br>
                <em>#womanpower</em>
                <em>#geschlechtergleichberechtigung</em>
            </p>
        </section>
    </main>
</div>

<style>
    .wsf-statistics {
        color: green;
    }

    h2 {
        font-size: 2rem;
        margin: 1rem 0;
    }

    section {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 1rem;
    }

    .wfs-gender-statement {
        rotate: 270deg;
    }
</style>