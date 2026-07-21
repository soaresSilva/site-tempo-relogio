function trocarVideo(clima) {
  const video = document.getElementById('bg-video');
  video.src = `videos/${clima}.mp4`;
  video.play();
}