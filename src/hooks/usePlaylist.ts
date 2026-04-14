import { useState, useCallback, useRef } from 'react';
import { DoublyLinkedList, Node } from '../lib/DoublyLinkedList';
import type { Song } from '../types';

export interface PlaylistModel {
  id: string;
  name: string;
  list: DoublyLinkedList;
}

export function usePlaylist() {
  const playlistsRef = useRef<PlaylistModel[]>([
    { id: 'pl-1', name: 'Favoritos', list: new DoublyLinkedList() }
  ]);
  

  const [, setTrigger] = useState(0);
  const reRender = useCallback(() => setTrigger(val => val + 1), []);

  const [activePlaylistId, setActivePlaylistId] = useState<string>('pl-1');
  const [currentNode, setCurrentNode] = useState<Node | null>(null);

  const activePlaylist = playlistsRef.current.find(p => p.id === activePlaylistId) || playlistsRef.current[0];


  const _syncList = useCallback(() => {
    reRender();
  }, [reRender]);


  const createPlaylist = useCallback((name: string) => {
    const newPlaylist = {
      id: `pl-${Date.now()}`,
      name,
      list: new DoublyLinkedList()
    };
    playlistsRef.current.push(newPlaylist);
    reRender();
    return newPlaylist.id;
  }, [reRender]);

  const deletePlaylist = useCallback((id: string) => {
    if (playlistsRef.current.length <= 1) return;
    playlistsRef.current = playlistsRef.current.filter(p => p.id !== id);
    if (activePlaylistId === id) {
      setActivePlaylistId(playlistsRef.current[0].id);
    }
    reRender();
  }, [activePlaylistId, reRender]);

  const renamePlaylist = useCallback((id: string, newName: string) => {
    const pl = playlistsRef.current.find(p => p.id === id);
    if (pl) {
      pl.name = newName;
      reRender();
    }
  }, [reRender]);

  const setActivePlaylist = useCallback((id: string) => {
    setActivePlaylistId(id);
  }, []);


  const addSongToStart = useCallback((song: Song) => {
    activePlaylist.list.prepend(song);
    _syncList();
    if (!currentNode && activePlaylist.list.length === 1) {
       setCurrentNode(activePlaylist.list.head);
    }
  }, [_syncList, currentNode, activePlaylist]);

  const addSongToEnd = useCallback((song: Song) => {
    activePlaylist.list.append(song);
    _syncList();
    if (!currentNode && activePlaylist.list.length === 1) {
        setCurrentNode(activePlaylist.list.head);
    }
  }, [_syncList, currentNode, activePlaylist]);

  const insertSongAt = useCallback((song: Song, index: number) => {
    activePlaylist.list.insertAt(song, index);
    _syncList();
    if (!currentNode && activePlaylist.list.length === 1) {
        setCurrentNode(activePlaylist.list.head);
    }
  }, [_syncList, currentNode, activePlaylist]);

  const removeSong = useCallback((id: string) => {
    if (currentNode?.data.id === id) {
        const nextNode = currentNode.next || currentNode.prev || null;
        setCurrentNode(nextNode);
    }

    activePlaylist.list.removeById(id);
    _syncList();
  }, [_syncList, currentNode, activePlaylist]);

  const renameSong = useCallback((id: string, newTitle: string) => {
    let current = activePlaylist.list.head;
    while (current) {
        if (current.data.id === id) {
            current.data.title = newTitle;
            break;
        }
        current = current.next;
    }
    _syncList();
  }, [_syncList, activePlaylist]);

  const playNodeById = useCallback((id: string, listToSearch = activePlaylist.list) => {
    let current = listToSearch.head;
    while (current) {
        if (current.data.id === id) {
            setCurrentNode(current);
            break;
        }
        current = current.next;
    }
  }, [activePlaylist]);

  const moveNext = useCallback(() => {
    if (currentNode && currentNode.next) {
      setCurrentNode(currentNode.next);
    } else if (!currentNode && activePlaylist.list.head) {
        setCurrentNode(activePlaylist.list.head);
    }
  }, [currentNode, activePlaylist]);

  const movePrev = useCallback(() => {
    if (currentNode && currentNode.prev) {
      setCurrentNode(currentNode.prev);
    }
  }, [currentNode]);

  const reorderList = useCallback((songs: Song[]) => {
      activePlaylist.list.fromArray(songs);
      _syncList();
      
      if (currentNode) {
          let curr = activePlaylist.list.head;
          while(curr) {
              if(curr.data.id === currentNode.data.id) {
                  setCurrentNode(curr);
                  break;
              }
              curr = curr.next;
          }
      }
  }, [_syncList, currentNode, activePlaylist]);

  return {
    playlists: playlistsRef.current,
    activePlaylistId,
    activePlaylist,
    playlistLength: activePlaylist.list.length,
    songs: activePlaylist.list.toArray(),
    currentNode,
    

    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    setActivePlaylist,


    addSongToStart,
    addSongToEnd,
    insertSongAt,
    removeSong,
    renameSong,
    playNodeById,
    moveNext,
    movePrev,
    reorderList
  };
}
