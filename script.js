/* =====================================================
   CONFIGURAÇÕES
===================================================== */

const TEMPO_POMODORO = 25 * 60;
let tempoRestante = TEMPO_POMODORO;
let timerId = null;
let player = null;

/* =====================================================
   PLAYLISTS
===================================================== */

const playlists = {
  morning: [
    {
      nome: "Morning Focus",
      video: "M7lc1UVf-VE"
    }
  ],
  afternoon: [
    {
      nome: "Afternoon Coding",
      video: "M7lc1UVf-VE"
    }
  ],
  rain: [
    {
      nome: "Rain Lofi",
      video: "M7lc1UVf-VE"
    }
  ],
  night: [
    {
      nome: "Night Study",
      video: "M7lc1UVf-VE"
    }
  ]
};


/* =====================================================
   ELEMENTOS
===================================================== */

const videoBackground = document.getElementById("bg-video");
const timeElement = document.getElementById("time");
const weatherElement = document.getElementById("weather");
const timerDisplay = document.getElementById("timer-display");
const playlistElement = document.getElementById("playlist");
const nowPlaying = document.getElementById("now-playing");
const btnIniciar = document.getElementById("btn-iniciar");
const btnPausar = document.getElementById("btn-pausar");
const btnResetar = document.getElementById("btn-resetar");


/* =====================================================
   RELÓGIO
===================================================== */

function atualizarRelogio() {

  const agora = new Date();

  timeElement.textContent =
    agora.toLocaleTimeString(
      "pt-BR"
    );
}

/* =====================================================
   PERÍODO DO DIA
===================================================== */

function obterPeriodo() {

  const hora = new Date().getHours();

  if (hora >= 5 && hora < 12) {

    return "morning";

  }

  if (hora >= 12 && hora < 18) {

    return "afternoon";

  }

  return "night";

}


/* =====================================================
   VÍDEO DE FUNDO
===================================================== */

function atualizarVideo(codigoClima) {


  let arquivo;


  const periodo =
    obterPeriodo();



  if (codigoClima >= 51 && codigoClima <= 67) {

    arquivo =
      "rain-afternoon";

  }


  else if (periodo === "morning") {

    arquivo =
      "sun-morning";

  }


  else if (periodo === "afternoon") {

    arquivo =
      "cloud-afternoon";

  }


  else {

    arquivo =
      "night-study";

  }



  videoBackground.src =
    `videos/${arquivo}.mp4`;


  videoBackground.play();


}
/* =====================================================
   POMODORO
===================================================== */

function atualizarDisplay() {

  const minutos = Math.floor(tempoRestante / 60);

  const segundos = tempoRestante % 60;

  timerDisplay.textContent =
    `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;

}


function iniciarPomodoro() {

  if (timerId) return;

  timerId = setInterval(() => {

    tempoRestante--;

    atualizarDisplay();

    if (tempoRestante <= 0) {

      clearInterval(timerId);

      timerId = null;

      alert("Pomodoro concluído!");

    }

  }, 1000);

}


function pausarPomodoro() {

  clearInterval(timerId);

  timerId = null;

}


function resetarPomodoro() {

  clearInterval(timerId);

  timerId = null;

  tempoRestante = TEMPO_POMODORO;

  atualizarDisplay();

}


btnIniciar.addEventListener("click", iniciarPomodoro);

btnPausar.addEventListener("click", pausarPomodoro);

btnResetar.addEventListener("click", resetarPomodoro);


/* =====================================================
   CLIMA
===================================================== */

const LATITUDE = -23.5505;

const LONGITUDE = -46.6333;


async function obterClima() {

  try {

    const resposta = await fetch(

      `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current_weather=true`

    );

    const dados = await resposta.json();

    const temperatura =
      dados.current_weather.temperature;

    const codigo =
      dados.current_weather.weathercode;

    weatherElement.textContent =
      `${temperatura}°C • ${traduzirCodigo(codigo)}`;

    atualizarPlaylist(codigo);

  }

  catch (erro) {

    console.error(erro);

    weatherElement.textContent =
      "Erro ao carregar clima";

  }

}


/* =====================================================
   CÓDIGOS WMO
===================================================== */

function traduzirCodigo(codigo) {

  const mapa = {

    0: "☀ Céu limpo",

    1: "🌤 Poucas nuvens",

    2: "⛅ Parcialmente nublado",

    3: "☁ Encoberto",

    45: "🌫 Neblina",

    48: "🌫 Neblina intensa",

    51: "🌦 Chuvisco",

    53: "🌦 Chuvisco moderado",

    55: "🌧 Chuvisco forte",

    61: "🌧 Chuva leve",

    63: "🌧 Chuva",

    65: "🌧 Chuva forte",

    71: "❄ Neve",

    73: "❄ Neve moderada",

    75: "❄ Neve forte",

    95: "⛈ Tempestade"

  };

  return mapa[codigo] || "Clima desconhecido";

}

/* =====================================================
   PLAYLIST DINÂMICA
===================================================== */

function atualizarPlaylist(codigo) {

  let categoria;


  // Chuva
  if (
    codigo >= 51 &&
    codigo <= 67
  ) {

    categoria = "rain";

  }

  // Noite
  else if (
    obterPeriodo() === "night"
  ) {

    categoria = "night";

  }

  // Tarde
  else if (
    obterPeriodo() === "afternoon"
  ) {

    categoria = "afternoon";

  }

  // Manhã
  else {

    categoria = "morning";

  }


  const musica =
    playlists[categoria][0];


  nowPlaying.textContent =
    musica.nome;


  carregarPlaylist(
    musica.video
  );


}

/* =====================================================
   YOUTUBE PLAYER
===================================================== */


function carregarPlaylist(videoId) {


  if (player) {

    player.loadVideoById(videoId);

    return;

  }


  player = new YT.Player(
    "youtube-player",
    {

      height: "0",

      width: "0",

      videoId: videoId,

      playerVars: {

        autoplay: 1,

        loop: 1,

        controls: 0

      }

    }

  );

}

/* Efeito de blur ao scroll */
function handleScroll() {
  const overlay = document.querySelector('.overlay');
  const scrollY = window.scrollY;
  const maxScroll = window.innerHeight; // altura da tela

  // Calcula o nível de blur: 0 a 10px conforme o scroll
  let blurValue = Math.min(scrollY / maxScroll * 10, 10);
  overlay.style.backdropFilter = `blur(${blurValue}px)`;
}

window.addEventListener('scroll', handleScroll);