import React, { useState, useEffect } from 'react'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SidebarModule, sidebarModules as initialModules } from '../../config/sidebarModules'

interface SortableItemProps {
  module: SidebarModule
}

const SortableItem: React.FC<SortableItemProps> = ({ module }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: module.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  }

  const Component = module.component

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Component />
    </div>
  )
}

export const SortableSidebar: React.FC = () => {
  const [modules, setModules] = useState<SidebarModule[]>(() => {
    const saved = localStorage.getItem('sidebarOrder')
    if (saved) {
      const order = JSON.parse(saved) as string[]
      return order.map(id => initialModules.find(m => m.id === id)).filter(Boolean) as SidebarModule[]
    }
    return initialModules
  })

  useEffect(() => {
    localStorage.setItem('sidebarOrder', JSON.stringify(modules.map(m => m.id)))
  }, [modules])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = modules.findIndex(m => m.id === active.id)
      const newIndex = modules.findIndex(m => m.id === over?.id)
      setModules(arrayMove(modules, oldIndex, newIndex))
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
        {modules.map(module => (
          <SortableItem key={module.id} module={module} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
