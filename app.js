/* =========================================================
PLANOS — APP.JS
Conexão entre HTML + INDICADORES + GRÁFICO
========================================================= */

import {
analyzeMarket,
formatIndicatorValue,
getSignalClass
} from "./indicators.js";

/* =========================================================
CONFIGURAÇÕES
========================================================= */

const BINANCE_API =
"https://api.binance.com/api/v3/klines";

const CHART_LIBRARY =
"https://unpkg.com/lightweight-charts@4.2.0/dist/lightweight-charts.standalone.production.js";

const UPDATE_INTERVAL = 30000;

const CANDLE_LIMIT = 200;

/* =========================================================
ESTADO
========================================================= */

const state = {


symbol: "BTCUSDT",

interval: "15m",

candles: [],

analysis: null,

loading: false,

chart: null,

candleSeries: null,

volumeSeries: null


};

/* =========================================================
ELEMENTOS
========================================================= */

const assetSelect =
document.getElementById("assetSelect");

const timeframeSelect =
document.getElementById("timeframeSelect");

const analyzeBtn =
document.getElementById("analyzeBtn");

const summaryAsset =
document.getElementById("summaryAsset");

const currentPrice =
document.getElementById("currentPrice");

const priceChange =
document.getElementById("priceChange");

const marketSignal =
document.getElementById("marketSignal");

const chartElement =
document.getElementById("chart");

const chartTitle =
document.getElementById("chartTitle");

const chartSubtitle =
document.getElementById("chartSubtitle");

const rsiValue =
document.getElementById("rsiValue");

const rsiBar =
document.getElementById("rsiBar");

const macdSignal =
document.getElementById("macdSignal");

const macdStatus =
document.getElementById("macdStatus");

const emaSignal =
document.getElementById("emaSignal");

const emaStatus =
document.getElementById("emaStatus");

const volumeValue =
document.getElementById("volumeValue");

const volumeStatus =
document.getElementById("volumeStatus");

const analysisTitle =
document.getElementById("analysisTitle");

const analysisBadge =
document.getElementById("analysisBadge");

const analysisText =
document.getElementById("analysisText");

const trendValue =
document.getElementById("trendValue");

const momentumValue =
document.getElementById("momentumValue");

const volatilityValue =
document.getElementById("volatilityValue");

const confidenceValue =
document.getElementById("confidenceValue");

const signalCard =
document.getElementById("signalCard");

const signalTitle =
document.getElementById("signalTitle");

const signalDescription =
document.getElementById("signalDescription");

const signalConfidence =
document.getElementById("signalConfidence");

/* =========================================================
INICIALIZAÇÃO
========================================================= */

document.addEventListener(
"DOMContentLoaded",
initialize
);

async function initialize() {

```
console.log(
    "================================="
);

console.log(
    "PLANOS — iniciando aplicação"
);

console.log(
    "================================="
);


verifyHTML();


setupEvents();


updateInterfaceTexts();


try {

    await loadChartLibrary();

    createChart();

    await loadMarketData();

    startAutoUpdate();

}

catch (error) {

    console.error(
        "Erro durante inicialização:",
        error
    );

    showError(
        "Não foi possível iniciar o gráfico."
    );
}
```

}

/* =========================================================
VERIFICAR HTML
========================================================= */

function verifyHTML() {


const requiredElements = [

    ["assetSelect", assetSelect],

    ["timeframeSelect", timeframeSelect],

    ["analyzeBtn", analyzeBtn],

    ["chart", chartElement],

    ["currentPrice", currentPrice],

    ["marketSignal", marketSignal],

    ["rsiValue", rsiValue],

    ["macdSignal", macdSignal],

    ["emaSignal", emaSignal],

    ["volumeValue", volumeValue]
];


requiredElements.forEach(
    ([name, element]) => {

        if (!element) {

            console.error(
                `PLANOS: elemento #${name} não encontrado.`
            );

        }

    }
);


}

/* =========================================================
EVENTOS
========================================================= */

function setupEvents() {

```
if (assetSelect) {

    assetSelect.addEventListener(
        "change",
        async () => {

            state.symbol =
                assetSelect.value;

            updateInterfaceTexts();

            await loadMarketData();
        }
    );
}


if (timeframeSelect) {

    timeframeSelect.addEventListener(
        "change",
        async () => {

            state.interval =
                timeframeSelect.value;

            updateTimeButtons();

            updateInterfaceTexts();

            await loadMarketData();
        }
    );
}


if (analyzeBtn) {

    analyzeBtn.addEventListener(
        "click",
        async () => {

            await loadMarketData();
        }
    );
}


const timeButtons =
    document.querySelectorAll(
        ".time-button"
    );


timeButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            async () => {

                const timeframe =
                    button.dataset.timeframe;


                if (!timeframe) {
                    return;
                }


                state.interval =
                    timeframe;


                if (timeframeSelect) {

                    timeframeSelect.value =
                        timeframe;
                }


                updateTimeButtons();

                updateInterfaceTexts();

                await loadMarketData();
            }
        );
    }
);


window.addEventListener(
    "resize",
    resizeChart
);
```

}

