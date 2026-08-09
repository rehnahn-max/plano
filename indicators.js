/* =========================================================
PLANOS — INDICADORES
indicators.js

Responsável pelos cálculos de:

* SMA
* EMA
* RSI
* MACD
* ATR
* Volume
* Tendência
* Momentum
* Volatilidade
  ========================================================= */

/* =========================================================
SMA — MÉDIA MÓVEL SIMPLES
========================================================= */

export function calculateSMA(values, period = 14) {


if (!Array.isArray(values) || values.length < period) {
    return null;
}

const slice = values.slice(-period);

const sum = slice.reduce(
    (total, value) => total + Number(value),
    0
);

return sum / period;


}

/* =========================================================
EMA — MÉDIA MÓVEL EXPONENCIAL
========================================================= */

export function calculateEMA(values, period = 14) {


if (!Array.isArray(values) || values.length < period) {
    return [];
}

const numericValues = values.map(Number);

const multiplier = 2 / (period + 1);

const ema = [];

let previousEMA =
    numericValues
        .slice(0, period)
        .reduce(
            (total, value) => total + value,
            0
        ) / period;

ema.push(previousEMA);

for (
    let i = period;
    i < numericValues.length;
    i++
) {

    const currentValue = numericValues[i];

    const currentEMA =
        (currentValue - previousEMA) *
        multiplier +
        previousEMA;

    ema.push(currentEMA);

    previousEMA = currentEMA;
}

return ema;


}

/* =========================================================
RSI — ÍNDICE DE FORÇA RELATIVA
========================================================= */

export function calculateRSI(
closes,
period = 14
) {


if (
    !Array.isArray(closes) ||
    closes.length <= period
) {
    return null;
}

const prices = closes.map(Number);

let gains = 0;
let losses = 0;

for (let i = 1; i <= period; i++) {

    const difference =
        prices[i] - prices[i - 1];

    if (difference >= 0) {
        gains += difference;
    } else {
        losses += Math.abs(difference);
    }
}

let averageGain = gains / period;
let averageLoss = losses / period;

for (
    let i = period + 1;
    i < prices.length;
    i++
) {

    const difference =
        prices[i] - prices[i - 1];

    const gain =
        difference > 0
            ? difference
            : 0;

    const loss =
        difference < 0
            ? Math.abs(difference)
            : 0;

    averageGain =
        (
            averageGain * (period - 1) +
            gain
        ) / period;

    averageLoss =
        (
            averageLoss * (period - 1) +
            loss
        ) / period;
}

if (averageLoss === 0) {
    return 100;
}

const relativeStrength =
    averageGain / averageLoss;

const rsi =
    100 -
    100 / (1 + relativeStrength);

return Number(rsi.toFixed(2));


}

/* =========================================================
MACD
========================================================= */

export function calculateMACD(
closes,
fastPeriod = 12,
slowPeriod = 26,
signalPeriod = 9
) {


if (
    !Array.isArray(closes) ||
    closes.length < slowPeriod
) {
    return null;
}

const fastEMA =
    calculateEMA(
        closes,
        fastPeriod
    );

const slowEMA =
    calculateEMA(
        closes,
        slowPeriod
    );

if (
    fastEMA.length === 0 ||
    slowEMA.length === 0
) {
    return null;
}


/*
   O EMA rápida começa antes da EMA lenta.
   Por isso alinhamos os valores pelo final.
*/

const offset =
    fastEMA.length -
    slowEMA.length;

const macdLine = [];

for (
    let i = 0;
    i < slowEMA.length;
    i++
) {

    const fastIndex =
        i + offset;

    const value =
        fastEMA[fastIndex] -
        slowEMA[i];

    macdLine.push(value);
}


const signalLine =
    calculateEMA(
        macdLine,
        signalPeriod
    );

if (signalLine.length === 0) {
    return null;
}

const macdValue =
    macdLine[macdLine.length - 1];

const signalValue =
    signalLine[signalLine.length - 1];

const histogram =
    macdValue - signalValue;


let signal = "NEUTRO";

if (macdValue > signalValue) {
    signal = "ALTA";
}

if (macdValue < signalValue) {
    signal = "BAIXA";
}


return {

    macd: Number(
        macdValue.toFixed(6)
    ),

    signal: Number(
        signalValue.toFixed(6)
    ),

    histogram: Number(
        histogram.toFixed(6)
    ),

    direction: signal
};


}

