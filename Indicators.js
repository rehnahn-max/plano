/* =========================================================
TRADE ANALYZER
indicators.js

Motor de indicadores técnicos

Indicadores:

* SMA
* EMA
* RSI
* MACD
* Bollinger Bands
* ATR
* Volume
* Tendência
  ========================================================= */

/* =========================================================
UTILIDADES
========================================================= */

/**

* Arredonda um número para determinada quantidade de casas.
  */
  function arredondar(valor, casas = 2) {

  if (!Number.isFinite(valor)) {
  return 0;
  }

  const multiplicador = Math.pow(10, casas);

  return Math.round(valor * multiplicador) / multiplicador;
  }

/**

* Retorna o último valor válido de um array.
  */
  function ultimoValor(array) {

  if (!Array.isArray(array) || array.length === 0) {
  return null;
  }

  return array[array.length - 1];
  }

/**

* Verifica se existe quantidade suficiente de dados.
  */
  function dadosSuficientes(array, quantidade) {

  return (
  Array.isArray(array) &&
  array.length >= quantidade
  );
  }

/* =========================================================
SMA
Simple Moving Average
========================================================= */

function calcularSMA(valores, periodo) {

```
if (
    !Array.isArray(valores) ||
    valores.length < periodo ||
    periodo <= 0
) {
    return [];
}

const resultado = [];

for (
    let i = periodo - 1;
    i < valores.length;
    i++
) {

    let soma = 0;

    for (
        let j = i - periodo + 1;
        j <= i;
        j++
    ) {

        soma += Number(valores[j]) || 0;
    }

    resultado.push(
        soma / periodo
    );
}

return resultado;
```

}

/* =========================================================
EMA
Exponential Moving Average
========================================================= */

function calcularEMA(valores, periodo) {

```
if (
    !Array.isArray(valores) ||
    valores.length < periodo ||
    periodo <= 0
) {
    return [];
}

const resultado = [];

const smaInicial =
    calcularSMA(
        valores.slice(0, periodo),
        periodo
    )[0];

if (!Number.isFinite(smaInicial)) {
    return [];
}

resultado.push(smaInicial);

const multiplicador =
    2 / (periodo + 1);

let emaAnterior =
    smaInicial;

for (
    let i = periodo;
    i < valores.length;
    i++
) {

    const preco =
        Number(valores[i]);

    if (!Number.isFinite(preco)) {
        resultado.push(emaAnterior);
        continue;
    }

    const emaAtual =
        (
            (preco - emaAnterior) *
            multiplicador
        ) +
        emaAnterior;

    resultado.push(emaAtual);

    emaAnterior =
        emaAtual;
}

return resultado;
```

}

/* =========================================================
RSI
Relative Strength Index
========================================================= */

function calcularRSI(
fechamentos,
periodo = 14
) {

```
if (
    !Array.isArray(fechamentos) ||
    fechamentos.length <= periodo
) {
    return [];
}

const ganhos = [];
const perdas = [];

for (
    let i = 1;
    i < fechamentos.length;
    i++
) {

    const diferenca =
        Number(fechamentos[i]) -
        Number(fechamentos[i - 1]);

    if (diferenca >= 0) {

        ganhos.push(diferenca);
        perdas.push(0);

    } else {

        ganhos.push(0);
        perdas.push(
            Math.abs(diferenca)
        );
    }
}

if (ganhos.length < periodo) {
    return [];
}

let ganhoMedio =
    ganhos
        .slice(0, periodo)
        .reduce(
            (a, b) => a + b,
            0
        ) / periodo;

let perdaMedia =
    perdas
        .slice(0, periodo)
        .reduce(
            (a, b) => a + b,
            0
        ) / periodo;

const resultado = [];

function calcularRSIAtual() {

    if (perdaMedia === 0) {
        return 100;
    }

    const RS =
        ganhoMedio /
        perdaMedia;

    return 100 -
        (100 / (1 + RS));
}

resultado.push(
    calcularRSIAtual()
);

for (
    let i = periodo;
    i < ganhos.length;
    i++
) {

    ganhoMedio =
        (
            (ganhoMedio * (periodo - 1)) +
            ganhos[i]
        ) / periodo;

    perdaMedia =
        (
            (perdaMedia * (periodo - 1)) +
            perdas[i]
        ) / periodo;

    resultado.push(
        calcularRSIAtual()
    );
}

return resultado;
```

}

/* =========================================================
MACD
========================================================= */