/* =========================================================
CARREGAR BIBLIOTECA DO GRÁFICO
========================================================= */

function loadChartLibrary() {

```
return new Promise(
    (resolve, reject) => {

        if (
            window.LightweightCharts
        ) {

            console.log(
                "Lightweight Charts já está disponível."
            );

            resolve();

            return;
        }


        console.log(
            "Carregando Lightweight Charts..."
        );


        const script =
            document.createElement(
                "script"
            );


        script.src =
            CHART_LIBRARY;


        script.async = true;


        script.onload =
            () => {

                if (
                    window.LightweightCharts
                ) {

                    console.log(
                        "Lightweight Charts carregado com sucesso."
                    );

                    resolve();

                }

                else {

                    reject(
                        new Error(
                            "Biblioteca carregada, mas LightweightCharts não foi encontrado."
                        )
                    );
                }
            };


        script.onerror =
            () => {

                reject(
                    new Error(
                        "Falha ao carregar Lightweight Charts."
                    )
                );
            };


        document.head.appendChild(
            script
        );
    }
);
```

}

/* =========================================================
CRIAR GRÁFICO
========================================================= */

function createChart() {

```
if (!chartElement) {

    throw new Error(
        "Elemento #chart não encontrado."
    );
}


if (
    !window.LightweightCharts
) {

    throw new Error(
        "Lightweight Charts não foi carregado."
    );
}


/*
   Remove a mensagem
   "Carregando gráfico..."
*/

chartElement.innerHTML = "";


const width =
    Math.max(
        chartElement.clientWidth,
        300
    );


const height =
    Math.max(
        chartElement.clientHeight,
        500
    );


console.log(
    "Criando gráfico:",
    width,
    "x",
    height
);


state.chart =
    window.LightweightCharts.createChart(
        chartElement,
        {

            width: width,

            height: height,

            layout: {

                background: {
                    color: "#090d13"
                },

                textColor: "#8c98aa"
            },

            grid: {

                vertLines: {
                    color: "#151c26"
                },

                horzLines: {
                    color: "#151c26"
                }
            },

            crosshair: {

                mode:
                    window.LightweightCharts.CrosshairMode.Normal
            },

            rightPriceScale: {

                borderColor:
                    "#202938",

                scaleMargins: {

                    top: 0.08,

                    bottom: 0.25
                }
            },

            timeScale: {

                borderColor:
                    "#202938",

                timeVisible:
                    true,

                secondsVisible:
                    false
            }
        }
    );


/*
   VERSÃO 4.2.0
   Usa addCandlestickSeries()
*/

state.candleSeries =
    state.chart.addCandlestickSeries({

        upColor: "#22c55e",

        downColor: "#ef4444",

        borderUpColor: "#22c55e",

        borderDownColor: "#ef4444",

        wickUpColor: "#22c55e",

        wickDownColor: "#ef4444"
    });


state.volumeSeries =
    state.chart.addHistogramSeries({

        priceFormat: {
            type: "volume"
        },

        priceScaleId: "",

        color:
            "rgba(59,130,246,0.35)"
    });


state.volumeSeries
    .priceScale()
    .applyOptions({

        scaleMargins: {

            top: 0.82,

            bottom: 0
        }
    });


state.chart
    .timeScale()
    .fitContent();


console.log(
    "Gráfico criado com sucesso."
);
```

}

/* =========================================================
REDIMENSIONAR GRÁFICO
========================================================= */

function resizeChart() {

```
if (
    !state.chart ||
    !chartElement
) {
    return;
}


state.chart.resize(

    Math.max(
        chartElement.clientWidth,
        300
    ),

    Math.max(
        chartElement.clientHeight,
        350
    )
);
```

}

/* =========================================================
BUSCAR CANDLES
========================================================= */

