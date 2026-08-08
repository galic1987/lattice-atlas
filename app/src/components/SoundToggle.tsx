import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sound } from '@/lib/sound';

export default function SoundToggle() {
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());

  const toggle = () => {
    const nextState = sound.toggleMute();
    setIsMuted(nextState);
    if (!nextState) {
      sound.playSyndromeTick(660);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={isMuted ? 'Unmute Audio Cues' : 'Mute Audio Cues'}
      aria-label={isMuted ? 'Unmute Web Audio Cues' : 'Mute Web Audio Cues'}
      className="inline-flex items-center gap-1.5 rounded-full border border-ink-600 bg-ink-800/80 px-2.5 py-1 text-xs text-text-mid transition-colors hover:border-plaquette hover:text-plaquette"
    >
      {isMuted ? <VolumeX className="h-3.5 w-3.5 text-text-low" /> : <Volume2 className="h-3.5 w-3.5 text-plaquette" />}
      <span className="font-mono text-[11px]">{isMuted ? 'Audio Off' : 'Audio On'}</span>
    </button>
  );
}
