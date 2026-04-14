import { Plus, ListMusic, Trash2 } from 'lucide-react';
import type { PlaylistModel } from '../hooks/usePlaylist';

interface SidebarProps {
  playlists: PlaylistModel[];
  activePlaylistId: string;
  createPlaylist: (name: string) => void;
  deletePlaylist: (id: string) => void;
  setActivePlaylist: (id: string) => void;
}

export function Sidebar({ playlists, activePlaylistId, createPlaylist, deletePlaylist, setActivePlaylist }: SidebarProps) {
  const handleCreate = () => {

    const name = prompt('Nombre de la nueva playlist:', `Mi Playlist #${playlists.length + 1}`);
    if (name && name.trim().length > 0) {
      createPlaylist(name.trim());
    }
  };

  return (
    <div className="sidebar-panel">
      <div className="sidebar-header">
        <h2>Tu Biblioteca</h2>
        <button className="sidebar-action-btn" onClick={handleCreate} title="Crear Playlist">
          <Plus size={20} />
        </button>
      </div>
      
      <div className="sidebar-playlists">
        {playlists.map((pl) => (
          <div 
            key={pl.id} 
            className={`sidebar-item ${pl.id === activePlaylistId ? 'active' : ''}`}
            onClick={() => setActivePlaylist(pl.id)}
          >
            <div className="sidebar-item-icon">
              <ListMusic size={20} />
            </div>
            <div className="sidebar-item-info">
              <span className="sidebar-item-name">{pl.name}</span>
              <span className="sidebar-item-meta">{pl.list.length} canciones</span>
            </div>
            
            {playlists.length > 1 && (
              <button 
                className="sidebar-delete-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  if(confirm(`¿Eliminar la playlist "${pl.name}"?`)) {
                    deletePlaylist(pl.id);
                  }
                }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