async function fetchCandles() {


const url =
    `${BINANCE_API}?symbol=${state.symbol}&interval=${state.interval}&limit=${CANDLE_LIMIT}`;


console.log(
    "Buscando:",
    url
);


const response =
    await fetch(url);


if (!response.ok) {

    const errorText =
        await response.text();


    throw new Error(
        `Binance respondeu ${response.status}: ${errorText}`
    );
}


const data =
    await response.json();


if (
    !Array.isArray(data) ||
    data.length === 0
) {

    throw new Error(
        "A API não retornou candles."
    );
}


return data.map(
    candle => ({

        time:
            Math.floor(
                Number(candle[0]) / 1000
            ),

        open:
            Number(candle[1]),

        high:
            Number(candle[2]),

        low:
            Number(candle[3]),

        close:
            Number(candle[4]),

        volume:
            Number(candle[5])
    })
);


}

/* =========================================================
CARREGAR MERCADO
========================================================= */

async function loadMarketData() {


if (state.loading) {
    return;
}


state.loading = true;


setLoadingState(
    true
);


try {

    console.log(
        "Carregando mercado..."
    );


    const candles =
        await fetchCandles();


    state.candles =
        candles;


    console.log(
        `${candles.length} candles recebidos.`
    );


    updateChart();


    updateMarketSummary();


    runAnalysis();


}

catch (error) {

    console.error(
        "ERRO NO MERCADO:",
        error
    );


    showError(
        error.message
    );

}

finally {

    state.loading = false;

    setLoadingState(
        false
    );
}


}

/* =========================================================
ATUALIZAR GRÁFICO
========================================================= */

function updateChart() {


if (
    !state.candleSeries ||
    !state.volumeSeries
) {

    console.error(
        "Séries do gráfico não foram criadas."
    );

    return;
}


const candles =
    state.candles;


const candleData =
    candles.map(
        candle => ({

            time:
                candle.time,

            open:
                candle.open,

            high:
                candle.high,

            low:
                candle.low,

            close:
                candle.close
        })
    );


const volumeData =
    candles.map(
        candle => ({

            time:
                candle.time,

            value:
                candle.volume,

            color:
                candle.close >= candle.open
                    ? "rgba(34,197,94,0.35)"
                    : "rgba(239,68,68,0.35)"
        })
    );


state.candleSeries.setData(
    candleData
);


state.volumeSeries.setData(
    volumeData
);


state.chart
    .timeScale()
    .fitContent();


console.log(
    "Gráfico atualizado."
);


}

/* =========================================================
RESUMO DO MERCADO
========================================================= */

function updateMarketSummary() {


if (
    state.candles.length < 2
) {
    return;
}


const first =
    state.candles[0];


const last =
    state.candles[
        state.candles.length - 1
    ];


const price =
    last.close;


const variation =
    (
        (price - first.close) /
        first.close
    ) * 100;


if (summaryAsset) {

    summaryAsset.textContent =
        formatSymbol(
            state.symbol
        );
}


if (currentPrice) {

    currentPrice.textContent =
        formatPrice(
            price
        );
}


if (priceChange) {

    priceChange.textContent =
        `${variation >= 0 ? "+" : ""}${variation.toFixed(2)}%`;


    priceChange.classList.remove(
        "signal-buy",
        "signal-sell"
    );


    if (variation > 0) {

        priceChange.classList.add(
            "signal-buy"
        );

    }

    else if (variation < 0) {

        priceChange.classList.add(
            "signal-sell"
        );
    }
}


}

/* =========================================================
TEXTOS
========================================================= */

function updateInterfaceTexts() {


const symbol =
    formatSymbol(
        state.symbol
    );


if (summaryAsset) {

    summaryAsset.textContent =
        symbol;
}


if (chartTitle) {

    chartTitle.textContent =
        symbol;
}


if (chartSubtitle) {

    chartSubtitle.textContent =
        `Gráfico de ${symbol} — ${formatTimeframe(state.interval)}`;
}


}

/* =========================================================
ANÁLISE
========================================================= */

function runAnalysis() {


if (
    state.candles.length < 50
) {

    console.warn(
        "Dados insuficientes."
    );

    return;
}


const result =
    analyzeMarket(
        state.candles
    );


if (!result) {
    return;
}


state.analysis =
    result;


console.log(
    "ANÁLISE:",
    result
);


updateRSI(
    result.rsi
);


updateMACD(
    result.macd
);


updateEMA(
    result.trend
);


updateVolume(
    result.volume
);


updateAnalysis(
    result
);


updateSignal(
    result
);


updateMarketSignal(
    result.signal
);


}

/* =========================================================
RSI
========================================================= */

function updateRSI(rsi) {


if (!rsi) {
    return;
}


const value =
    rsi.value;


if (rsiValue) {

    rsiValue.textContent =
        value === null
            ? "--"
            : value.toFixed(2);
}


if (
    rsiBar &&
    value !== null
) {

    const percent =
        Math.max(
            0,
            Math.min(
                100,
                value
            )
        );


    rsiBar.style.width =
        `${percent}%`;
}


}

