import { appColors } from "@/lib/theme";
import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ResizableBox } from 'react-resizable';
import "react-resizable/css/styles.css";
const ItemType = "COLUMN";

const DraggableHeader = ({ column, index, moveColumn }) => {
    const [isResizing, setIsResizing] = useState(false);
    const [{ isDragging }, ref, drag] = useDrag({
        type: ItemType,
        item: { id: column.id, index },
        canDrag: () => !isResizing,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: ItemType,
        hover: (draggedItem) => {
            if (draggedItem.index !== index && !isResizing) {
                moveColumn(draggedItem.index, index);
                draggedItem.index = index;
            }
        },
    });
    return (
        <th
            ref={(node) => ref(drop(node))}
            className={`px-6 text-white text-left relative group w-[50px]`}

            style={{
                backgroundColor: appColors.tableHeaderColor,
                cursor: isResizing ? 'col-resize' : '',
                opacity: isDragging ? 0.5 : 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}
        >


            <ResizableBox
                width={250}
                height={52}
                minConstraints={[50]}
                maxConstraints={[1000]}
                resizeHandles={column.id !== 'action' ? ['e'] : []}
                axis="x"
                onResizeStart={() => setIsResizing(true)}
                onResizeStop={() => setIsResizing(false)}
                handle={
                    <span className="absolute top-0 right-0 h-full w-[5px] cursor-col-resize z-10 bg-transparent border-r-4 border-white" style={{ marginRight: "-25px" }} />}
            >
                <div className="flex items-center h-full">{column.label}</div>


            </ResizableBox>
        </th>

    );
};

const DraggableTable = ({ columns: initialColumns, data }) => {
    const [columns, setColumns] = useState(initialColumns);

    const moveColumn = (fromIndex, toIndex) => {
        const updatedColumns = [...columns];
        const [movedColumn] = updatedColumns.splice(fromIndex, 1);
        updatedColumns.splice(toIndex, 0, movedColumn);
        setColumns(updatedColumns);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr>
                            {columns.map((column, index) => (
                                <DraggableHeader
                                    key={column.id}
                                    column={column}
                                    index={index}
                                    moveColumn={moveColumn}
                                />
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="group cursor-pointer px-6 py-4 text-sm border-b max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
                                {columns.map((column) => (
                                    <td key={column.id} className="px-6 py-2 px-6 py-4 text-sm border-b max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
                                        {row[column.id] || "-"}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DndProvider>
    );
};

export default DraggableTable;
