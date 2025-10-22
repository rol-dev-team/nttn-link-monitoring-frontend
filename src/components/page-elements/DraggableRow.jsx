// src/components/page-elements/DraggableRow.jsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function DraggableRow({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  // Use inline style for dnd-kit transform/transition
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Add zIndex to ensure the dragged row is above other rows
    zIndex: attributes["aria-pressed"] ? 10 : 'auto', 
  };

  return (
    // 'id' here is the unique key of the item being dragged (page_element id or menu key)
    <tr 
      ref={setNodeRef} 
      style={style} 
      // The rest of the row attributes are applied to the <tr>
      {...attributes}
      className="border-b border-gray-200 hover:bg-gray-50"
    >
      {/* This is the new "Order" column (first <td>).
        It acts as the drag handle using the listeners.
      */}
      <td className="w-1 py-3 px-2 text-center">
        <div
          className="cursor-move text-gray-400 hover:text-gray-800 transition-colors inline-block"
          {...listeners}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="2" cy="4" r="1"/>
            <circle cx="8" cy="4" r="1"/>
            <circle cx="14" cy="4" r="1"/>
            <circle cx="2" cy="8" r="1"/>
            <circle cx="8" cy="8" r="1"/>
            <circle cx="14" cy="8" r="1"/>
            <circle cx="2" cy="12" r="1"/>
            <circle cx="8" cy="12" r="1"/>
            <circle cx="14" cy="12" r="1"/>
          </svg>
        </div>
      </td>
      {/* The rest of the cells are passed as children */}
      {children}
    </tr>
  );
}