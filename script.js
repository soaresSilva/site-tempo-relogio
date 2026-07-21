function atualizarVideo() {
  const hora = new Date().getHours();
  let periodo;

  if (hora >= 5 && hora < 12) periodo = 'sun-morning';
  else if (hora >= 12 && hora < 17) periodo = 'rain-afternoon';
  else periodo = 'snow-night';

  const video = document.getElementById('bg-video');
  video.src = `videos/${periodo}.mp4`;
  video.play();
  console.log(hora, periodo); // Para depuração
}

function atualizarRelogio() {
  const agora = new Date();
  const horarioLocal = agora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.getElementById('time').textContent = horarioLocal;
}

let tempoRestante = 25 * 60; // 25 minutos em segundos
let timerId = null;

const timerDisplay = document.getElementById('timer-display');
const btnIniciar = document.getElementById('btn-iniciar');
const btnPausar = document.getElementById('btn-pausar');
const btnResetar = document.getElementById('btn-resetar');

function atualizarDisplay() {
  const minutos = Math.floor(tempoRestante / 60);
  const segundos = tempoRestante % 60;
  timerDisplay.textContent = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

function iniciarTimer() {
  if (timerId) return; // Já está rodando
  timerId = setInterval(() => {
    tempoRestante--;
    atualizarDisplay();
    if (tempoRestante <= 0) {
      clearInterval(timerId);
      timerId = null;
      alert('Tempo esgotado!');
    }
  }, 1000);
}

function pausarTimer() {
  clearInterval(timerId);
  timerId = null;
}

function resetarTimer() {
  clearInterval(timerId);
  timerId = null;
  tempoRestante = 25 * 60; // Reseta para 25 minutos
  atualizarDisplay();
}

atualizarDisplay();
// Chama uma vez ao carregar a página
atualizarVideo();
atualizarRelogio();
// Atualiza a cada 30 minutos (ou a cada hora, como preferir)
setInterval(atualizarVideo, 1800000);
setInterval(atualizarRelogio, 1000);

btnIniciar.addEventListener('click', iniciarTimer);
btnPausar.addEventListener('click', pausarTimer);
btnResetar.addEventListener('click', resetarTimer);





