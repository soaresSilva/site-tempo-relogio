/* =====================================================
   CONFIGURAÇÕES INICIAIS
===================================================== */

const CLIENT_ID = "803149093383-livgk369dhi8776897k58khrtsqo8hih.apps.googleusercontent.com";
const API_KEY = "AIzaSyBqHKV-y_QHGNCVSboyRPDqg1DAfWnydbg";
const TEMPO_POMODORO = 25 * 60;
const LATITUDE = -23.5505;
const LONGITUDE = -46.6333;
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest';

let tempoRestante = TEMPO_POMODORO;
let timerId = null;
let player = null;

/* =====================================================
   ELEMENTOS DO DOM
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
const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');
const playlistContainer = document.getElementById('playlist-container');

/* =====================================================
   PLAYER DO YOUTUBE (INICIALIZAÇÃO)
===================================================== */

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '200',
        width: '100%',
        videoId: '',
        playerVars: {
            controls: 1,
            modestbranding: 1,
            rel: 0
        }
    });
}

/* =====================================================
   RELÓGIO
===================================================== */

function atualizarRelogio() {
    const agora = new Date();
    timeElement.textContent = agora.toLocaleTimeString("pt-BR");
}

/* =====================================================
   PERÍODO DO DIA
===================================================== */

function obterPeriodo() {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return "morning";
    if (hora >= 12 && hora < 18) return "afternoon";
    return "night";
}

/* =====================================================
   VÍDEO DE FUNDO (USANDO OS 3 ARQUIVOS CORRETOS)
===================================================== */

function atualizarVideo() {
    const periodo = obterPeriodo();
    let arquivo;

    if (periodo === "morning") {
        arquivo = "sun-morning";
    } else if (periodo === "afternoon") {
        arquivo = "rain-afternoon";
    } else {
        arquivo = "snow-night";
    }

    videoBackground.src = `videos/${arquivo}.mp4`;
    videoBackground.play();
}

/* =====================================================
   POMODORO
===================================================== */

function atualizarDisplay() {
    const minutos = Math.floor(tempoRestante / 60);
    const segundos = tempoRestante % 60;
    timerDisplay.textContent = `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
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

function traduzirCodigo(codigo) {
    const mapa = {
        0: "☀ Céu limpo", 1: "🌤 Poucas nuvens", 2: "⛅ Parcialmente nublado",
        3: "☁ Encoberto", 45: "🌫 Neblina", 48: "🌫 Neblina intensa",
        51: "🌦 Chuvisco", 53: "🌦 Chuvisco moderado", 55: "🌧 Chuvisco forte",
        61: "🌧 Chuva leve", 63: "🌧 Chuva", 65: "🌧 Chuva forte",
        71: "❄ Neve", 73: "❄ Neve moderada", 75: "❄ Neve forte",
        95: "⛈ Tempestade"
    };
    return mapa[codigo] || "Clima desconhecido";
}

async function obterClima() {
    try {
        const resposta = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current_weather=true`
        );
        const dados = await resposta.json();
        const temperatura = dados.current_weather.temperature;
        const codigo = dados.current_weather.weathercode;
        const local = "São Paulo, Brasil";
        const vento = dados.current_weather.windspeed;

        weatherElement.innerHTML = `
            <strong>${local}</strong><br>
            ${temperatura}°C • ${traduzirCodigo(codigo)}<br>
            💨 Vento: ${vento} km/h
        `;
    } catch (erro) {
        console.error(erro);
        weatherElement.textContent = "Erro ao carregar clima";
    }
}

/* =====================================================
   OAUTH YOUTUBE (CARREGAMENTO DINÂMICO)
===================================================== */

let tokenClient;
let gapiInited = false;
let gisInited = false;

function carregarScriptGoogle(url, callback) {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = callback;
    document.head.appendChild(script);
}

carregarScriptGoogle('https://apis.google.com/js/api.js', () => {
    gapi.load('client', async () => {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        carregarScriptGoogle('https://accounts.google.com/gsi/client', () => {
            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/youtube.readonly',
                callback: '',
            });
            gisInited = true;
            maybeEnableButtons();
        });
    });
});

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        btnLogin.style.visibility = 'visible';
    }
}

