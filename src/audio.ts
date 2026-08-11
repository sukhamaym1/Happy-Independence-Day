let audio: HTMLAudioElement | null = null;
let isPlaying = false;
let playPromise: Promise<void> | undefined;

export const initAudioOnFirstInteraction = () => {
  if (!audio) {
    return toggleAudio();
  }
  return isPlaying;
};

export const toggleAudio = () => {
  if (!audio) {
    // Looks for a file named 'bg-music.mp3' in your public folder
    audio = new Audio('./bg-music.mp3');
    audio.loop = true; // Loops the music automatically
    audio.volume = 0.5; // Set volume to 50%
  }

  if (isPlaying) {
    if (playPromise !== undefined) {
      playPromise.then(() => {
        audio?.pause();
      }).catch(() => {
        // Ignore errors from interrupted play promises
      });
    } else {
      audio.pause();
    }
    isPlaying = false;
  } else {
    // Play returns a promise, we catch errors if the browser blocks it or file is missing
    playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        console.warn("Audio playback issue (file might be missing yet):", e.message);
        isPlaying = false; // Reset state if it fails to play
      });
    }
    isPlaying = true;
  }

  return isPlaying;
};