function calcularMACD(
fechamentos,
periodoRapido = 12,
periodoLento = 26,
periodoSinal = 9
) {

```
if (
    !Array.isArray(fechamentos) ||
    fechamentos.length < periodoLento
) {
    return {

        linhaMACD: [],
        linhaSinal: [],
        histograma: []

    };
}

const emaRapida =
    calcularEMA(
        fechamentos,
        periodoRapido
    );

const emaLenta =
    calcularEMA(
        fechamentos,
        periodoLento
    );


/*
   As EMAs começam em pontos diferentes.
   Vamos alinhar os valores usando
   o índice correspondente ao período lento.
*/

const deslocamento =
    periodoLento -
    periodoRapido;

const linhaMACD = [];


for (
    let i = 0;
    i < emaLenta.length;
    i++
) {

    const indiceRapido =
        i + deslocamento;

    if (
        indiceRapido >= 0 &&
        indiceRapido < emaRapida.length
    ) {

        linhaMACD.push(
            emaRapida[indiceRapido] -
            emaLenta[i]
        );
    }
}


const linhaSinal =
    calcularEMA(
        linhaMACD,
        periodoSinal
    );


const histograma = [];


/*
   A linha de sinal começa depois
   da linha MACD.
*/

const deslocamentoSinal =
    linhaMACD.length -
    linhaSinal.length;


for (
    let i = 0;
    i < linhaSinal.length;
    i++
) {

    const indiceMACD =
        i + deslocamentoSinal;

    histograma.push(

        linhaMACD[indiceMACD] -
        linhaSinal[i]

    );
}


return {

    linhaMACD,
    linhaSinal,
    histograma

};
```

}

/* =========================================================
BOLLINGER BANDS
========================================================= */

function calcularBollinger(
fechamentos,
periodo = 20,
desvios = 2
) {

```
if (
    !Array.isArray(fechamentos) ||
    fechamentos.length < periodo
) {
    return {

        superior: [],
        media: [],
        inferior: [],
        largura: []

    };
}


const superior = [];
const media = [];
const inferior = [];
const largura = [];


for (
    let i = periodo - 1;
    i < fechamentos.length;
    i++
) {

    const valores =
        fechamentos.slice(
            i - periodo + 1,
            i + 1
        );


    const soma =
        valores.reduce(
            (a, b) =>
                a + Number(b),
            0
        );


    const mediaAtual =
        soma / periodo;


    let somaQuadrados = 0;


    for (const valor of valores) {

        somaQuadrados +=
            Math.pow(
                Number(valor) -
                mediaAtual,
                2
            );
    }


    const desvioPadrao =
        Math.sqrt(
            somaQuadrados /
            periodo
        );


    const bandaSuperior =
        mediaAtual +
        (desvios * desvioPadrao);


    const bandaInferior =
        mediaAtual -
        (desvios * desvioPadrao);


    const larguraAtual =
        bandaSuperior -
        bandaInferior;


    media.push(
        mediaAtual
    );

    superior.push(
        bandaSuperior
    );

    inferior.push(
        bandaInferior
    );

    largura.push(
        larguraAtual
    );
}


return {

    superior,
    media,
    inferior,
    largura

};
```

}

/* =========================================================
ATR
Average True Range
========================================================= */

function calcularATR(
candles,
periodo = 14
) {

```
if (
    !Array.isArray(candles) ||
    candles.length <= periodo
) {
    return [];
}


const trueRanges = [];


for (
    let i = 1;
    i < candles.length;
    i++
) {

    const atual =
        candles[i];

    const anterior =
        candles[i - 1];


    const high =
        Number(atual.high);

    const low =
        Number(atual.low);

    const fechamentoAnterior =
        Number(anterior.close);


    const TR =
        Math.max(

            high - low,

            Math.abs(
                high -
                fechamentoAnterior
            ),

            Math.abs(
                low -
                fechamentoAnterior
            )

        );


    trueRanges.push(TR);
}


if (
    trueRanges.length <
    periodo
) {
    return [];
}


let atr =
    trueRanges
        .slice(0, periodo)
        .reduce(
            (a, b) => a + b,
            0
        ) / periodo;


const resultado = [atr];


for (
    let i = periodo;
    i < trueRanges.length;
    i++
) {

    atr =
        (
            (atr * (periodo - 1)) +
            trueRanges[i]
        ) / periodo;


    resultado.push(atr);
}


return resultado;
```

}

/* =========================================================
ANÁLISE DE VOLUME
========================================================= */