/* =========================================================
MACD
========================================================= */

function updateMACD(macd) {


if (!macd) {
    return;
}


if (macdSignal) {

    macdSignal.textContent =
        macd.direction;
}


if (macdStatus) {

    macdStatus.textContent =
        `MACD ${formatIndicatorValue(
            macd.macd,
            4
        )} • Histograma ${formatIndicatorValue(
            macd.histogram,
            4
        )}`;


    macdStatus.className =
        getStatusClass(
            macd.direction
        );
}


}

/* =========================================================
EMA
========================================================= */

function updateEMA(trend) {


if (!trend) {
    return;
}


if (emaSignal) {

    emaSignal.textContent =
        trend.direction;
}


if (emaStatus) {

    emaStatus.textContent =
        `EMA 9: ${formatIndicatorValue(
            trend.ema9,
            2
        )} • EMA 21: ${formatIndicatorValue(
            trend.ema21,
            2
        )}`;


    emaStatus.className =
        getStatusClass(
            trend.direction
        );
}


}

/* =========================================================
VOLUME
========================================================= */

function updateVolume(volume) {


if (!volume) {
    return;
}


if (volumeValue) {

    volumeValue.textContent =
        volume.status;
}


if (volumeStatus) {

    volumeStatus.textContent =
        `Volume ${volume.ratio}x da média`;


    volumeStatus.className =
        getStatusClass(
            volume.status
        );
}


}

/* =========================================================
PAINEL DE ANÁLISE
========================================================= */

function updateAnalysis(result) {


if (analysisTitle) {

    if (
        result.signal === "COMPRA"
    ) {

        analysisTitle.textContent =
            "Pressão compradora";

    }

    else if (
        result.signal === "VENDA"
    ) {

        analysisTitle.textContent =
            "Pressão vendedora";

    }

    else {

        analysisTitle.textContent =
            "Mercado sem confirmação";
    }
}


if (analysisBadge) {

    analysisBadge.textContent =
        result.signal;


    analysisBadge.className =
        `analysis-badge ${getSignalClass(
            result.signal
        )}`;
}


if (analysisText) {

    analysisText.textContent =
        buildAnalysisText(
            result
        );
}


if (trendValue) {

    trendValue.textContent =
        result.trend
            ? result.trend.direction
            : "--";
}


if (momentumValue) {

    momentumValue.textContent =
        result.momentum
            ? `${result.momentum.direction} (${result.momentum.value}%)`
            : "--";
}


if (volatilityValue) {

    volatilityValue.textContent =
        result.volatility
            ? `${result.volatility.level} (${result.volatility.value}%)`
            : "--";
}


if (confidenceValue) {

    confidenceValue.textContent =
        `${result.confidence}%`;
}


}

/* =========================================================
TEXTO DA ANÁLISE
========================================================= */

function buildAnalysisText(result) {


const parts = [];


if (result.trend) {

    parts.push(
        `tendência ${result.trend.direction.toLowerCase()}`
    );
}


if (result.momentum) {

    parts.push(
        `momentum ${result.momentum.direction.toLowerCase()}`
    );
}


if (
    result.rsi &&
    result.rsi.value !== null
) {

    parts.push(
        `RSI em ${result.rsi.value.toFixed(2)}`
    );
}


if (result.macd) {

    parts.push(
        `MACD ${result.macd.direction.toLowerCase()}`
    );
}


let conclusion =
    "Não há confirmação suficiente para uma direção clara.";


if (
    result.signal === "COMPRA"
) {

    conclusion =
        "Os indicadores apresentam predominância compradora.";

}

else if (
    result.signal === "VENDA"
) {

    conclusion =
        "Os indicadores apresentam predominância vendedora.";
}


return (
    "A análise apresenta " +
    parts.join(", ") +
    ". " +
    conclusion
);


}

/* =========================================================
SINAL
========================================================= */

function updateSignal(result) {


const signal =
    result.signal;


if (!signalCard) {
    return;
}


signalCard.className =
    `signal-card ${getSignalClass(
        signal
    )}`;


if (
    signal === "COMPRA"
) {

    signalTitle.textContent =
        "COMPRA";


    signalDescription.textContent =
        "Os indicadores apresentam predominância de força compradora.";

}

else if (
    signal === "VENDA"
) {

    signalTitle.textContent =
        "VENDA";


    signalDescription.textContent =
        "Os indicadores apresentam predominância de força vendedora.";

}

else {

    signalTitle.textContent =
        "NEUTRO";


    signalDescription.textContent =
        "Não existe confirmação suficiente para uma direção clara.";
}


signalConfidence.textContent =
    `${result.confidence}%`;


const icon =
    signalCard.querySelector(
        ".signal-icon"
    );


if (icon) {

    if (
        signal === "COMPRA"
    ) {

        icon.textContent =
            "↑";

    }

    else if (
        signal === "VENDA"
    ) {

        icon.textContent =
            "↓";

    }

    else {

        icon.textContent =
            "—";
    }
}


}

