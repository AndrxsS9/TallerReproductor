import React, { useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music } from 'lucide-react';
import { Node } from '../lib/DoublyLinkedList';

interface AudioControlsProps {
  currentNode: Node | null;
  isPlaying: boolean;
  togglePlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  progress: number;
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
}

const formatTime = (time: number) => {
  if (!time || isNaN(time)) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export const AudioControls: React.FC<AudioControlsProps> = ({
  currentNode,
  isPlaying,
  togglePlayPause,
  onNext,
  onPrev,
  progress,
  duration,
  currentTime,
  onSeek
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || !currentNode) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    onSeek(pct * duration);
  };

  return (
    <div className="bottom-player-bar">
      

      <div className="player-left">
        <div className="now-playing-thumb" style={currentNode ? { backgroundColor: currentNode.data.color } : {}}>
          {currentNode ? (
            <Music size={24} color="rgba(255,255,255,0.7)" />
          ) : (
             <Music size={24} />
          )}
        </div>
        <div className="now-playing-meta">
          <span className="np-title">{currentNode ? currentNode.data.title : '--'}</span>
          <span className="np-artist">{currentNode ? currentNode.data.artist : '--'}</span>
        </div>
      </div>


      <div className="player-center">
        <div className="player-controls">
          <button className="ctrl-btn" onClick={onPrev} disabled={!currentNode?.prev} title="Anterior">
            <SkipBack size={18} fill="currentColor" />
          </button>
          
          <button className="play-circle-btn" onClick={togglePlayPause} disabled={!currentNode}>
            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" style={{marginLeft: '2px'}} />}
          </button>
          
          <button className="ctrl-btn" onClick={onNext} disabled={!currentNode?.next} title="Siguiente">
            <SkipForward size={18} fill="currentColor" />
          </button>
        </div>
        
        <div className="player-playback-bar">
          <span className="playback-time">{formatTime(currentTime)}</span>
          <div className="playback-track" ref={trackRef} onClick={handleClick}>
            <div className="playback-fill" style={{ width: `${progress}%` }} />
            <div className="playback-handle" style={{ left: `${progress}%` }} />
          </div>
          <span className="playback-time">{formatTime(duration)}</span>
        </div>
      </div>


      <div className="player-right">
        AxMusic
      </div>
      
    </div>
  );
};