function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) throw resp;
        btnLogin.style.display = 'none';
        btnLogout.style.display = 'block';
        playlistContainer.style.display = 'block';
        nowPlaying.textContent = 'Escolha uma playlist...';
        carregarPlaylistsUsuario();
    };
    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
    }
    btnLogin.style.display = 'block';
    btnLogout.style.display = 'none';
    playlistContainer.style.display = 'none';
    playlistContainer.innerHTML = '';
    nowPlaying.textContent = 'Faça login para acessar suas playlists';
    if (player && player.stopVideo) player.stopVideo();
}

async function carregarPlaylistsUsuario() {
    try {
        const response = await gapi.client.youtube.playlists.list({
            part: 'snippet', mine: true, maxResults: 25,
        });
        exibirPlaylists(response.result.items);
    } catch (err) {
        console.error('Erro ao carregar playlists:', err);
        nowPlaying.textContent = 'Erro ao carregar playlists';
    }
}

function exibirPlaylists(playlists) {
    playlistContainer.innerHTML = '';
    if (!playlists || playlists.length === 0) {
        playlistContainer.innerHTML = '<p style="text-align:center;color:#aaa;">Nenhuma playlist encontrada</p>';
        return;
    }
    playlists.forEach(playlist => {
        const div = document.createElement('div');
        div.className = 'playlist-item';
        div.textContent = playlist.snippet.title;
        div.addEventListener('click', () => {
            nowPlaying.textContent = 'Carregando...';
            carregarVideosPlaylist(playlist.id);
        });
        playlistContainer.appendChild(div);
    });
}

async function carregarVideosPlaylist(playlistId) {
    try {
        const response = await gapi.client.youtube.playlistItems.list({
            part: 'snippet', playlistId: playlistId, maxResults: 50,
        });
        exibirVideos(response.result.items);
    } catch (err) {
        console.error('Erro ao carregar vídeos:', err);
        nowPlaying.textContent = 'Erro ao carregar vídeos';
    }
}

function exibirVideos(videos) {
    playlistContainer.innerHTML = '';
    const voltar = document.createElement('div');
    voltar.className = 'playlist-item';
    voltar.textContent = '⬅ Voltar para playlists';
    voltar.style.fontWeight = 'bold';
    voltar.addEventListener('click', carregarPlaylistsUsuario);
    playlistContainer.appendChild(voltar);

    videos.forEach(video => {
        const div = document.createElement('div');
        div.className = 'playlist-item';
        div.textContent = video.snippet.title;
        div.addEventListener('click', () => {
            if (player && player.loadVideoById) {
                player.loadVideoById(video.snippet.resourceId.videoId);
            } else if (typeof YT !== 'undefined' && YT.Player) {
                player = new YT.Player('youtube-player', {
                    height: '200', width: '100%',
                    videoId: video.snippet.resourceId.videoId,
                    playerVars: { autoplay: 1, controls: 1 }
                });
            }
            nowPlaying.textContent = video.snippet.title;
        });
        playlistContainer.appendChild(div);
    });
}

/* =====================================================
   EFEITO DE BLUR AO SCROLL
===================================================== */

function handleScroll() {
    const overlay = document.querySelector('.overlay');
    const scrollY = window.scrollY;
    const maxScroll = window.innerHeight;
    let blurValue = Math.min(scrollY / maxScroll * 10, 10);
    overlay.style.backdropFilter = `blur(${blurValue}px)`;
}
window.addEventListener('scroll', handleScroll);

/* =====================================================
   INICIALIZAÇÃO GERAL
===================================================== */

atualizarVideo();                // carrega o vídeo correto para o horário atual
atualizarRelogio();
setInterval(atualizarRelogio, 1000);
setInterval(atualizarVideo, 60000); // verifica se o período mudou a cada minuto

obterClima();
setInterval(obterClima, 1800000);

atualizarDisplay();