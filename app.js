/* =========================================================
TRADE ANALYZER
app.js

Controle principal da aplicação

Nesta primeira versão:

* Os dados são simulados
* Os indicadores vêm do indicators.js
* O histórico fica no localStorage
* Nenhuma ordem real é executada
  ========================================================= */

/* =========================================================
CONFIGURAÇÕES
========================================================= */

const CONFIG = {

```
historicoStorage:
    "tradeAnalyzerHistorico",

maxHistorico:
    50,

intervaloSimulacao:
    5000
```

};

/* =========================================================
VARIÁVEIS
========================================================= */

let candlesAtuais = [];

let ultimaAnalise = null;

let simulacaoAtiva = false;

let intervaloSimulacao = null;

/* =========================================================
ELEMENTOS DO HTML
========================================================= */

const ativoSelect =
document.getElementById("ativo");

const timeframeSelect =
document.getElementById("timeframe");

const periodoSelect =
document.getElementById("periodo");

const btnAnalisar =
document.getElementById("btnAnalisar");

const btnLimparHistorico =
document.getElementById("btnLimparHistorico");

/* =========================================================
INFORMAÇÕES DO ATIVO
========================================================= */

const infoAtivo =
document.getElementById("infoAtivo");

const precoAtual =
document.getElementById("precoAtual");

const variacaoAtual =
document.getElementById("variacaoAtual");

const volumeAtual =
document.getElementById("volumeAtual");

/* =========================================================
GRÁFICO
========================================================= */

const grafico =
document.getElementById("grafico");

const graficoStatus =
document.getElementById("graficoStatus");

const timeframeAtual =
document.getElementById("timeframeAtual");

/* =========================================================
INDICADORES
========================================================= */

const rsiSinal =
document.getElementById("rsiSinal");

const rsiValor =
document.getElementById("rsiValor");

const rsiBarra =
document.getElementById("rsiBarra");

const macdSinal =
document.getElementById("macdSinal");

const macdValor =
document.getElementById("macdValor");

const emaSinal =
document.getElementById("emaSinal");

const emaValor =
document.getElementById("emaValor");

const volumeSinal =
document.getElementById("volumeSinal");

const volumeIndicador =
document.getElementById("volumeIndicador");

const bollingerSinal =
document.getElementById("bollingerSinal");

const bollingerValor =
document.getElementById("bollingerValor");

const tendenciaSinal =
document.getElementById("tendenciaSinal");

const tendenciaValor =
document.getElementById("tendenciaValor");

/* =========================================================
RESULTADO
========================================================= */

const sinalPrincipal =
document.getElementById("sinalPrincipal");

const confiancaValor =
document.getElementById("confiancaValor");

const barraConfianca =
document.getElementById("barraConfianca");

const pontosAlta =
document.getElementById("pontosAlta");

const pontosBaixa =
document.getElementById("pontosBaixa");

const forcaSinal =
document.getElementById("forcaSinal");

/* =========================================================
NÍVEIS
========================================================= */

const nivelEntrada =
document.getElementById("nivelEntrada");

const nivelStop =
document.getElementById("nivelStop");

const nivelAlvo =
document.getElementById("nivelAlvo");

/* =========================================================
HISTÓRICO
========================================================= */

const historicoTabela =
document.getElementById("historicoTabela");

/* =========================================================
INICIALIZAÇÃO
========================================================= */

document.addEventListener(
"DOMContentLoaded",
iniciarAplicacao
);

function iniciarAplicacao() {

```
console.log(
    "Trade Analyzer iniciado."
);


/*
   Verifica se o motor de indicadores
   está carregado.
*/

if (
    !window.TradeIndicators
) {

    console.error(
        "indicators.js não foi carregado."
    );

    alert(
        "Erro: indicators.js não foi carregado."
    );

    return;
}


configurarEventos();

atualizarInterfaceInicial();

carregarHistorico();
```

}

/* =========================================================
EVENTOS
========================================================= */