/* =========================================================
SINAL DO RESUMO
========================================================= */

function updateMarketSignal(
signal
) {


if (!marketSignal) {
    return;
}


marketSignal.textContent =
    signal;


marketSignal.classList.remove(
    "signal-neutral",
    "signal-buy",
    "signal-sell"
);


if (
    signal === "COMPRA"
) {

    marketSignal.classList.add(
        "signal-buy"
    );

}

else if (
    signal === "VENDA"
) {

    marketSignal.classList.add(
        "signal-sell"
    );

}

else {

    marketSignal.classList.add(
        "signal-neutral"
    );
}


}

/* =========================================================
TIMEFRAME
========================================================= */

function updateTimeButtons() {


const buttons =
    document.querySelectorAll(
        ".time-button"
    );


buttons.forEach(
    button => {

        button.classList.toggle(
            "active",
            button.dataset.timeframe ===
                state.interval
        );
    }
);


}

/* =========================================================
ATUALIZAÇÃO AUTOMÁTICA
========================================================= */

function startAutoUpdate() {


console.log(
    "Atualização automática ativada."
);


setInterval(
    async () => {

        if (!state.loading) {

            await loadMarketData();
        }

    },
    UPDATE_INTERVAL
);


}

/* =========================================================
BOTÃO
========================================================= */

function setLoadingState(
loading
) {


if (!analyzeBtn) {
    return;
}


analyzeBtn.disabled =
    loading;


analyzeBtn.textContent =
    loading
        ? "ANALISANDO..."
        : "ANALISAR";


}

/* =========================================================
ERRO
========================================================= */

function showError(
message
) {


console.error(
    "PLANOS:",
    message
);


if (analysisTitle) {

    analysisTitle.textContent =
        "Erro ao carregar dados";
}


if (analysisBadge) {

    analysisBadge.textContent =
        "ERRO";


    analysisBadge.className =
        "analysis-badge sell";
}


if (analysisText) {

    analysisText.textContent =
        message;
}


}

/* =========================================================
STATUS
========================================================= */

function getStatusClass(
value
) {


const normalized =
    String(value)
        .toUpperCase();


if (
    normalized === "ALTA" ||
    normalized === "FORTE" ||
    normalized === "POSITIVO"
) {

    return "status-positive";
}


if (
    normalized === "BAIXA" ||
    normalized === "FRACO" ||
    normalized === "NEGATIVO"
) {

    return "status-negative";
}


if (
    normalized === "SOBRECOMPRADO" ||
    normalized === "SOBREVENDIDO"
) {

    return "status-warning";
}


return "status-neutral";


}

/* =========================================================
FORMATAÇÃO DO ATIVO
========================================================= */

function formatSymbol(
symbol
) {


if (!symbol) {
    return "--";
}


const quotes = [
    "USDT",
    "USDC",
    "BTC",
    "ETH",
    "BNB"
];


for (
    const quote of quotes
) {

    if (
        symbol.endsWith(quote) &&
        symbol.length > quote.length
    ) {

        return (
            symbol.slice(
                0,
                -quote.length
            ) +
            " / " +
            quote
        );
    }
}


return symbol;


}

/* =========================================================
TIMEFRAME
========================================================= */

function formatTimeframe(
timeframe
) {


const names = {

    "1m":
        "1 minuto",

    "5m":
        "5 minutos",

    "15m":
        "15 minutos",

    "30m":
        "30 minutos",

    "1h":
        "1 hora",

    "4h":
        "4 horas",

    "1d":
        "1 dia"
};


return (
    names[timeframe] ||
    timeframe
);


}

/* =========================================================
PREÇO
========================================================= */

function formatPrice(
price
) {


if (
    price === null ||
    price === undefined ||
    Number.isNaN(
        Number(price)
    )
) {

    return "--";
}


const value =
    Number(price);


let decimals = 2;


if (value < 1) {

    decimals = 6;

}

else if (value < 10) {

    decimals = 4;
}


return value.toLocaleString(
    "en-US",
    {

        minimumFractionDigits:
            decimals,

        maximumFractionDigits:
            decimals
    }
);


}

/* =========================================================
FINAL
========================================================= */

console.log(
"PLANOS — app.js carregado."
);
