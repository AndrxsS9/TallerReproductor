import { useState, useEffect, useRef, useCallback } from 'react';
import { usePlaylist } from './hooks/usePlaylist';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import { AudioControls } from './components/AudioControls';
import { Playlist } from './components/Playlist';
import { Uploader } from './components/Uploader';
import { Sidebar } from './components/Sidebar';
import { Moon, Sun, Music } from 'lucide-react';
import './App.css';

function App() {
  const {
    playlists,
    activePlaylistId,
    activePlaylist,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    setActivePlaylist,
    songs,
    currentNode,
    addSongToEnd,
    removeSong,
    renameSong,
    playNodeById,
    moveNext,
    movePrev,
    reorderList
  } = usePlaylist();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const analysis = useAudioAnalyzer(audioRef);

  const [isEditingPlaylistTitle, setIsEditingPlaylistTitle] = useState(false);
  const [editPlaylistTitle, setEditPlaylistTitle] = useState('');

  useEffect(() => { document.documentElement.className = isDarkMode ? 'dark' : 'light'; }, [isDarkMode]);

  useEffect(() => {
    if (audioRef.current && currentNode) {
      audioRef.current.src = currentNode.data.objectUrl;
      audioRef.current.load();
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else if (audioRef.current && !currentNode) {
      audioRef.current.pause();
      audioRef.current.src = '';
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [currentNode]);

  const togglePlayPause = () => {
    if (!currentNode) return;
    if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); } 
    else { audioRef.current?.play().catch(console.error); setIsPlaying(true); }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = useCallback(() => {
    if (currentNode?.next) moveNext(); else setIsPlaying(false);
  }, [moveNext, currentNode]);

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };


  useEffect(() => {
    const root = document.documentElement;
    if (currentNode) {
      const hueMatch = currentNode.data.color.match(/hsl\(([^,]+)/);
      root.style.setProperty('--song-hue', hueMatch ? hueMatch[1] : '260');
    } else {
      root.style.setProperty('--song-hue', '260');
    }
  }, [currentNode]);


  const orbScale1 = 1 + analysis.bass * 0.5;
  const orbScale2 = 1 + analysis.mid * 0.3;
  const orbOpacity1 = isPlaying ? 0.3 + analysis.bass * 0.4 : (isDarkMode ? 0.1 : 0.08);
  const orbOpacity2 = isPlaying ? 0.2 + analysis.mid * 0.3 : (isDarkMode ? 0.08 : 0.06);

  const activeColor = currentNode?.data.color || (isDarkMode ? '#282828' : '#e4e4e7');

  return (
    <div className={`app-wrapper ${isDarkMode ? 'dark' : 'light'}`}>

      <div className="bg-layer">
        <div 
          className="bg-orb bg-orb--1" 
          style={{ 
            transform: `translate(-10%, -20%) scale(${orbScale1})`,
            opacity: orbOpacity1,
            background: `hsl(var(--song-hue), 70%, 55%)`
          }} 
        />
        <div 
          className="bg-orb bg-orb--2" 
          style={{ 
            transform: `translate(10%, 10%) scale(${orbScale2})`,
            opacity: orbOpacity2,
            background: `hsl(calc(var(--song-hue) + 60), 60%, 45%)`
          }}
        />
        <div className="bg-noise" />
      </div>


      <div className="app-main-content">
        

        <Sidebar 
          playlists={playlists}
          activePlaylistId={activePlaylistId}
          createPlaylist={createPlaylist}
          deletePlaylist={deletePlaylist}
          setActivePlaylist={setActivePlaylist}
        />


        <div className="visualizer-panel">
          <div className="header-brand">
            <div className="logo-row">
              <div className="logo-icon"><Music size={20} /></div>
              <span className="app-title">AxMusic</span>
            </div>
            <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <div className="album-art-wrapper">
            <div className="album-art-gradient" style={{ background: activeColor }} />
            
            {!currentNode ? (
              <div className="album-empty">
                <Music size={48} className="album-empty-icon" />
              </div>
            ) : (
              <div className="vinyl-container">
                <div className={`vinyl ${isPlaying ? 'spinning' : ''}`} style={{
                  boxShadow: isPlaying 
                    ? `0 4px 20px rgba(0,0,0,0.8), 0 0 ${40 + analysis.bass * 60}px ${activeColor}80`
                    : '0 4px 15px rgba(0,0,0,0.6)'
                }}>
                  <div className="vinyl-label" style={{ background: activeColor }}>
                    <div className="vinyl-hole" />
                  </div>
                </div>
              </div>
            )}
            <div className="album-art-overlay" />
          </div>
        </div>


        <div className="playlist-panel">
          <div className="playlist-header-actions glass-header" style={{
            background: isPlaying ? `linear-gradient(to bottom, hsla(var(--song-hue), 60%, 20%, 0.6), transparent)` : ''
          }}>
            <div className="playlist-title">
              {isEditingPlaylistTitle ? (
                <input 
                  type="text"
                  autoFocus
                  value={editPlaylistTitle}
                  onChange={(e) => setEditPlaylistTitle(e.target.value)}
                  onBlur={() => {
                    const newName = editPlaylistTitle.trim();
                    if (newName) renamePlaylist(activePlaylist.id, newName);
                    setIsEditingPlaylistTitle(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                    if (e.key === 'Escape') setIsEditingPlaylistTitle(false);
                  }}
                  className="edit-playlist-title-input"
                  style={{
                    background: 'transparent', border: 'none', color: 'inherit',
                    outline: 'none', fontSize: '2.2rem', fontWeight: 800,
                    letterSpacing: '-0.02em', margin: 0, padding: 0, 
                    fontFamily: 'inherit', width: '100%'
                  }}
                />
              ) : (
                <h2 
                  onDoubleClick={() => {
                    setEditPlaylistTitle(activePlaylist?.name || "Lista de Reproducción");
                    setIsEditingPlaylistTitle(true);
                  }}
                  title="Doble clic para renombrar"
                  style={{ cursor: 'text' }}
                >
                  {activePlaylist?.name || "Lista de Reproducción"}
                </h2>
              )}
              <span className="playlist-count">{songs.length} {songs.length === 1 ? 'canción' : 'canciones'}</span>
            </div>
            <Uploader onAddSong={addSongToEnd} />
          </div>
          
          <Playlist 
            songs={songs}
            currentNode={currentNode}
            onReorder={reorderList}
            onPlayNode={playNodeById}
            onRemoveNode={removeSong}
            onRenameNode={renameSong}
          />
        </div>

      </div>


      <AudioControls 
        currentNode={currentNode}
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
        onNext={moveNext}
        onPrev={movePrev}
        progress={(currentTime / duration) * 100 || 0}
        duration={duration}
        currentTime={currentTime}
        onSeek={handleSeek}
      />


      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleTimeUpdate}
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default App;
