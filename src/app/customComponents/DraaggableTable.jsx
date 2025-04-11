import { appColors } from "@/lib/theme";
import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { getRandomColor } from "../constants/constant";
import { CustomSpinner } from "./Spinner";
import { FaCommentDots, FaEdit, FaExpandAlt, FaTrash } from "react-icons/fa";
import Modal from "./DetailModal";
import CommentModal from "./CommentsModal"
import LikeButton from "./LikeUnlikeButton";

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
            className={`px-6 py-3 text-white text-left text-xs font-medium text-gray-500 border-b uppercase tracking-wider`}
            style={{

                cursor: isResizing ? "col-resize" : "",
                opacity: isDragging ? 0.5 : 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            }}
        >
            <ResizableBox
                width={(column.id === 'Avatar' || column.id === 'Likes' || column.id === 'Comments' || column.id === 'action') ? 75 : 250}
                height={20}
                minConstraints={[50]}
                maxConstraints={[1000]}
                resizeHandles={column.id !== "action" ? ["e"] : []}
                axis="x"
                onResizeStart={() => setIsResizing(true)}
                onResizeStop={() => setIsResizing(false)}
                handle={
                    <span
                        className="absolute top-0 right-0 h-[50px] -mt-4 w-[5px] cursor-col-resize z-10 bg-transparent border-r-4 border-gray-600"
                        style={{ marginRight: "-25px" }}
                    />
                }
            >
                <div className="flex items-center h-full">{column.label}</div>
            </ResizableBox>
        </th>
    );
};

const DraggableTable = ({
    columns: initialColumns,
    data,
    arrayFields,
    showActions = true,
    loading,
    onEdit,
    onDelete
}) => {
    const [columns, setColumns] = useState(initialColumns);
    const [selectedRow, setSelectedRow] = useState(null);
    const [commentRow, setCommentRow] = useState(null);
    console.log("Selected Row:", selectedRow);
    console.log("Selected Row ID:", selectedRow?.id);

    const moveColumn = (fromIndex, toIndex) => {
        const updatedColumns = [...columns];
        const [movedColumn] = updatedColumns.splice(fromIndex, 1);
        updatedColumns.splice(toIndex, 0, movedColumn);
        setColumns(updatedColumns);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="overflow-x-auto rounded-[15px] ">
                <table className="min-w-full divide-y divide-gray-300 ">

                    <thead className="bg-white/10">
                        <tr>
                            {columns.map((column, index) => (
                                <DraggableHeader key={column.id} column={column} index={index} moveColumn={moveColumn} />
                            ))}
                        </tr>

                    </thead>

                    <tbody className="bg-white/10 text-white divide-y divide-gray-600">
                        {loading && (
                            <tr>
                                <td
                                    colSpan={columns.length + (showActions ? 1 : 0)}
                                    className="py-6 text-center"
                                >
                                    <div className="fixed top-3/2 left-1/2 transform translate-x-[100px] -translate-y-1/2 z-50">
                                        <CustomSpinner className="w-8 h-8 text-gray-500  " />
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!loading && data?.length === 0 ? (
                            <tr >
                                <td
                                    colSpan={columns.length + (showActions ? 1 : 0)}
                                    className="py-6 text-center"
                                >
                                    <div className="fixed top-3/2 left-1/2 transform translate-x-1/2 -translate-y-1/2 z-50">
                                        <p className="text-gray-500 text-center">
                                            No record found
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data?.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className="group cursor-pointer px-6 py-4 divide-y divide-gray-600 text-sm hover:bg-white/10"
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.id}
                                            className="px-6 py-1 text-sm divide-y divide-gray-600 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap"
                                        >
                                            {column.id === "Avatar" ? (
                                                <div className="flex items-center">
                                                    {/* Expand Icon Before Avatar */}
                                                    <button
                                                        onClick={() => setSelectedRow(row)}
                                                        className="text-blue-500 mr-2"
                                                    >
                                                        <FaExpandAlt size={18} />
                                                    </button>
                                                    <img
                                                        src={row[column.id] || "/default-avatar.png"}
                                                        alt="User Avatar"
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                </div>
                                            ) : arrayFields.includes(column.label) && Array.isArray(row[column.id]) ? (
                                                row[column.id]
                                                    .filter((item) => item && item !== "nan" && item !== "[]")
                                                    .map((item, index) => (
                                                        <span
                                                            key={index}
                                                            className={`inline-block px-2 py-1 text-xs font-semibold rounded-lg mr-1 ${getRandomColor()}`}
                                                        >
                                                            {item}
                                                        </span>
                                                    ))
                                            ) : column.id === "Likes" ? (
                                                <LikeButton user_name={row?.Guest} user_id={row?.id} current_user_id={localStorage.getItem("current_user_id")} user_email={localStorage.getItem("email")} />
                                            ) : column.id === "Comments" ? (
                                                <div onClick={() => setCommentRow(row)} className="text-blue-500">
                                                    <FaCommentDots size={18} />
                                                </div>
                                            ) : column.id === "action" ? (
                                                <div className="absolute right-4 gap-2 flex transform -translate-x-1/2  -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    {showActions && (
                                                        <>
                                                            {onEdit  && (
                                                                <div
                                                                    className="opacity-0 group-hover:opacity-100 bg-white p-2 rounded-full transition-opacity duration-300 cursor-pointer flex items-center"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onEdit(row);
                                                                    }}
                                                                >
                                                                    <FaEdit className="w-4 h-4" style={{ color: appColors.primaryColor }} />
                                                                </div>
                                                            )}
                                                            {onDelete && (
                                                                <div
                                                                    className="opacity-0 group-hover:opacity-100 bg-white p-2 rounded-full transition-opacity duration-300 cursor-pointer flex items-center"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onDelete(row.id);
                                                                    }}
                                                                >
                                                                    <FaTrash className="w-4 h-4" style={{ color: appColors.primaryColor }} />
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                row[column.id] || "-"
                                            )}
                                        </td>
                                    ))}

                                </tr>

                            ))


                        )}

                    </tbody>
                </table>
            </div>

            {/* Show Modal when a row is selected */}
            {selectedRow && (
                <Modal data={selectedRow} onClose={() => setSelectedRow(null)} />
            )}
            {/* Comment Modal (For Comments) */}
            {commentRow && <CommentModal row={commentRow} onClose={() => setCommentRow(null)} />}

        </DndProvider>
    );

};



export default DraggableTable;