function configurarEventos() {

```
/*
   Botão analisar
*/

if (btnAnalisar) {

    btnAnalisar.addEventListener(
        "click",
        executarAnalise
    );

}


/*
   Alteração do ativo
*/

if (ativoSelect) {

    ativoSelect.addEventListener(
        "change",
        () => {

            atualizarAtivo();

        }
    );

}


/*
   Alteração do timeframe
*/

if (timeframeSelect) {

    timeframeSelect.addEventListener(
        "change",
        () => {

            atualizarTimeframe();

        }
    );

}


/*
   Limpar histórico
*/

if (btnLimparHistorico) {

    btnLimparHistorico.addEventListener(
        "click",
        limparHistorico
    );

}
```

}

/* =========================================================
INTERFACE INICIAL
========================================================= */

function atualizarInterfaceInicial() {

```
atualizarAtivo();

atualizarTimeframe();

resetarIndicadores();
```

}

/* =========================================================
ATIVO
========================================================= */

function atualizarAtivo() {

```
if (!ativoSelect) {
    return;
}


const ativo =
    ativoSelect.value;


const texto =
    ativoSelect.options[
        ativoSelect.selectedIndex
    ].textContent;


if (infoAtivo) {

    infoAtivo.textContent =
        texto;

}


console.log(
    "Ativo selecionado:",
    ativo
);
```

}

/* =========================================================
TIMEFRAME
========================================================= */

function atualizarTimeframe() {

```
if (!timeframeSelect) {
    return;
}


const timeframe =
    timeframeSelect.value;


if (timeframeAtual) {

    timeframeAtual.textContent =
        timeframe.toUpperCase();

}


console.log(
    "Timeframe:",
    timeframe
);
```

}

/* =========================================================
EXECUTAR ANÁLISE
========================================================= */

async function executarAnalise() {

```
try {

    bloquearBotao(
        true
    );


    if (graficoStatus) {

        graficoStatus.textContent =
            "Gerando dados para análise...";

    }


    /*
       Pequena pausa visual
       para deixar a interface
       mais natural.
    */

    await esperar(350);


    const quantidade =
        Number(
            periodoSelect.value
        ) || 100;


    const ativo =
        ativoSelect.value;


    const timeframe =
        timeframeSelect.value;


    /*
       Gera candles simulados.
    */

    candlesAtuais =
        gerarCandlesSimulados(
            quantidade,
            ativo,
            timeframe
        );


    /*
       Analisa os candles.
    */

    const resultado =
        window.TradeIndicators.analisarMercado(
            candlesAtuais
        );


    if (!resultado.sucesso) {

        throw new Error(
            resultado.erro
        );

    }


    ultimaAnalise =
        resultado;


    /*
       Atualiza todas as partes
       da interface.
    */

    atualizarInformacoes(
        resultado
    );

    atualizarIndicadores(
        resultado
    );

    atualizarResultado(
        resultado
    );

    atualizarNiveis(
        resultado
    );

    desenharGrafico(
        candlesAtuais,
        resultado
    );


    /*
       Adiciona ao histórico.
    */

    adicionarHistorico(
        resultado
    );


    if (graficoStatus) {

        graficoStatus.textContent =
            "Análise concluída";

    }


    console.log(
        "Resultado da análise:",
        resultado
    );


} catch (erro) {

    console.error(
        "Erro na análise:",
        erro
    );


    alert(
        "Não foi possível realizar a análise.\n\n" +
        erro.message
    );


    if (graficoStatus) {

        graficoStatus.textContent =
            "Erro na análise";

    }

} finally {

    bloquearBotao(
        false
    );

}
```

}

/* =========================================================
GERADOR DE CANDLES SIMULADOS
========================================================= */