function analisarVolume(
candles,
periodo = 20
) {

```
if (
    !Array.isArray(candles) ||
    candles.length < periodo + 1
) {

    return {

        volumeAtual: 0,
        volumeMedio: 0,
        percentual: 0,
        sinal: "NEUTRO"

    };
}


const volumes =
    candles.map(
        candle =>
            Number(candle.volume) || 0
    );


const volumeAtual =
    ultimoValor(volumes);


const ultimosVolumes =
    volumes.slice(
        -periodo - 1,
        -1
    );


const volumeMedio =
    ultimosVolumes.reduce(
        (a, b) => a + b,
        0
    ) / ultimosVolumes.length;


let percentual = 0;


if (volumeMedio > 0) {

    percentual =
        (
            (volumeAtual -
            volumeMedio) /
            volumeMedio
        ) * 100;
}


let sinal =
    "NEUTRO";


if (percentual >= 30) {

    sinal =
        "FORTE";

} else if (percentual <= -30) {

    sinal =
        "FRACO";
}


return {

    volumeAtual,
    volumeMedio,
    percentual,
    sinal

};
```

}

/* =========================================================
ANÁLISE DE TENDÊNCIA
========================================================= */

function analisarTendencia(
fechamentos,
periodoCurto = 9,
periodoLongo = 21
) {

```
if (
    !Array.isArray(fechamentos) ||
    fechamentos.length < periodoLongo
) {

    return {

        emaCurta: 0,
        emaLonga: 0,
        tendencia: "NEUTRO",
        forca: 0

    };
}


const emaCurtaArray =
    calcularEMA(
        fechamentos,
        periodoCurto
    );


const emaLongaArray =
    calcularEMA(
        fechamentos,
        periodoLongo
    );


const emaCurta =
    ultimoValor(
        emaCurtaArray
    );


const emaLonga =
    ultimoValor(
        emaLongaArray
    );


const precoAtual =
    ultimoValor(
        fechamentos
    );


let tendencia =
    "NEUTRO";


if (
    emaCurta > emaLonga &&
    precoAtual > emaCurta
) {

    tendencia =
        "ALTA";

} else if (
    emaCurta < emaLonga &&
    precoAtual < emaCurta
) {

    tendencia =
        "BAIXA";
}


let forca = 0;


if (emaLonga !== 0) {

    forca =
        Math.abs(
            (
                (emaCurta -
                emaLonga) /
                emaLonga
            ) * 100
        );
}


return {

    emaCurta,
    emaLonga,
    tendencia,
    forca

};
```

}

/* =========================================================
ANÁLISE DO RSI
========================================================= */

function analisarRSI(
rsi
) {

```
if (!Number.isFinite(rsi)) {

    return {

        sinal: "NEUTRO",
        descricao: "Sem dados"

    };
}


if (rsi <= 30) {

    return {

        sinal: "ALTA",
        descricao: "Sobrevendido"

    };

}


if (rsi >= 70) {

    return {

        sinal: "BAIXA",
        descricao: "Sobrecomprado"

    };

}


if (rsi >= 50) {

    return {

        sinal: "ALTA",
        descricao: "Força compradora"

    };

}


return {

    sinal: "BAIXA",
    descricao: "Força vendedora"

};
```

}

/* =========================================================
ANÁLISE DO MACD
========================================================= */

function analisarMACD(
macd,
sinal
) {

```
if (
    !Number.isFinite(macd) ||
    !Number.isFinite(sinal)
) {

    return {

        sinal: "NEUTRO"

    };
}


if (macd > sinal) {

    return {

        sinal: "ALTA"

    };
}


if (macd < sinal) {

    return {

        sinal: "BAIXA"

    };
}


return {

    sinal: "NEUTRO"

};
```

}

/* =========================================================
ANÁLISE DAS BOLLINGER
========================================================= */

function analisarBollinger(
preco,
superior,
media,
inferior
) {

```
if (
    !Number.isFinite(preco) ||
    !Number.isFinite(superior) ||
    !Number.isFinite(media) ||
    !Number.isFinite(inferior)
) {

    return {

        sinal: "NEUTRO",
        descricao: "Sem dados"

    };
}


if (preco <= inferior) {

    return {

        sinal: "ALTA",
        descricao: "Próximo à banda inferior"

    };

}


if (preco >= superior) {

    return {

        sinal: "BAIXA",
        descricao: "Próximo à banda superior"

    };

}


if (preco > media) {

    return {

        sinal: "ALTA",
        descricao: "Acima da média"

    };
}


return {

    sinal: "BAIXA",
    descricao: "Abaixo da média"

};
```

}

/* =========================================================
MOTOR DE PONTUAÇÃO
========================================================= */

