import type { Song } from '../types';

export class Node {
  public data: Song;
  public next: Node | null = null;
  public prev: Node | null = null;

  constructor(data: Song) {
    this.data = data;
  }
}

export class DoublyLinkedList {
  public head: Node | null = null;
  public tail: Node | null = null;
  public length: number = 0;


  append(data: Song): void {
    const newNode = new Node(data);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.prev = this.tail;
      if (this.tail) {
        this.tail.next = newNode;
      }
      this.tail = newNode;
    }
    this.length++;
  }


  prepend(data: Song): void {
    const newNode = new Node(data);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    }
    this.length++;
  }


  insertAt(data: Song, index: number): boolean {
    if (index < 0 || index > this.length) return false;
    if (index === 0) {
      this.prepend(data);
      return true;
    }
    if (index === this.length) {
      this.append(data);
      return true;
    }

    const newNode = new Node(data);
    let current: Node | null = this.head;
    let currentIndex = 0;

    while (current && currentIndex < index) {
      current = current.next;
      currentIndex++;
    }

    if (current) {
      newNode.prev = current.prev;
      newNode.next = current;
      if (current.prev) {
        current.prev.next = newNode;
      }
      current.prev = newNode;
      this.length++;
      return true;
    }

    return false;
  }


  removeAt(index: number): boolean {
    if (index < 0 || index >= this.length || !this.head) return false;

    if (index === 0) {
      this.head = this.head.next;
      if (this.head) {
        this.head.prev = null;
      } else {
        this.tail = null;
      }
      this.length--;
      return true;
    }

    if (index === this.length - 1) {
      this.tail = this.tail!.prev;
      if (this.tail) {
        this.tail.next = null;
      } else {
        this.head = null;
      }
      this.length--;
      return true;
    }

    let current: Node | null = this.head;
    let currentIndex = 0;

    while (current && currentIndex < index) {
      current = current.next;
      currentIndex++;
    }

    if (current && current.prev && current.next) {
      current.prev.next = current.next;
      current.next.prev = current.prev;
      this.length--;
      return true;
    }

    return false;
  }


  removeById(id: string): boolean {
    let current: Node | null = this.head;
    let index = 0;

    while (current) {
      if (current.data.id === id) {
        return this.removeAt(index);
      }
      current = current.next;
      index++;
    }

    return false;
  }


  moveNode(fromIndex: number, toIndex: number): boolean {
    if (
      fromIndex < 0 ||
      fromIndex >= this.length ||
      toIndex < 0 ||
      toIndex >= this.length ||
      fromIndex === toIndex
    ) {
      return false;
    }

    let current: Node | null = this.head;
    let index = 0;
    while (current && index < fromIndex) {
      current = current.next;
      index++;
    }

    if (!current) return false;

    const data = current.data;
    this.removeAt(fromIndex);
    this.insertAt(data, toIndex);
    return true;
  }


  getNodeAt(index: number): Node | null {
    if (index < 0 || index >= this.length) return null;
    let current: Node | null = this.head;
    for (let i = 0; i < index; i++) {
        if(current) current = current.next;
    }
    return current;
  }


  toArray(): Song[] {
    const array: Song[] = [];
    let current: Node | null = this.head;
    while (current) {
      array.push(current.data);
      current = current.next;
    }
    return array;
  }


  fromArray(songs: Song[]): void {
      this.head = null;
      this.tail = null;
      this.length = 0;
      songs.forEach(song => this.append(song));
  }
}
