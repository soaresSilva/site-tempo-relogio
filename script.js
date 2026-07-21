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
let emExecucao = false;

function atualizarDisplay() {
  const minutos = Math.floor(tempoRestante / 60);
  const segundos = tempoRestante % 60;
  document.getElementById('timer-display').textContent = 
    `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

function iniciarPausar() {
  if (emExecucao) {
    // Pausar: limpar intervalo, mudar estado, talvez mudar texto do botão
    clearInterval(timerId);
    emExecucao = false;
  } else {
    // Iniciar: criar intervalo que decrementa tempoRestante a cada 1000ms
    // Se tempoRestante chegar a 0, parar e alertar
    // Lembre-se de atualizar o display a cada segundo
    // ...
  }
}

// Chama uma vez ao carregar a página
atualizarVideo();
atualizarRelogio();
// Atualiza a cada 30 minutos (ou a cada hora, como preferir)
setInterval(atualizarVideo, 1800000);
setInterval(atualizarRelogio, 1000);