function calcularPontuacao(
analise
) {

```
let pontosAlta = 0;

let pontosBaixa = 0;


/*
   RSI
*/

if (
    analise.rsi &&
    analise.rsi.sinal === "ALTA"
) {

    pontosAlta += 2;

} else if (
    analise.rsi &&
    analise.rsi.sinal === "BAIXA"
) {

    pontosBaixa += 2;
}


/*
   MACD
*/

if (
    analise.macd &&
    analise.macd.sinal === "ALTA"
) {

    pontosAlta += 2;

} else if (
    analise.macd &&
    analise.macd.sinal === "BAIXA"
) {

    pontosBaixa += 2;
}


/*
   EMA / Tendência
*/

if (
    analise.tendencia &&
    analise.tendencia.tendencia === "ALTA"
) {

    pontosAlta += 3;

} else if (
    analise.tendencia &&
    analise.tendencia.tendencia === "BAIXA"
) {

    pontosBaixa += 3;
}


/*
   Bollinger
*/

if (
    analise.bollinger &&
    analise.bollinger.sinal === "ALTA"
) {

    pontosAlta += 1;

} else if (
    analise.bollinger &&
    analise.bollinger.sinal === "BAIXA"
) {

    pontosBaixa += 1;
}


/*
   Volume
*/

if (
    analise.volume &&
    analise.volume.sinal === "FORTE"
) {

    /*
       Volume forte aumenta o peso
       da tendência atual.
    */

    if (
        analise.tendencia &&
        analise.tendencia.tendencia === "ALTA"
    ) {

        pontosAlta += 2;

    } else if (
        analise.tendencia &&
        analise.tendencia.tendencia === "BAIXA"
    ) {

        pontosBaixa += 2;
    }
}


/*
   Determina o sinal
*/

let sinal =
    "AGUARDAR";


const total =
    pontosAlta +
    pontosBaixa;


if (total > 0) {

    const diferenca =
        Math.abs(
            pontosAlta -
            pontosBaixa
        );


    /*
       Exigimos vantagem mínima
       para evitar sinais fracos.
    */

    if (
        pontosAlta > pontosBaixa &&
        diferenca >= 3
    ) {

        sinal =
            "COMPRA";

    } else if (
        pontosBaixa > pontosAlta &&
        diferenca >= 3
    ) {

        sinal =
            "VENDA";
    }
}


/*
   Calcula confiança relativa.

   IMPORTANTE:
   Isso não é uma probabilidade
   estatística real de mercado.

   É apenas uma medida da força
   relativa dos sinais analisados.
*/

let confianca = 0;


if (total > 0) {

    const maiorPontuacao =
        Math.max(
            pontosAlta,
            pontosBaixa
        );


    confianca =
        (
            maiorPontuacao /
            total
        ) * 100;


    /*
       Se estiver muito equilibrado,
       reduzimos a confiança.
    */

    if (
        Math.abs(
            pontosAlta -
            pontosBaixa
        ) <= 1
    ) {

        confianca =
            Math.min(
                confianca,
                55
            );
    }
}


return {

    pontosAlta,
    pontosBaixa,
    total,
    sinal,
    confianca:
        arredondar(
            confianca,
            1
        )

};
```

}

/* =========================================================
CÁLCULO DOS NÍVEIS
========================================================= */

function calcularNiveis(
preco,
atr,
sinal
) {

```
if (
    !Number.isFinite(preco) ||
    !Number.isFinite(atr) ||
    atr <= 0
) {

    return {

        entrada: preco || 0,
        stop: 0,
        alvo: 0

    };
}


const entrada =
    preco;


let stop = 0;

let alvo = 0;


/*
   Compra
*/

if (sinal === "COMPRA") {

    stop =
        preco -
        (atr * 1.5);

    alvo =
        preco +
        (atr * 3);

}


/*
   Venda
*/

else if (sinal === "VENDA") {

    stop =
        preco +
        (atr * 1.5);

    alvo =
        preco -
        (atr * 3);

}


/*
   Aguardar
*/

else {

    stop =
        preco -
        (atr * 1.5);

    alvo =
        preco +
        (atr * 1.5);
}


return {

    entrada:
        arredondar(
            entrada,
            2
        ),

    stop:
        arredondar(
            stop,
            2
        ),

    alvo:
        arredondar(
            alvo,
            2
        )

};
```

}

/* =========================================================
ANÁLISE COMPLETA
========================================================= */