/* =========================================================
ATR — MÉDIA DO TRUE RANGE
========================================================= */

export function calculateATR(
candles,
period = 14
) {


if (
    !Array.isArray(candles) ||
    candles.length <= period
) {
    return null;
}

const trueRanges = [];

for (let i = 1; i < candles.length; i++) {

    const current = candles[i];
    const previous = candles[i - 1];

    const high =
        Number(current.high);

    const low =
        Number(current.low);

    const previousClose =
        Number(previous.close);

    const range1 =
        high - low;

    const range2 =
        Math.abs(
            high - previousClose
        );

    const range3 =
        Math.abs(
            low - previousClose
        );

    const trueRange =
        Math.max(
            range1,
            range2,
            range3
        );

    trueRanges.push(trueRange);
}

if (trueRanges.length < period) {
    return null;
}

const recentRanges =
    trueRanges.slice(-period);

const atr =
    recentRanges.reduce(
        (total, value) =>
            total + value,
        0
    ) / period;

return Number(
    atr.toFixed(6)
);


}

/* =========================================================
VOLUME
========================================================= */

export function analyzeVolume(
volumes,
period = 20
) {


if (
    !Array.isArray(volumes) ||
    volumes.length < period
) {
    return null;
}

const numericVolumes =
    volumes.map(Number);

const currentVolume =
    numericVolumes[
        numericVolumes.length - 1
    ];

const averageVolume =
    numericVolumes
        .slice(-period)
        .reduce(
            (total, value) =>
                total + value,
            0
        ) / period;

if (averageVolume === 0) {
    return {
        current: currentVolume,
        average: 0,
        ratio: 0,
        status: "NORMAL"
    };
}

const ratio =
    currentVolume /
    averageVolume;

let status = "NORMAL";

if (ratio >= 1.5) {
    status = "FORTE";
} else if (ratio <= 0.7) {
    status = "FRACO";
}


return {

    current:
        currentVolume,

    average:
        averageVolume,

    ratio:
        Number(ratio.toFixed(2)),

    status:
        status
};


}

/* =========================================================
TENDÊNCIA
========================================================= */

export function analyzeTrend(
closes
) {


if (
    !Array.isArray(closes) ||
    closes.length < 50
) {
    return {
        direction: "NEUTRO",
        strength: 0
    };
}

const ema9 =
    calculateEMA(closes, 9);

const ema21 =
    calculateEMA(closes, 21);

const ema50 =
    calculateEMA(closes, 50);

if (
    !ema9.length ||
    !ema21.length ||
    !ema50.length
) {
    return {
        direction: "NEUTRO",
        strength: 0
    };
}

const current9 =
    ema9[ema9.length - 1];

const current21 =
    ema21[ema21.length - 1];

const current50 =
    ema50[ema50.length - 1];


let direction = "NEUTRO";

if (
    current9 > current21 &&
    current21 > current50
) {
    direction = "ALTA";
}

else if (
    current9 < current21 &&
    current21 < current50
) {
    direction = "BAIXA";
}


const difference =
    Math.abs(
        current9 - current50
    );

const strength =
    current50 !== 0
        ? Math.min(
            100,
            (
                difference /
                current50
            ) * 1000
        )
        : 0;


return {

    direction,

    strength:
        Number(
            strength.toFixed(2)
        ),

    ema9:
        Number(
            current9.toFixed(6)
        ),

    ema21:
        Number(
            current21.toFixed(6)
        ),

    ema50:
        Number(
            current50.toFixed(6)
        )
};


}

/* =========================================================
MOMENTUM
========================================================= */

export function analyzeMomentum(
closes,
period = 10
) {


if (
    !Array.isArray(closes) ||
    closes.length <= period
) {
    return {
        direction: "NEUTRO",
        value: 0
    };
}

const current =
    Number(
        closes[closes.length - 1]
    );

const previous =
    Number(
        closes[
            closes.length - 1 - period
        ]
    );

if (previous === 0) {
    return {
        direction: "NEUTRO",
        value: 0
    };
}

const momentum =
    (
        (current - previous) /
        previous
    ) * 100;


let direction = "NEUTRO";

if (momentum > 0.5) {
    direction = "POSITIVO";
}

else if (momentum < -0.5) {
    direction = "NEGATIVO";
}


return {

    direction,

    value:
        Number(
            momentum.toFixed(2)
        )
};


}