function gerarCandlesSimulados(
quantidade,
ativo,
timeframe
) {

```
const candles = [];


/*
   Preços iniciais aproximados apenas
   para deixar a simulação visual.
*/

const precosBase = {

    BTCUSDT:
        105000,

    ETHUSDT:
        2500,

    BNBUSDT:
        650,

    SOLUSDT:
        180,

    XRPUSDT:
        2.2

};


let preco =
    precosBase[ativo] ||
    100;


/*
   Cada ativo recebe uma volatilidade
   diferente.
*/

const volatilidades = {

    BTCUSDT:
        0.0025,

    ETHUSDT:
        0.004,

    BNBUSDT:
        0.0045,

    SOLUSDT:
        0.006,

    XRPUSDT:
        0.008

};


const volatilidade =
    volatilidades[ativo] ||
    0.005;


/*
   Determina uma tendência artificial.

   Isso é SOMENTE para teste.
*/

const tendenciaAleatoria =
    Math.random();


let tendencia;


if (tendenciaAleatoria < 0.33) {

    tendencia = -1;

} else if (tendenciaAleatoria > 0.66) {

    tendencia = 1;

} else {

    tendencia = 0;

}


/*
   Timestamp inicial.
*/

const agora =
    Date.now();


const intervalo =
    obterMilissegundosTimeframe(
        timeframe
    );


for (
    let i = 0;
    i < quantidade;
    i++
) {

    const abertura =
        preco;


    /*
       Movimento aleatório.
    */

    const ruido =
        (
            Math.random() -
            0.5
        ) * 2;


    /*
       Pequena tendência.
    */

    const movimentoTendencia =
        tendencia *
        volatilidade *
        0.35;


    const movimento =
        (
            ruido *
            volatilidade
        ) +
        movimentoTendencia;


    let fechamento =
        abertura *
        (
            1 +
            movimento
        );


    /*
       Evita preço negativo.
    */

    if (fechamento <= 0) {

        fechamento =
            abertura;

    }


    const variacaoMaxima =
        Math.abs(
            fechamento -
            abertura
        );


    const margem =
        Math.max(
            variacaoMaxima,
            abertura *
            volatilidade *
            0.5
        );


    const high =
        Math.max(
            abertura,
            fechamento
        ) +
        (
            Math.random() *
            margem *
            0.5
        );


    const low =
        Math.min(
            abertura,
            fechamento
        ) -
        (
            Math.random() *
            margem *
            0.5
        );


    /*
       Volume artificial.
    */

    const volumeBase =
        100000 +
        (
            Math.random() *
            900000
        );


    const volume =
        volumeBase *
        (
            1 +
            (
                Math.random() *
                1.5
            )
        );


    candles.push({

        time:
            agora -
            (
                (quantidade - i) *
                intervalo
            ),

        open:
            abertura,

        high:
            high,

        low:
            Math.max(
                low,
                0
            ),

        close:
            fechamento,

        volume:
            volume

    });


    preco =
        fechamento;

}


return candles;
```

}

/* =========================================================
TIMEFRAME EM MILISSEGUNDOS
========================================================= */

function obterMilissegundosTimeframe(
timeframe
) {

```
const valores = {

    "1m":
        60 * 1000,

    "5m":
        5 * 60 * 1000,

    "15m":
        15 * 60 * 1000,

    "30m":
        30 * 60 * 1000,

    "1h":
        60 * 60 * 1000,

    "4h":
        4 * 60 * 60 * 1000,

    "1d":
        24 * 60 * 60 * 1000

};


return valores[timeframe] ||
    5 * 60 * 1000;
```

}

/* =========================================================
ATUALIZAR INFORMAÇÕES
========================================================= */

function atualizarInformacoes(
resultado
) {

```
const preco =
    resultado.preco;


const candles =
    candlesAtuais;


/*
   Variação do primeiro candle
   até o último.
*/

const primeiro =
    candles[0]?.open ||
    preco;


const variacao =
    primeiro !== 0
        ? (
            (
                preco -
                primeiro
            ) /
            primeiro
        ) * 100
        : 0;


const volume =
    resultado.indicadores.volume.atual;


if (precoAtual) {

    precoAtual.textContent =
        formatarPreco(preco);

}


if (variacaoAtual) {

    variacaoAtual.textContent =
        `${variacao >= 0 ? "+" : ""}${variacao.toFixed(2)}%`;


    variacaoAtual.style.color =
        variacao >= 0
            ? "#19d68b"
            : "#ff5364";

}


if (volumeAtual) {

    volumeAtual.textContent =
        formatarNumeroGrande(
            volume
        );

}
```

}

/* =========================================================
ATUALIZAR INDICADORES
========================================================= */

