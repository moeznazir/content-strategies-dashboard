import { appColors } from "@/lib/theme";
import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { getRandomColor } from "../constants/constant";
import { CustomSpinner } from "./Spinner";
import { FaCommentDots, FaEdit, FaExpandAlt, FaPlus, FaSortDown, FaTrash } from "react-icons/fa";
import Modal from "./DetailModal";
import CommentModal from "./CommentsModal"
import LikeButton from "./LikeUnlikeButton";
import RankingModal from "./CustomRankingModal";
import { formatUrl } from "@/lib/utils";

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

    const shouldResizeColumn = (columnId) => {
        // Disable separator for these specific columns
        return ![ 'Objections', 'Challenges', 'Sales Insights', 'Tags', 'Themes', 'Validations', 'Video Type', 'action'].includes(columnId);
    };

    return (
        <th
            ref={(node) => ref(drop(node))}
            className={`
          px-2 py-3 text-left text-xs font-bold uppercase tracking-wider text-white
          ${column.id === 'Avatar' ? 'sticky left-0 px-6 z-30 bg-[#1a1b41] w-[75px]' : ''}
          ${column.id === 'Guest' ? 'sticky left-[130px] -px-[60px] z-20 bg-[#1a1b41] w-[200px]' : ''}
          ${column.id == 'email' ? ' px-[25px] z-20 bg-[#1a1b41] w-[200px]' : ''}

        `}
            style={{
                cursor: isResizing ? "col-resize" : "",
                opacity: isDragging ? 0.5 : 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                borderBottom: "2px solid #4B5563",
            }}
        >
            <ResizableBox
                width={(column.id === 'Avatar' || column.id === 'Likes' || column.id === 'Comments' || column.id === 'action') ? 90 : 250}
                height={20}
                minConstraints={[50]}
                maxConstraints={[1000]}
                resizeHandles={shouldResizeColumn(column.id) ? ["e"] : []}
                axis="x"
                onResizeStart={() => setIsResizing(true)}
                onResizeStop={() => setIsResizing(false)}
                handle={
                    <span
                        className="absolute top-0 right-0 h-[50px] -mt-4 w-[5px] cursor-col-resize z-10 bg-transparent border-r-4 border-gray-600"
                        style={{ marginRight: "-6px" }}
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
    onDelete,
    hasMoreRecords,
    onLoadMore,
    loadingMore,
    alignRecord,
    loadingRecord,
    themesRank
}) => {
    const [columns, setColumns] = useState(initialColumns);
    const [selectedRow, setSelectedRow] = useState(null);
    const [commentRow, setCommentRow] = useState(null);
    const [selectedThemes, setSelectedThemes] = useState(null);
    const [selectedObjections, setSelectedObjections] = useState(null);
    const [selectedValidations, setSelectedValidations] = useState(null);
    const [selectedChallenges, setSelectedChallenges] = useState(null);
    const [selectedSalesInsights, setSelectedSalesInsights] = useState(null);
    console.log("Selected Row:", selectedRow);
    console.log("Selected Row ID:", selectedRow?.id);


    const moveColumn = (fromIndex, toIndex) => {
        const updatedColumns = [...columns];
        const [movedColumn] = updatedColumns.splice(fromIndex, 1);
        updatedColumns.splice(toIndex, 0, movedColumn);
        setColumns(updatedColumns);
    };
    const normalizeThemes = (rowId) => {
        const themeData = themesRank.find(item => item.id === rowId)?.Themes;
        if (!themeData) return [];

        if (Array.isArray(themeData)) {
            return themeData.map(theme => {
                if (typeof theme === 'object') {
                    return {
                        theme: theme.theme || '',
                        ranking: theme.ranking || 0,
                        justification: theme.justification || '',
                        perceptionToAddress: theme.perception || '',
                        whyItMatters: theme.whyItMatters || '',
                        deeperInsight: theme.deeperInsight || '',
                        supportingQuotes: theme.supportingQuotes || ''
                    };
                }
                return {
                    theme: theme || '',
                    ranking: 0,
                    justification: '',
                    perceptionToAddress: '',
                    whyItMatters: '',
                    deeperInsight: '',
                    supportingQuotes: ''
                };
            });
        }
        return [];
    };

    const normalizeObjections = (rowId) => {
        const ObjectionData = themesRank.find(item => item.id === rowId)?.Objections;
        if (!ObjectionData) return [];

        if (Array.isArray(ObjectionData)) {
            return ObjectionData.map(objection => {
                if (typeof objection === 'object') {
                    return {
                        objection: objection.objection || '',
                        ranking: objection.ranking || 0,
                        justification: objection.justification || '',
                        perceptionToAddress: objection.perception || '',
                        whyItMatters: objection.whyItMatters || '',
                        deeperInsight: objection.deeperInsight || '',
                        supportingQuotes: objection.supportingQuotes || ''
                    };
                }
                return {
                    objection: objection || '',
                    ranking: 0,
                    justification: '',
                    perceptionToAddress: '',
                    whyItMatters: '',
                    deeperInsight: '',
                    supportingQuotes: ''
                };
            });
        }
        return [];
    };

    const normalizeValidations = (rowId) => {
        const ValidationData = themesRank.find(item => item.id === rowId)?.Validations;
        if (!ValidationData) return [];

        if (Array.isArray(ValidationData)) {
            return ValidationData.map(validation => {
                if (typeof validation === 'object') {
                    return {
                        validation: validation.validation || '',
                        ranking: validation.ranking || 0,
                        justification: validation.justification || '',
                        perceptionToAddress: validation.perception || '',
                        whyItMatters: validation.whyItMatters || '',
                        deeperInsight: validation.deeperInsight || '',
                        supportingQuotes: validation.supportingQuotes || ''
                    };
                }
                return {
                    validation: validation || '',
                    ranking: 0,
                    justification: '',
                    perceptionToAddress: '',
                    whyItMatters: '',
                    deeperInsight: '',
                    supportingQuotes: ''
                };
            });
        }
        return [];
    };

    const normalizeChallenges = (rowId) => {
        const ChallengesData = themesRank.find(item => item.id === rowId)?.Challenges;
        if (!ChallengesData) return [];

        if (Array.isArray(ChallengesData)) {
            return ChallengesData.map(challenge => {
                if (typeof challenge === 'object') {
                    return {
                        challenges: challenge.challenges || '',
                        ranking: challenge.ranking || 0,
                        justification: challenge.justification || '',
                        perceptionToAddress: challenge.perception || '',
                        whyItMatters: challenge.whyItMatters || '',
                        deeperInsight: challenge.deeperInsight || '',
                        supportingQuotes: challenge.supportingQuotes || ''
                    };
                }
                return {
                    challenges: challenge || '',
                    ranking: 0,
                    justification: '',
                    perceptionToAddress: '',
                    whyItMatters: '',
                    deeperInsight: '',
                    supportingQuotes: ''
                };
            });
        }
        return [];
    };

    const normalizeSalesInsights = (rowId) => {
        const salesInsightsData = themesRank.find(item => item.id === rowId)?.['Sales Insights'];
        if (!salesInsightsData) return [];

        if (Array.isArray(salesInsightsData)) {
            return salesInsightsData.map(insight => {
                if (typeof insight === 'object') {
                    return {
                        insight: insight.insight || '',
                        ranking: insight.ranking || 0,
                        justification: insight.justification || '',
                        perceptionToAddress: insight.perception || '',
                        whyItMatters: insight.whyItMatters || '',
                        deeperInsight: insight.deeperInsight || '',
                        supportingQuotes: insight.supportingQuotes || ''
                    };
                }
                return {
                    insight: insight || '',
                    ranking: 0,
                    justification: '',
                    perceptionToAddress: '',
                    whyItMatters: '',
                    deeperInsight: '',
                    supportingQuotes: ''
                };
            });
        }

        return [];
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="overflow-x-auto  relative no-scrollbar"
                style={{
                    height: 'calc(100vh - 18rem)',
                    minHeight: '450px',
                    maxHeight: '750px',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid #4B5563',
                    borderRadius: '10px'
                }}
            >
                <table className="min-w-full divide-y  divide-gray-300">

                    <thead className="bg-[#1a1b41] sticky top-0 z-10">
                        <tr>
                            {columns.map((column, index) => (
                                <DraggableHeader key={column.id} column={column} index={index} moveColumn={moveColumn} />
                            ))}
                        </tr>

                    </thead>

                    <tbody className=" text-white divide-y divide-gray-600">

                        {!loading && data?.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (showActions ? 1 : 0)}
                                    className="py-6 text-center"
                                >
                                    <div
                                        className={` ${alignRecord ? 'fixed top-3/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50' : 'fixed top-3/2 left-1/2 transform translate-x-1/2 -translate-y-1/2 z-50'
                                            }`}
                                    >
                                        <p className="text-gray-500 text-center">No record found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            !loading && data?.length > 0 && data?.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className={`bg-white/10 group cursor-pointer px-6 py-4 divide-y divide-gray-600 text-sm hover:bg-white/10 relative
                                
                                    `}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.id}
                                            className={`
                                       px-6 py-1 text-sm divide-y divide-gray-600 whitespace-nowrap
                                       ${[ 'Objections', 'Tags', 'Themes', 'Validations', 'Challenges', 'Sales Insights', 'Video Type'].includes(column.label)
                                                    ? `w-auto max-w-max`
                                                    : 'max-w-[250px] overflow-hidden text-ellipsis'
                                                }
                                                ${column.id === 'Avatar' ? 'sticky left-0 px-6 z-25 bg-[#1a1b41]' : ''}
                                                ${column.id === 'Guest' ? 'sticky left-[125px] px-[8px] bg-[#1a1b41]' : ''}
                                                ${column.id === 'email' ? ' px-[30px] ' : ''}
                                                ${column.id === 'title_roles' ? ' px-[10px] ' : ''}
                                     `}
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
                                            ) : column.id === "title_roles" || column.id === "system_roles" ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {(Array.isArray(row[column.id])
                                                        ? row[column.id]
                                                        : typeof row[column.id] === 'string'
                                                            ? row[column.id].split(',').map(item => item.trim()).filter(Boolean) // Split comma-separated strings
                                                            : []
                                                    )
                                                        .filter(item => item && item !== "nan" && item !== "[]")
                                                        .map((item, index) => (
                                                            <span
                                                                key={index}
                                                                className={`inline-block px-2 py-1 text-xs font-semibold rounded-lg ${getRandomColor()}`}
                                                            >
                                                                {item}
                                                            </span>
                                                        ))}
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
                                            ) : column.id === "Themes" ? (
                                                <div
                                                    className="flex  gap-1 cursor-pointer"
                                                    onClick={() => {
                                                        const themesData = normalizeThemes(row.id);
                                                        if (themesData.length > 0) {
                                                            setSelectedThemes(themesData);
                                                        }
                                                    }}
                                                >
                                                    {normalizeThemes(row.id)
                                                        .filter(themeObj => {
                                                            if (!themeObj) return false;
                                                            const themeStr = String(themeObj.theme).toLowerCase().trim();
                                                            return themeStr !== 'nan' && themeStr !== '[]' && themeStr !== '';
                                                        })
                                                        .map((themeObj, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={`inline-block px-2 py-1 text-xs font-semibold rounded-lg mr-1 ${getRandomColor()}`}
                                                            >
                                                                {themeObj.theme}
                                                            </span>
                                                        ))}
                                                </div>
                                            ) : column.id === "Objections" ? (
                                                <div
                                                    className="flex  gap-1 cursor-pointer"
                                                    onClick={() => {
                                                        const objectionData = normalizeObjections(row.id);
                                                        if (objectionData.length > 0) {
                                                            setSelectedObjections(objectionData);
                                                        }
                                                    }}
                                                >
                                                    {normalizeObjections(row.id)
                                                        .filter(objectionObj => {
                                                            if (!objectionObj) return false;
                                                            const objectionStr = String(objectionObj.objection).toLowerCase().trim();
                                                            return objectionStr !== 'nan' && objectionStr !== '[]' && objectionStr !== '';
                                                        })
                                                        .map((objectionObj, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={`inline-block px-2 py-1 text-xs font-semibold rounded-lg mr-1 ${getRandomColor()}`}
                                                            >
                                                                {objectionObj.objection}
                                                            </span>
                                                        ))}
                                                </div>
                                            ) : column.id === "Validations" ? (
                                                <div
                                                    className="flex  gap-1 cursor-pointer"
                                                    onClick={() => {
                                                        const validationData = normalizeValidations(row.id);
                                                        if (validationData.length > 0) {
                                                            setSelectedValidations(validationData);
                                                        }
                                                    }}
                                                >
                                                    {normalizeValidations(row.id)
                                                        .filter(validationObj => {
                                                            if (!validationObj) return false;
                                                            const validationStr = String(validationObj.validation).toLowerCase().trim();
                                                            return validationStr !== 'nan' && validationStr !== '[]' && validationStr !== '';
                                                        })
                                                        .map((validationObj, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={`inline-block px-2 py-1 text-xs font-semibold rounded-lg mr-1 ${getRandomColor()}`}
                                                            >
                                                                {validationObj.validation}
                                                            </span>
                                                        ))}
                                                </div>
                                            ) : column.id === "Challenges" ? (
                                                <div
                                                    className="flex  gap-1 cursor-pointer"
                                                    onClick={() => {
                                                        const challengesData = normalizeChallenges(row.id);
                                                        if (challengesData.length > 0) {
                                                            setSelectedChallenges(challengesData);
                                                        }
                                                    }}
                                                >
                                                    {normalizeChallenges(row.id)
                                                        .filter(challengesObj => {
                                                            if (!challengesObj) return false;
                                                            const challengesStr = String(challengesObj.challenges).toLowerCase().trim();
                                                            return challengesStr !== 'nan' && challengesStr !== '[]' && challengesStr !== '';
                                                        })
                                                        .map((challengesObj, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={`inline-block px-2 py-1 text-xs font-semibold rounded-lg mr-1 ${getRandomColor()}`}
                                                            >
                                                                {challengesObj.challenges}
                                                            </span>
                                                        ))}
                                                </div>
                                            ) : column.id === "Sales Insights" ? (
                                                <div
                                                    className="flex gap-1 cursor-pointer"
                                                    onClick={() => {
                                                        const insightsData = normalizeSalesInsights(row.id);
                                                        if (insightsData.length > 0) {
                                                            setSelectedSalesInsights(insightsData); // make sure this state exists
                                                        }
                                                    }}
                                                >
                                                    {normalizeSalesInsights(row.id)
                                                        .filter(insightObj => {
                                                            if (!insightObj) return false;
                                                            const insightStr = String(insightObj.insight).toLowerCase().trim();
                                                            return insightStr !== 'nan' && insightStr !== '[]' && insightStr !== '';
                                                        })
                                                        .map((insightObj, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={`inline-block px-2 py-1 text-xs font-semibold rounded-lg mr-1 ${getRandomColor()}`}
                                                            >
                                                                {insightObj.insight}

                                                            </span>
                                                        ))}
                                                </div>
                                            ) : column.id === "Likes" ? (
                                                <LikeButton user_name={row?.Guest} record_id={row?.id} current_user_id={localStorage.getItem("current_user_id")} user_email={localStorage.getItem("email")} />
                                            ) : column.id === "Comments" ? (
                                                <div onClick={() => setCommentRow(row)} className="text-blue-500">
                                                    <FaCommentDots size={18} />
                                                </div>
                                            ) : column.type === 'url' ? (
                                                row[column.id] ? (
                                                    <a
                                                        href={formatUrl(row[column.id])}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 hover:underline"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {row[column.id]}
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400">N/A</span>
                                                )
                                            ) : (
                                                row[column.id] || "-"
                                            )}
                                        </td>
                                    ))}
                                    <td className="sticky right-0  px-0 z-10">
                                        <div className="flex gap-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            {showActions && (
                                                <>
                                                    {onEdit && (
                                                        <button
                                                            className="p-2 rounded-full bg-white hover:bg-gray-200 transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onEdit(row);
                                                            }}
                                                            aria-label="Edit"
                                                        >
                                                            <FaEdit className="w-4 h-4" style={{ color: appColors.primaryColor }} />
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button
                                                            className="p-2 rounded-full bg-white hover:bg-gray-200 transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDelete(row.id);
                                                            }}
                                                            aria-label="Delete"
                                                        >
                                                            <FaTrash className="w-4 h-4" style={{ color: appColors.primaryColor }} />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>

                                </tr>

                            ))


                        )}
                        {/* Show More row - only visible if there are more records to load */}
                        {hasMoreRecords && !loading && (
                            <tr className="hover:bg-white/10 scroll-hidden">
                                <td
                                    colSpan={columns.length + 1}
                                    className="relative py-3 text-center cursor-pointer"
                                    onClick={onLoadMore}
                                >
                                    <div className="sticky left-1/2 transform -translate-x-1/2 ml-[300px] z-50 w-max mx-auto">
                                        <div className="flex items-center justify-center gap-2 text-white font-bold">
                                            {loadingMore ? (
                                                <>
                                                    <CustomSpinner className="w-4 h-4" />
                                                    <span>Loading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Show More</span>
                                                    <FaSortDown className="-mt-2 w-6 h-6" />

                                                </>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>

                        )}

                    </tbody>
                </table>
                {loading && (
                    <div className={`${loadingRecord
                        ? 'fixed top-[50%] left-[60%] transform -translate-x-1/2 -translate-y-1/2 z-50' : alignRecord ? 'fixed top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-50' : ''}
                        }`}>
                        <CustomSpinner className="w-12 h-12 text-white" />
                    </div>
                )}
            </div>

            {/* Show Modal when a row is selected */}
            {selectedRow && (
                <Modal
                    data={{
                        ...selectedRow,
                        Themes: normalizeThemes(selectedRow.id),
                        Validations: normalizeValidations(selectedRow.id),
                        Objections: normalizeObjections(selectedRow.id),
                        Challenges: normalizeChallenges(selectedRow.id),
                        "Sales Insights": normalizeSalesInsights(selectedRow.id)
                    }}
                    onClose={() => setSelectedRow(null)}
                />
            )}
            {/* Comment Modal (For Comments) */}
            {commentRow && <CommentModal row={commentRow} onClose={() => setCommentRow(null)} />}

            {/* Ranking Modal (For Ranks) */}
            {selectedThemes && (
                <RankingModal
                    data={selectedThemes}
                    onClose={() => setSelectedThemes(null)}
                />

            )}
            {selectedValidations && (
                <RankingModal
                    data={selectedValidations}
                    onClose={() => setSelectedValidations(null)}
                />
            )}
            {selectedObjections && (
                <RankingModal
                    data={selectedObjections}
                    onClose={() => setSelectedObjections(null)}
                />
            )}
            {selectedChallenges && (
                <RankingModal
                    data={selectedChallenges}
                    onClose={() => setSelectedChallenges(null)}
                />
            )}
            {selectedSalesInsights && (
                <RankingModal
                    data={selectedSalesInsights}
                    onClose={() => setSelectedSalesInsights(null)}
                />
            )}
        </DndProvider>
    );

};



export default DraggableTable;