/* =========================================================
VOLATILIDADE
========================================================= */

export function analyzeVolatility(
closes,
period = 20
) {


if (
    !Array.isArray(closes) ||
    closes.length < period
) {
    return {
        level: "NORMAL",
        value: 0
    };
}

const values =
    closes
        .slice(-period)
        .map(Number);

const returns = [];

for (
    let i = 1;
    i < values.length;
    i++
) {

    if (values[i - 1] === 0) {
        continue;
    }

    const variation =
        (
            (values[i] - values[i - 1]) /
            values[i - 1]
        ) * 100;

    returns.push(variation);
}

if (returns.length === 0) {
    return {
        level: "NORMAL",
        value: 0
    };
}

const mean =
    returns.reduce(
        (total, value) =>
            total + value,
        0
    ) / returns.length;


const variance =
    returns.reduce(
        (total, value) =>
            total +
            Math.pow(
                value - mean,
                2
            ),
        0
    ) / returns.length;


const standardDeviation =
    Math.sqrt(variance);


let level = "NORMAL";

if (standardDeviation >= 2) {
    level = "ALTA";
}

else if (standardDeviation <= 0.5) {
    level = "BAIXA";
}


return {

    level,

    value:
        Number(
            standardDeviation.toFixed(2)
        )
};


}

/* =========================================================
CLASSIFICAÇÃO DO RSI
========================================================= */

export function classifyRSI(
rsi
) {


if (rsi === null || rsi === undefined) {
    return "NEUTRO";
}

if (rsi <= 30) {
    return "SOBREVENDIDO";
}

if (rsi >= 70) {
    return "SOBRECOMPRADO";
}

return "NEUTRO";


}

/* =========================================================
ANÁLISE COMPLETA
========================================================= */

export function analyzeMarket(
candles
) {


if (
    !Array.isArray(candles) ||
    candles.length < 50
) {
    return null;
}


const closes =
    candles.map(
        candle => Number(candle.close)
    );


const volumes =
    candles.map(
        candle => Number(candle.volume)
    );


const rsi =
    calculateRSI(closes, 14);


const macd =
    calculateMACD(closes);


const trend =
    analyzeTrend(closes);


const momentum =
    analyzeMomentum(closes);


const volatility =
    analyzeVolatility(closes);


const volume =
    analyzeVolume(volumes);


const atr =
    calculateATR(candles);


const rsiClassification =
    classifyRSI(rsi);


/*
   Sistema simples de pontuação.

   Alta  = +1
   Baixa = -1
   Neutro = 0
*/

let score = 0;


if (trend) {

    if (trend.direction === "ALTA") {
        score += 1;
    }

    else if (
        trend.direction === "BAIXA"
    ) {
        score -= 1;
    }
}


if (macd) {

    if (macd.direction === "ALTA") {
        score += 1;
    }

    else if (
        macd.direction === "BAIXA"
    ) {
        score -= 1;
    }
}


if (rsi !== null) {

    if (
        rsi < 30
    ) {
        score += 1;
    }

    else if (
        rsi > 70
    ) {
        score -= 1;
    }
}


if (momentum) {

    if (
        momentum.direction === "POSITIVO"
    ) {
        score += 1;
    }

    else if (
        momentum.direction === "NEGATIVO"
    ) {
        score -= 1;
    }
}


let signal = "NEUTRO";

if (score >= 2) {
    signal = "COMPRA";
}

else if (score <= -2) {
    signal = "VENDA";
}


const confidence =
    Math.min(
        100,
        Math.abs(score) * 25
    );


return {

    rsi: {
        value: rsi,
        classification:
            rsiClassification
    },

    macd,

    trend,

    momentum,

    volatility,

    volume,

    atr,

    score,

    signal,

    confidence
};


}

/* =========================================================
FUNÇÕES AUXILIARES
========================================================= */

export function formatIndicatorValue(
value,
decimals = 2
) {


if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
) {
    return "--";
}

return Number(value).toFixed(decimals);


}

export function getSignalClass(
signal
) {


switch (signal) {

    case "COMPRA":
        return "buy";

    case "VENDA":
        return "sell";

    default:
        return "neutral";
}


}

/* =========================================================
TESTE DO MÓDULO
========================================================= */

console.log(
"PLANOS — indicators.js carregado"
);