function atualizarIndicadores(
resultado
) {

```
const indicadores =
    resultado.indicadores;


/* =====================================================
   RSI
===================================================== */

if (rsiValor) {

    rsiValor.textContent =
        Number.isFinite(
            indicadores.rsi.valor
        )
            ? indicadores.rsi.valor.toFixed(2)
            : "--";

}


if (rsiBarra) {

    const valorRSI =
        Math.max(
            0,
            Math.min(
                100,
                indicadores.rsi.valor || 0
            )
        );


    rsiBarra.style.width =
        `${valorRSI}%`;

}


atualizarSinalElemento(
    rsiSinal,
    indicadores.rsi.sinal
);


/* =====================================================
   MACD
===================================================== */

if (macdValor) {

    macdValor.textContent =
        formatarDecimal(
            indicadores.macd.valor,
            4
        );

}


atualizarSinalElemento(
    macdSinal,
    indicadores.macd.direcao
);


/* =====================================================
   EMA
===================================================== */

if (emaValor) {

    emaValor.textContent =
        `${formatarPreco(
            indicadores.tendencia.ema9
        )} / ${formatarPreco(
            indicadores.tendencia.ema21
        )}`;

}


atualizarSinalElemento(
    emaSinal,
    indicadores.tendencia.tendencia
);


/* =====================================================
   VOLUME
===================================================== */

if (volumeIndicador) {

    const percentual =
        indicadores.volume.percentual;


    volumeIndicador.textContent =
        `${percentual >= 0 ? "+" : ""}${percentual.toFixed(1)}%`;

}


if (volumeSinal) {

    if (
        indicadores.volume.sinal ===
        "FORTE"
    ) {

        atualizarSinalElemento(
            volumeSinal,
            "FORTE"
        );

    } else {

        volumeSinal.className =
            "sinal neutro";

        volumeSinal.textContent =
            "NORMAL";
    }

}


/* =====================================================
   BOLLINGER
===================================================== */

if (bollingerValor) {

    bollingerValor.textContent =
        formatarPreco(
            indicadores.bollinger.media
        );

}


atualizarSinalElemento(
    bollingerSinal,
    indicadores.bollinger.sinal
);


/* =====================================================
   TENDÊNCIA
===================================================== */

if (tendenciaValor) {

    tendenciaValor.textContent =
        indicadores.tendencia.forca +
        "%";

}


atualizarSinalElemento(
    tendenciaSinal,
    indicadores.tendencia.tendencia
);
```

}

/* =========================================================
ATUALIZAR CLASSE DOS SINAIS
========================================================= */

function atualizarSinalElemento(
elemento,
sinal
) {

```
if (!elemento) {
    return;
}


elemento.className =
    "sinal";


if (
    sinal === "ALTA" ||
    sinal === "COMPRA"
) {

    elemento.classList.add(
        "alta"
    );


    elemento.textContent =
        sinal;

    return;
}


if (
    sinal === "BAIXA" ||
    sinal === "VENDA"
) {

    elemento.classList.add(
        "baixa"
    );


    elemento.textContent =
        sinal;

    return;
}


if (
    sinal === "FORTE"
) {

    elemento.classList.add(
        "alta"
    );


    elemento.textContent =
        "FORTE";

    return;
}


elemento.classList.add(
    "neutro"
);


elemento.textContent =
    sinal || "NEUTRO";
```

}

/* =========================================================
ATUALIZAR RESULTADO
========================================================= */

