'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string | number;
  children: React.ReactNode;
  as?: 'div' | 'tr';
}

export function SortableItem({ id, children, as = 'div' }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
    position: isDragging ? 'relative' as const : 'static' as const,
  };

  if (as === 'tr') {
    return (
      <tr ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing hover:bg-card-bg/50">
        {children}
      </tr>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing h-full">
      {children}
    </div>
  );
}