function analisarMercado(
candles
) {

```
if (
    !Array.isArray(candles) ||
    candles.length < 30
) {

    return {

        sucesso: false,

        erro:
            "Dados insuficientes para análise."

    };
}


/*
   Extrai os fechamentos.
*/

const fechamentos =
    candles.map(
        candle =>
            Number(candle.close)
    );


const precoAtual =
    ultimoValor(
        fechamentos
    );


/* =====================================================
   RSI
===================================================== */

const rsiArray =
    calcularRSI(
        fechamentos,
        14
    );


const rsiAtual =
    ultimoValor(
        rsiArray
    );


const rsiAnalise =
    analisarRSI(
        rsiAtual
    );


/* =====================================================
   MACD
===================================================== */

const macd =
    calcularMACD(
        fechamentos,
        12,
        26,
        9
    );


const macdAtual =
    ultimoValor(
        macd.linhaMACD
    );


const macdSinalAtual =
    ultimoValor(
        macd.linhaSinal
    );


const histogramaAtual =
    ultimoValor(
        macd.histograma
    );


const macdAnalise =
    analisarMACD(
        macdAtual,
        macdSinalAtual
    );


/* =====================================================
   EMA / TENDÊNCIA
===================================================== */

const tendencia =
    analisarTendencia(
        fechamentos,
        9,
        21
    );


/* =====================================================
   BOLLINGER
===================================================== */

const bollinger =
    calcularBollinger(
        fechamentos,
        20,
        2
    );


const bandaSuperior =
    ultimoValor(
        bollinger.superior
    );


const bandaMedia =
    ultimoValor(
        bollinger.media
    );


const bandaInferior =
    ultimoValor(
        bollinger.inferior
    );


const bollingerAnalise =
    analisarBollinger(
        precoAtual,
        bandaSuperior,
        bandaMedia,
        bandaInferior
    );


/* =====================================================
   ATR
===================================================== */

const atrArray =
    calcularATR(
        candles,
        14
    );


const atrAtual =
    ultimoValor(
        atrArray
    );


/* =====================================================
   VOLUME
===================================================== */

const volume =
    analisarVolume(
        candles,
        20
    );


/* =====================================================
   OBJETO DE ANÁLISE
===================================================== */

const analise = {

    preco:
        precoAtual,

    rsi: {

        valor:
            arredondar(
                rsiAtual,
                2
            ),

        sinal:
            rsiAnalise.sinal,

        descricao:
            rsiAnalise.descricao

    },


    macd: {

        valor:
            arredondar(
                macdAtual,
                6
            ),

        sinal:
            arredondar(
                macdSinalAtual,
                6
            ),

        histograma:
            arredondar(
                histogramaAtual,
                6
            ),

        direcao:
            macdAnalise.sinal

    },


    tendencia: {

        ema9:
            arredondar(
                tendencia.emaCurta,
                2
            ),

        ema21:
            arredondar(
                tendencia.emaLonga,
                2
            ),

        tendencia:
            tendencia.tendencia,

        forca:
            arredondar(
                tendencia.forca,
                2
            )

    },


    bollinger: {

        superior:
            arredondar(
                bandaSuperior,
                2
            ),

        media:
            arredondar(
                bandaMedia,
                2
            ),

        inferior:
            arredondar(
                bandaInferior,
                2
            ),

        sinal:
            bollingerAnalise.sinal,

        descricao:
            bollingerAnalise.descricao

    },


    atr: {

        valor:
            arredondar(
                atrAtual,
                2
            )

    },


    volume: {

        atual:
            arredondar(
                volume.volumeAtual,
                2
            ),

        medio:
            arredondar(
                volume.volumeMedio,
                2
            ),

        percentual:
            arredondar(
                volume.percentual,
                2
            ),

        sinal:
            volume.sinal

    }

};


/* =====================================================
   PONTUAÇÃO
===================================================== */

const pontuacao =
    calcularPontuacao(
        analise
    );


/* =====================================================
   NÍVEIS
===================================================== */

const niveis =
    calcularNiveis(
        precoAtual,
        atrAtual,
        pontuacao.sinal
    );


/* =====================================================
   RESULTADO FINAL
===================================================== */

return {

    sucesso: true,

    timestamp:
        Date.now(),

    preco:
        precoAtual,

    indicadores:
        analise,

    pontuacao,

    niveis

};
```

}

/* =========================================================
EXPORTAÇÃO
========================================================= */

/*
O app.js poderá utilizar todas essas funções
através do objeto global TradeIndicators.
*/

window.TradeIndicators = {

```
arredondar,

calcularSMA,

calcularEMA,

calcularRSI,

calcularMACD,

calcularBollinger,

calcularATR,

analisarVolume,

analisarTendencia,

analisarRSI,

analisarMACD,

analisarBollinger,

calcularPontuacao,

calcularNiveis,

analisarMercado
```

};