function atualizarResultado(
resultado
) {

```
const pontuacao =
    resultado.pontuacao;


const sinal =
    pontuacao.sinal;


const confianca =
    pontuacao.confianca;


/*
   Sinal principal.
*/

if (sinalPrincipal) {

    sinalPrincipal.className =
        "";


    if (
        sinal === "COMPRA"
    ) {

        sinalPrincipal.classList.add(
            "alta"
        );


        sinalPrincipal.textContent =
            "📈 COMPRA";

    } else if (
        sinal === "VENDA"
    ) {

        sinalPrincipal.classList.add(
            "baixa"
        );


        sinalPrincipal.textContent =
            "📉 VENDA";

    } else {

        sinalPrincipal.classList.add(
            "neutro"
        );


        sinalPrincipal.textContent =
            "⏸ AGUARDAR";
    }

}


/*
   Confiança.
*/

if (confiancaValor) {

    confiancaValor.textContent =
        `${confianca.toFixed(1)}%`;

}


if (barraConfianca) {

    barraConfianca.style.width =
        `${Math.min(
            confianca,
            100
        )}%`;


    /*
       Cor visual baseada no sinal.
    */

    if (sinal === "COMPRA") {

        barraConfianca.style.background =
            "#19d68b";

    } else if (
        sinal === "VENDA"
    ) {

        barraConfianca.style.background =
            "#ff5364";

    } else {

        barraConfianca.style.background =
            "#f4c95d";

    }

}


/*
   Pontuação.
*/

if (pontosAlta) {

    pontosAlta.textContent =
        pontuacao.pontosAlta;

    pontosAlta.style.color =
        "#19d68b";

}


if (pontosBaixa) {

    pontosBaixa.textContent =
        pontuacao.pontosBaixa;

    pontosBaixa.style.color =
        "#ff5364";

}


/*
   Força do sinal.
*/

if (forcaSinal) {

    if (confianca >= 75) {

        forcaSinal.textContent =
            "FORTE";

    } else if (
        confianca >= 60
    ) {

        forcaSinal.textContent =
            "MODERADO";

    } else if (
        confianca >= 50
    ) {

        forcaSinal.textContent =
            "FRACO";

    } else {

        forcaSinal.textContent =
            "MUITO FRACO";
    }

}
```

}

/* =========================================================
ATUALIZAR NÍVEIS
========================================================= */

function atualizarNiveis(
resultado
) {

```
const niveis =
    resultado.niveis;


if (nivelEntrada) {

    nivelEntrada.textContent =
        formatarPreco(
            niveis.entrada
        );

}


if (nivelStop) {

    nivelStop.textContent =
        formatarPreco(
            niveis.stop
        );

}


if (nivelAlvo) {

    nivelAlvo.textContent =
        formatarPreco(
            niveis.alvo
        );

}
```

}

/* =========================================================
DESENHAR GRÁFICO
========================================================= */

