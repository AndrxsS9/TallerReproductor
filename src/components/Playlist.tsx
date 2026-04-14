import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Music2, Edit3 } from 'lucide-react';
import type { Song } from '../types';
import { Node } from '../lib/DoublyLinkedList';


interface SongRowProps {
  song: Song;
  index: number;
  isActive: boolean;
  onPlay: () => void;
  onRemove: () => void;
  onRename: (newTitle: string) => void;
}

const SortableSongRow: React.FC<SongRowProps> = ({ song, index, isActive, onPlay, onRemove, onRename }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(song.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  const handleRenameSubmit = () => {
    if (editTitle.trim().length > 0) {
      onRename(editTitle.trim());
    } else {
      setEditTitle(song.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameSubmit();
    if (e.key === 'Escape') {
      setEditTitle(song.title);
      setIsEditing(false);
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`song-row ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''}`}
      onDoubleClick={onPlay}
    >
      <div className="col-idx-thumb">
        {isActive ? (
          <div className="eq-bars"><span/><span/><span/><span/></div>
        ) : (
          <span className="track-number">{index + 1}</span>
        )}
        <div className="grip" {...attributes} {...listeners}>
          <GripVertical size={16} />
        </div>
      </div>

      <div className="col-info" onClick={(e) => { 
        e.stopPropagation(); 
        if (!isEditing) onPlay(); 
      }}>
        {isEditing ? (
          <input 
            type="text" 
            className="edit-title-input" 
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleKeyDown}
            autoFocus
            onClick={e => e.stopPropagation()}
            style={{ 
              background: 'transparent', border: '1px solid var(--border)', 
              color: 'var(--text-primary)', outline: 'none', borderRadius: '4px',
              padding: '2px 4px', fontSize: '1rem', width: '100%', fontFamily: 'inherit'
            }}
          />
        ) : (
          <div className="song-name" onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}>
            {song.title}
          </div>
        )}
        <div className="song-meta">{song.artist}</div>
      </div>

      <div className="col-actions">
        <button className="del-btn" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} title="Editar título">
          <Edit3 size={16} />
        </button>
        <button className="del-btn" onClick={(e) => { e.stopPropagation(); onRemove(); }} title="Eliminar">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};


interface PlaylistProps {
  songs: Song[];
  currentNode: Node | null;
  onReorder: (newOrder: Song[]) => void;
  onPlayNode: (nodeId: string) => void;
  onRemoveNode: (nodeId: string) => void;
  onRenameNode: (nodeId: string, newTitle: string) => void;
}

export const Playlist: React.FC<PlaylistProps> = ({ 
  songs, 
  currentNode, 
  onReorder, 
  onPlayNode,
  onRemoveNode,
  onRenameNode
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = songs.findIndex(s => s.id === active.id);
      const newIdx = songs.findIndex(s => s.id === over.id);
      onReorder(arrayMove(songs, oldIdx, newIdx));
    }
  };

  if (songs.length === 0) {
    return (
      <div className="empty-list">
        <Music2 size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <span>Importa canciones a tu biblioteca</span>
      </div>
    );
  }

  return (
    <div className="songs-list-wrapper">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={songs.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="songs-list">
            {songs.map((song, i) => (
              <SortableSongRow
                key={song.id}
                song={song}
                index={i}
                isActive={currentNode?.data.id === song.id}
                onPlay={() => onPlayNode(song.id)}
                onRemove={() => onRemoveNode(song.id)}
                onRename={(newTitle) => onRenameNode(song.id, newTitle)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
