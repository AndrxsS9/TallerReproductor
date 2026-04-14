import React, { useRef } from 'react';
import { Plus } from 'lucide-react';
import type { Song } from '../types';

interface UploaderProps {
  onAddSong: (song: Song, position: 'start' | 'end') => void;
}

const getRandomColor = () => {
  const hues = [0, 25, 45, 120, 170, 210, 260, 290, 330];
  const h = hues[Math.floor(Math.random() * hues.length)] + (Math.random() * 15 - 7);
  const s = Math.floor(Math.random() * 30 + 65);
  const l = Math.floor(Math.random() * 20 + 35);
  return `hsl(${h}, ${s}%, ${l}%)`;
};

export const Uploader: React.FC<UploaderProps> = ({ onAddSong }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    Array.from(e.target.files).forEach((file) => {
      const title = file.name.replace(/\.[^/.]+$/, '');
      const newSong: Song = {
        id: crypto.randomUUID(),
        title,
        artist: 'Artista Local',
        genre: 'Aleatorio',
        objectUrl: URL.createObjectURL(file),
        color: getRandomColor()
      };
      onAddSong(newSong, 'end');
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="uploader-bar">
      <input 
        type="file" 
        multiple 
        ref={fileInputRef} 
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button className="import-btn" onClick={() => fileInputRef.current?.click()}>
        <Plus size={16} />
        <span>Agregar</span>
      </button>
    </div>
  );
};