function desenharGrafico(
candles,
resultado
) {

```
if (!grafico) {
    return;
}


/*
   Aqui ainda não usamos uma biblioteca externa.

   Criamos um gráfico simples usando
   HTML + SVG.

   Posteriormente podemos substituir
   por um gráfico profissional de candles.
*/


const largura =
    grafico.clientWidth ||
    900;


const altura =
    460;


const margem =
    35;


const precos =
    candles.flatMap(
        candle => [
            candle.high,
            candle.low
        ]
    );


const maximo =
    Math.max(
        ...precos
    );


const minimo =
    Math.min(
        ...precos
    );


const intervalo =
    maximo -
    minimo ||
    1;


const quantidade =
    candles.length;


const espaco =
    (
        largura -
        margem * 2
    ) /
    quantidade;


let svg =
    `
    <svg
        width="100%"
        height="${altura}"
        viewBox="0 0 ${largura} ${altura}"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
    >
    `;


/*
   Linhas horizontais.
*/

for (
    let i = 0;
    i <= 5;
    i++
) {

    const y =
        margem +
        (
            (altura -
            margem * 2) *
            (i / 5)
        );


    const precoLinha =
        maximo -
        (
            intervalo *
            (i / 5)
        );


    svg +=
        `
        <line
            x1="${margem}"
            y1="${y}"
            x2="${largura - margem}"
            y2="${y}"
            stroke="rgba(255,255,255,0.06)"
            stroke-width="1"
        />

        <text
            x="${largura - margem + 3}"
            y="${y + 3}"
            fill="#718096"
            font-size="9"
        >
            ${formatarPreco(precoLinha)}
        </text>
        `;
}


/*
   Desenha candles.

   Para não sobrecarregar o navegador,
   mostramos no máximo 120 candles.
*/

const candlesVisiveis =
    candles.slice(-120);


const espacoVisual =
    (
        largura -
        margem * 2
    ) /
    candlesVisiveis.length;


candlesVisiveis.forEach(
    (candle, index) => {

        const x =
            margem +
            (
                index *
                espacoVisual
            );


        const centro =
            x +
            (
                espacoVisual /
                2
            );


        const yHigh =
            converterPrecoY(
                candle.high,
                minimo,
                intervalo,
                altura,
                margem
            );


        const yLow =
            converterPrecoY(
                candle.low,
                minimo,
                intervalo,
                altura,
                margem
            );


        const yOpen =
            converterPrecoY(
                candle.open,
                minimo,
                intervalo,
                altura,
                margem
            );


        const yClose =
            converterPrecoY(
                candle.close,
                minimo,
                intervalo,
                altura,
                margem
            );


        const alta =
            candle.close >=
            candle.open;


        const corpoTopo =
            Math.min(
                yOpen,
                yClose
            );


        const corpoAltura =
            Math.max(
                1,
                Math.abs(
                    yClose -
                    yOpen
                )
            );


        const larguraCandle =
            Math.max(
                2,
                Math.min(
                    7,
                    espacoVisual * 0.65
                )
            );


        const cor =
            alta
                ? "#19d68b"
                : "#ff5364";


        /*
           Pavio.
        */

        svg +=
            `
            <line
                x1="${centro}"
                y1="${yHigh}"
                x2="${centro}"
                y2="${yLow}"
                stroke="${cor}"
                stroke-width="1"
            />
            `;


        /*
           Corpo.
        */

        svg +=
            `
            <rect
                x="${centro - larguraCandle / 2}"
                y="${corpoTopo}"
                width="${larguraCandle}"
                height="${corpoAltura}"
                fill="${cor}"
                rx="1"
            />
            `;

    }
);


/*
   Linha de entrada.
*/

if (
    resultado &&
    resultado.niveis &&
    Number.isFinite(
        resultado.niveis.entrada
    )
) {

    const yEntrada =
        converterPrecoY(
            resultado.niveis.entrada,
            minimo,
            intervalo,
            altura,
            margem
        );


    svg +=
        `
        <line
            x1="${margem}"
            y1="${yEntrada}"
            x2="${largura - margem}"
            y2="${yEntrada}"
            stroke="#4da3ff"
            stroke-width="1.5"
            stroke-dasharray="6 4"
        />

        <text
            x="${margem + 5}"
            y="${yEntrada - 5}"
            fill="#4da3ff"
            font-size="10"
            font-weight="bold"
        >
            ENTRADA
        </text>
        `;
}


/*
   Linha de Stop.
*/

if (
    resultado &&
    resultado.niveis &&
    Number.isFinite(
        resultado.niveis.stop
    )
) {

    const yStop =
        converterPrecoY(
            resultado.niveis.stop,
            minimo,
            intervalo,
            altura,
            margem
        );


    svg +=
        `
        <line
            x1="${margem}"
            y1="${yStop}"
            x2="${largura - margem}"
            y2="${yStop}"
            stroke="#ff5364"
            stroke-width="1"
            stroke-dasharray="4 4"
        />

        <text
            x="${margem + 5}"
            y="${yStop - 5}"
            fill="#ff5364"
            font-size="9"
        >
            STOP
        </text>
        `;
}


/*
   Linha de alvo.
*/

if (
    resultado &&
    resultado.niveis &&
    Number.isFinite(
        resultado.niveis.alvo
    )
) {

    const yAlvo =
        converterPrecoY(
            resultado.niveis.alvo,
            minimo,
            intervalo,
            altura,
            margem
        );


    svg +=
        `
        <line
            x1="${margem}"
            y1="${yAlvo}"
            x2="${largura - margem}"
            y2="${yAlvo}"
            stroke="#19d68b"
            stroke-width="1"
            stroke-dasharray="4 4"
        />

        <text
            x="${margem + 5}"
            y="${yAlvo - 5}"
            fill="#19d68b"
            font-size="9"
        >
            ALVO
        </text>
        `;
}


svg +=
    "</svg>";


grafico.innerHTML =
    svg;
```

}

/* =========================================================
CONVERTER PREÇO PARA Y
========================================================= */

function converterPrecoY(
preco,
minimo,
intervalo,
altura,
margem
) {

```
const alturaUtil =
    altura -
    margem * 2;


const proporcao =
    (
        preco -
        minimo
    ) /
    intervalo;


return (
    altura -
    margem -
    (
        proporcao *
        alturaUtil
    )
);
```

}

/* =========================================================
HISTÓRICO
========================================================= */

function adicionarHistorico(
resultado
) {

```
const historico =
    obterHistorico();


const registro = {

    horario:
        new Date()
            .toLocaleTimeString(
                "pt-BR"
            ),

    data:
        new Date()
            .toLocaleDateString(
                "pt-BR"
            ),

    ativo:
        ativoSelect.value,

    timeframe:
        timeframeSelect.value,

    preco:
        resultado.preco,

    sinal:
        resultado.pontuacao.sinal,

    confianca:
        resultado.pontuacao.confianca

};


historico.unshift(
    registro
);


/*
   Limita a quantidade armazenada.
*/

const limitado =
    historico.slice(
        0,
        CONFIG.maxHistorico
    );


localStorage.setItem(

    CONFIG.historicoStorage,

    JSON.stringify(
        limitado
    )

);


renderizarHistorico(
    limitado
);
```

}

/* =========================================================
OBTER HISTÓRICO
========================================================= */

function obterHistorico() {

```
try {

    const salvo =
        localStorage.getItem(
            CONFIG.historicoStorage
        );


    if (!salvo) {

        return [];

    }


    const historico =
        JSON.parse(
            salvo
        );


    return Array.isArray(
        historico
    )
        ? historico
        : [];


} catch (erro) {

    console.error(
        "Erro ao carregar histórico:",
        erro
    );


    return [];

}
```

}

/* =========================================================
CARREGAR HISTÓRICO
========================================================= */

function carregarHistorico() {

```
const historico =
    obterHistorico();


renderizarHistorico(
    historico
);
```

}

/* =========================================================
RENDERIZAR HISTÓRICO
========================================================= */

function renderizarHistorico(
historico
) {

```
if (!historicoTabela) {
    return;
}


if (
    !historico ||
    historico.length === 0
) {

    historicoTabela.innerHTML =
        `
        <tr>
            <td colspan="6">
                Nenhuma análise realizada.
            </td>
        </tr>
        `;

    return;
}


historicoTabela.innerHTML =
    "";


historico.forEach(
    registro => {

        const tr =
            document.createElement(
                "tr"
            );


        let classeSinal =
            "";


        if (
            registro.sinal ===
            "COMPRA"
        ) {

            classeSinal =
                "alta";

        } else if (
            registro.sinal ===
            "VENDA"
        ) {

            classeSinal =
                "baixa";

        }


        tr.innerHTML =
            `
            <td>
                ${registro.horario}
            </td>

            <td>
                ${registro.ativo}
            </td>

            <td>
                ${registro.timeframe.toUpperCase()}
            </td>

            <td>
                ${formatarPreco(
                    registro.preco
                )}
            </td>

            <td>
                <span
                    class="sinal ${classeSinal}"
                >
                    ${registro.sinal}
                </span>
            </td>

            <td>
                ${Number(
                    registro.confianca
                ).toFixed(1)}%
            </td>
            `;


        historicoTabela.appendChild(
            tr
        );

    }
);
```

}

/* =========================================================
LIMPAR HISTÓRICO
========================================================= */

function limparHistorico() {

```
const confirmar =
    confirm(
        "Deseja realmente apagar todo o histórico?"
    );


if (!confirmar) {
    return;
}


localStorage.removeItem(
    CONFIG.historicoStorage
);


renderizarHistorico(
    []
);


console.log(
    "Histórico apagado."
);
```

}

/* =========================================================
RESETAR INDICADORES
========================================================= */

function resetarIndicadores() {

```
const elementos =
    [

        rsiValor,
        macdValor,
        emaValor,
        volumeIndicador,
        bollingerValor,
        tendenciaValor

    ];


elementos.forEach(
    elemento => {

        if (elemento) {

            elemento.textContent =
                "--";

        }

    }
);


const sinais =
    [

        rsiSinal,
        macdSinal,
        emaSinal,
        volumeSinal,
        bollingerSinal,
        tendenciaSinal

    ];


sinais.forEach(
    elemento => {

        if (elemento) {

            elemento.className =
                "sinal neutro";

            elemento.textContent =
                "AGUARDANDO";

        }

    }
);


if (rsiBarra) {

    rsiBarra.style.width =
        "0%";

}


if (sinalPrincipal) {

    sinalPrincipal.className =
        "neutro";

    sinalPrincipal.textContent =
        "AGUARDANDO";

}


if (confiancaValor) {

    confiancaValor.textContent =
        "0%";

}


if (barraConfianca) {

    barraConfianca.style.width =
        "0%";

}


if (pontosAlta) {

    pontosAlta.textContent =
        "0";

}


if (pontosBaixa) {

    pontosBaixa.textContent =
        "0";

}


if (forcaSinal) {

    forcaSinal.textContent =
        "--";

}


if (nivelEntrada) {

    nivelEntrada.textContent =
        "--";

}


if (nivelStop) {

    nivelStop.textContent =
        "--";

}


if (nivelAlvo) {

    nivelAlvo.textContent =
        "--";

}
```

}

/* =========================================================
BOTÃO
========================================================= */

function bloquearBotao(
bloqueado
) {

```
if (!btnAnalisar) {
    return;
}


btnAnalisar.disabled =
    bloqueado;


if (bloqueado) {

    btnAnalisar.textContent =
        "ANALISANDO...";

} else {

    btnAnalisar.textContent =
        "ANALISAR GRÁFICO";

}
```

}

/* =========================================================
FORMATAR PREÇO
========================================================= */

function formatarPreco(
valor
) {

```
if (
    !Number.isFinite(
        Number(valor)
    )
) {

    return "--";

}


const numero =
    Number(valor);


/*
   Para preços muito pequenos,
   mostramos mais casas.
*/

let casas = 2;


if (
    numero < 1
) {

    casas = 6;

} else if (
    numero < 10
) {

    casas = 4;

}


return numero.toLocaleString(
    "pt-BR",
    {

        minimumFractionDigits:
            casas,

        maximumFractionDigits:
            casas

    }
);
```

}

/* =========================================================
FORMATAR DECIMAL
========================================================= */

function formatarDecimal(
valor,
casas = 2
) {

```
if (
    !Number.isFinite(
        Number(valor)
    )
) {

    return "--";

}


return Number(valor)
    .toLocaleString(
        "pt-BR",
        {

            minimumFractionDigits:
                casas,

            maximumFractionDigits:
                casas

        }
    );
```

}

/* =========================================================
FORMATAR NÚMERO GRANDE
========================================================= */

function formatarNumeroGrande(
valor
) {

```
if (
    !Number.isFinite(
        Number(valor)
    )
) {

    return "--";

}


const numero =
    Number(valor);


if (
    numero >= 1000000000
) {

    return (
        numero / 1000000000
    ).toFixed(2) + "B";

}


if (
    numero >= 1000000
) {

    return (
        numero / 1000000
    ).toFixed(2) + "M";

}


if (
    numero >= 1000
) {

    return (
        numero / 1000
    ).toFixed(2) + "K";

}


return numero.toFixed(
    0
);
```

}

/* =========================================================
ESPERAR
========================================================= */

function esperar(
milissegundos
) {

```
return new Promise(
    resolve =>
        setTimeout(
            resolve,
            milissegundos
        )
);
```

}

/* =========================================================
REDIMENSIONAMENTO DO GRÁFICO
========================================================= */

window.addEventListener(
"resize",
() => {

```
    if (
        candlesAtuais.length > 0 &&
        ultimaAnalise
    ) {

        desenharGrafico(
            candlesAtuais,
            ultimaAnalise
        );

    }

}
```

);

/* =========================================================
EXPOSIÇÃO GLOBAL
========================================================= */

window.TradeAnalyzer = {

```
executarAnalise,

gerarCandlesSimulados,

desenharGrafico,

obterHistorico,

limparHistorico
```

};
