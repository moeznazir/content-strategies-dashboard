import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createClient } from "@supabase/supabase-js";
import CustomSelect from "./CustomSelect";
import CustomInput from "./CustomInput";
import CustomButton from "./CustomButton";
import { appColors } from "@/lib/theme";
import Alert from "./Alert";
import { ShowCustomToast } from "./CustomToastify";
import { FileInput, PencilIcon, PlusIcon, TrashIcon } from "lucide-react";

const supabase = createClient(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


const MULTISELECT_FIELDS = [
    "Video Type",
    // "Tags",
    "Validations",
    "Objections",
    "Challenges",
    "Sales Insights",
    "Themes",
];

const SINGLESELECT_FIELDS = [
    "Mentions",
    "Client",
    "Employee",
    "Post_Podcast_Insights",
    "Public_vs_Private",
    // "Guest Role",
    "Videos",
    "file_type",
    "category",
    "template_id",
    "department_id"

];

const OPTIONS = {

    "Video Type": [
        { value: "Summary Video", label: "Summary Video" },
        { value: "Full Episode", label: "Full Episode" },
        { value: "Highlights Video", label: "Highlights Video" },
        { value: "Case Study", label: "Case Study" },
        { value: "ICP Advice", label: "ICP Advice" },
        { value: "Post-Podcast Video", label: "Post-Podcast Video" },
        { value: "Guest Introduction", label: "Guest Introduction" },
        { value: "Post Podcast Insights", label: "Post Podcast Insights" },
        { value: "Challenge Questions", label: "Challenge Questions" },
        { value: "Challenge Video", label: "Challenge Video" },
    ],
    // "Tags": [
    //     { value: "Agent Empowerment", label: "Agent Empowerment" },
    //     { value: "Agent Satisfaction", label: "Agent Satisfaction" },
    //     { value: "Customer Loyalty", label: "Customer Loyalty" },
    //     { value: "Data & Analytics", label: "Data & Analytics" },
    //     { value: "AI", label: "AI" },
    // ],
    "Mentions": [
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" },
    ],
    "Client": [
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" },
    ],
    "Employee": [
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" },
    ],
    "Post_Podcast_Insights": [
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" },
    ],
    // "Guest Role": [
    //     { value: "Client", label: "Client" },
    //     { value: "Employee", label: "Employee" },
    //     { value: "Prospect", label: "Prospect" },
    //     { value: "Partner", label: "Partner" },
    //     { value: "Thought Leader", label: "Thought Leader" },
    //     { value: "Expert", label: "Expert" },
    //     { value: "VIP", label: "VIP" },
    //     { value: "Company Executive", label: "Company Executive" },
    //     { value: "Other", label: "Other" },
    // ],
    // "Videos": [
    //     { value: "Highlights Video", label: "Highlights Video" },
    //     { value: "Full Episode", label: "Full Episode" },
    //     { value: "Summary Video", label: "Summary Video" },
    //     { value: "YouTube Short", label: "YouTube Short" },
    //     { value: "LinkedIn", label: "LinkedIn" },
    // ],
    "Public_vs_Private": [
        { value: "Public", label: "Public" },
        { value: "Private", label: "Private" },
    ],
    "Themes": [
        { value: "Positioning Contact Centers as Strategic Growth Drivers (Contact Center Industry)", label: "Positioning Contact Centers as Strategic Growth Drivers (Contact Center Industry)" },
        { value: "Transforming Contact Centers into Experience-Driven Hubs (Contact Center Industry)", label: "Transforming Contact Centers into Experience-Driven Hubs (Contact Center Industry)" },
        { value: "Harnessing AI to Elevate Customer Experience (Contact Center Industry)", label: "Harnessing AI to Elevate Customer Experience (Contact Center Industry)" },
        { value: "Retaining Talent to Reduce Turnover and Improve CX (Contact Center Industry)", label: "Retaining Talent to Reduce Turnover and Improve CX (Contact Center Industry)" },
        { value: "Building Culture and Brand Alignment Inside the Contact Center (Contact Center Industry)", label: "Building Culture and Brand Alignment Inside the Contact Center (Contact Center Industry)" },
        { value: "Treating BPOs as Strategic Growth Partners, Not Just Vendors  (BPO Partnership)", label: "Treating BPOs as Strategic Growth Partners, Not Just Vendors  (BPO Partnership)" },
        { value: "Reimagining Outsourcing for Customer-Centric Service (BPO Partnership)", label: "Reimagining Outsourcing for Customer-Centric Service (BPO Partnership)" },
        { value: "Embedding AI into BPO Operations for Smarter Support (BPO Partnership)", label: "Embedding AI into BPO Operations for Smarter Support (BPO Partnership)" },
        { value: "Aligning Outsourcing KPIs with Revenue and Innovation (BPO Partnership)", label: "Aligning Outsourcing KPIs with Revenue and Innovation (BPO Partnership)" },
        { value: "Joint Talent Management to Elevate BPO Service Quality (BPO Partnership)", label: "Joint Talent Management to Elevate BPO Service Quality (BPO Partnership)" },
        { value: "Redefining Contact Centers as Value Creation Engines (Podcast Guests)", label: "Redefining Contact Centers as Value Creation Engines (Podcast Guests)" },
        { value: "Shifting from Reactive to Proactive Customer Engagement (Podcast Guests)", label: "Shifting from Reactive to Proactive Customer Engagement (Podcast Guests)" },
        { value: "Customer Experience as the New Competitive Advantage (Podcast Guests)", label: "Customer Experience as the New Competitive Advantage (Podcast Guests)" },
        { value: "Linking Agent Experience Directly to Customer Loyalty (Podcast Guests)", label: "Linking Agent Experience Directly to Customer Loyalty (Podcast Guests)" },
        { value: "Using AI to Empower Agents, Not Replace Them (Podcast Guests)", label: "Using AI to Empower Agents, Not Replace Them (Podcast Guests)" },
    ],
    "Objections": [
        { value: "Cost vs. Value Perception", label: "Cost vs. Value Perception" },
        { value: "Brand Representation and Quality Control", label: "Brand Representation and Quality Control" },
        { value: "Fear of Losing Operational Control", label: "Fear of Losing Operational Control" },
        { value: "Integration and Ramp-Up Complexity", label: "Integration and Ramp-Up Complexity" },
        { value: "Lack of Industry-Specific Expertise", label: "Lack of Industry-Specific Expertise" },
        { value: "Technology Gaps and Legacy Limitations", label: "Technology Gaps and Legacy Limitations" },
        { value: "Transparency and Performance Accountabilitys", label: "Transparency and Performance Accountabilitys" },
        { value: "Previous Negative Outsourcing Experience", label: "Previous Negative Outsourcing Experience" },
        { value: "Internal Resistance to Change", label: "Internal Resistance to Change" },
    ],
    "Validations": [
        { value: "Transform Cost Centers into Strategic Experience Centers", label: "Transform Cost Centers into Strategic Experience Centers" },
        { value: "Every Interaction is a Revenue Opportunity", label: "Every Interaction is a Revenue Opportunity" },
        { value: "Operationalizing Revenue From Every Interaction", label: "Operationalizing Revenue From Every Interaction" },
        { value: "Customized AI Strategy Empowering Actionable Insights Through Tailored Technology", label: "Customized AI Strategy Empowering Actionable Insights Through Tailored Technology" },
        { value: "Seamless Integration as an Extension of Your Team", label: "Seamless Integration as an Extension of Your Team" },
        { value: "Proven Tangible Results and Measurable Success", label: "Proven Tangible Results and Measurable Success" },
        { value: "Empowering Executives to Become Strategic Business Partners", label: "Role as Consultant/Partner" },
    ],
    "Challenges": [
        { value: "Misalignment Between Short-Term Targets and Long-Term Value", label: "Misalignment Between Short-Term Targets and Long-Term Value" },
        { value: "Underutilization of Voice-of-Customer Data", label: "Underutilization of Voice-of-Customer Data" },
        { value: "Lack of Empowerment and Budget Control for CX and Support Leaders", label: "Lack of Empowerment and Budget Control for CX and Support Leaders" },
        { value: "Inability to Deeply Understand and Adapt to the ICP", label: "Inability to Deeply Understand and Adapt to the ICP" },
        { value: "Cultural Bias Toward Viewing Support as a Cost Center", label: "Cultural Bias Toward Viewing Support as a Cost Center" },
        { value: "Conflicting Executive Priorities", label: "Conflicting Executive Priorities" },
        { value: "Tagging, Taxonomy, and Feedback Classification Challenges", label: "Tagging, Taxonomy, and Feedback Classification Challenges" },
        { value: "Generational Workforce Gaps", label: "Generational Workforce Gaps" },
        { value: "Tool Overload and AI Misalignment", label: "Tool Overload and AI Misalignment" },
        { value: "Organizational Dysfunction and Scaling Expertise", label: "Organizational Dysfunction and Scaling Expertise" },
    ],
    "Sales Insights": [
        { value: "Evolving Expectations of Data Security", label: "Evolving Expectations of Data Security" },
        { value: "Understanding Buyer Priorities in Scaling Operations", label: "Understanding Buyer Priorities in Scaling Operations" },
        { value: "Proven Experience and Service Quality", label: "Proven Experience and Service Quality" },
        { value: "Customer Experience as a Competitive Advantage", label: "Customer Experience as a Competitive Advantage" },
        { value: "Skepticism About Long-Term Partnership Viability", label: "Skepticism About Long-Term Partnership Viability" },
        { value: "Flexibility in Service and Partnership Models", label: "Flexibility in Service and Partnership Models" },
        { value: "Pressure to Reduce Time-to-Resolution", label: "Pressure to Reduce Time-to-Resolution" },
        { value: "Measuring and Leveraging CX as a Differentiator", label: "Measuring and Leveraging CX as a Differentiator" },
        { value: "Desire for Seamless Integration with Internal Systems", label: "Desire for Seamless Integration with Internal Systems" },
        { value: "Challenges in Scaling Customer Support Operations", label: "Challenges in Scaling Customer Support Operations" },
        { value: "AI for Operational Efficiency and Growth", label: "AI for Operational Efficiency and Growth" },
        { value: "Cultural and Values Alignment for Seamless Collaboration", label: "Cultural and Values Alignment for Seamless Collaboration" },
        { value: "Transitioning from Traditional Contact Centers to Experience Centers", label: "Transitioning from Traditional Contact Centers to Experience Centers" },
        { value: "Customer Experience as a Strategic Differentiator", label: "Customer Experience as a Strategic Differentiator" },
        { value: "Advanced Technology for Streamlined Operations", label: "Advanced Technology for Streamlined Operations" },
        { value: "Ability to Integrate into the Company’s Brand and Culture", label: "Ability to Integrate into the Company’s Brand and Culture" },
        { value: "Cost Sensitivity in Contract Negotiations", label: "Cost Sensitivity in Contract Negotiations" },
        { value: "Resistance to Outsourcing Critical Customer Functions", label: "Resistance to Outsourcing Critical Customer Functions" },
    ],
    "file_type": [
        // 📝 Documents
        { value: "Document", label: "Document (DOC, DOCX, TXT, RTF)" },
        { value: "Spreadsheet", label: "Spreadsheet (XLS, XLSX, CSV)" },
        { value: "Presentation", label: "Presentation (PPT, PPTX)" },
        { value: "PDF", label: "PDF" },

        // 🖼️ Images
        { value: "Image", label: "Image (JPG, JPEG, PNG, GIF, WEBP, SVG)" },

        // 🎥 Media
        { value: "Video", label: "Video (MP4, WEBM, MOV, AVI, MKV)" },
        { value: "Audio", label: "Audio (MP3, WAV, OGG, AAC)" },

        // 📦 Compressed
        { value: "Archive", label: "Archive (ZIP, RAR, 7Z, TAR, GZ)" },

        // 🧬 Code & Source Files
        { value: "Code", label: "Code (JS, TS, HTML, CSS, PY, JAVA, JSON, XML)" },

        // 📁 System & Executables
        { value: "Executable", label: "Executable (EXE, DMG, APK, MSI)" },
        { value: "ISO", label: "Disk Image (ISO, IMG)" },

        // 🔄 Other or Unknown
        { value: "Other", label: "Other / Unknown" },
    ],
    "category": [
        { value: "Presentations", label: "Presentations" },
        { value: "Sales Calls", label: "Sales Calls" },
        { value: "Scripts", label: "Scripts" },
        { value: "Templates", label: "Templates" },
        { value: "Reports", label: "Reports" },
        { value: "Training", label: "Training" },
        { value: "Marketing", label: "Marketing" },
        { value: "Other", label: "Other" }
    ],


};


// Updated ThemeEntry component to properly display theme data
const ThemeEntry = ({ theme, ranking, justification, perception, whyItMatters, deeperInsight, supportingQuotes, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p><span className="font-medium">Theme:</span> <span className='text-gray-400 text-sm'>{theme || "No theme selected"}</span></p>
                    <p><span className="font-medium">Match Rating (1-10):</span> <span className='text-gray-400 text-sm'>{ranking || "N/A"}</span></p>
                    <p><span className="font-medium">Rating Justification:</span> <span className='text-gray-400 text-sm'>{justification || "No justification available"}</span></p>
                    <p><span className="font-medium">Perception to Address:</span> <span className='text-gray-400 text-sm'>{perception || "Not specified"}</span></p>
                    <p><span className="font-medium">Why It Matters:</span> <span className='text-gray-400 text-sm'>{whyItMatters || "Not specified"}</span></p>
                    <p><span className="font-medium">Deeper Insight:</span> <span className='text-gray-400 text-sm'>{deeperInsight || "Not specified"}</span></p>
                    <p><span className="font-medium">Supporting Quotes:</span> <span className='text-gray-400 text-sm'>{supportingQuotes || "Not specified"}</span></p>
                </div>
                <div className="flex space-x-1">
                    <div onClick={() => onEdit(index)} className="text-blue-500 hover:text-blue-700">
                        <PencilIcon className="h-5 w-5" />
                    </div>
                    <div onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700">
                        <TrashIcon className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ObjectionEntry = ({ objection, ranking, justification, perception, whyItMatters, deeperInsight, supportingQuotes, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p><span className="font-medium">Objection:</span> <span className='text-gray-400 text-sm'>{objection || "No objection selected"}</span></p>
                    <p><span className="font-medium">Match Rating (1-10):</span> <span className='text-gray-400 text-sm'>{ranking || "N/A"}</span></p>
                    <p><span className="font-medium">Rating Justification:</span> <span className='text-gray-400 text-sm'>{justification || "No justification available"}</span></p>
                    <p><span className="font-medium">Perception to Address:</span> <span className='text-gray-400 text-sm'>{perception || "Not specified"}</span></p>
                    <p><span className="font-medium">Why It Matters:</span> <span className='text-gray-400 text-sm'>{whyItMatters || "Not specified"}</span></p>
                    <p><span className="font-medium">Deeper Insight:</span> <span className='text-gray-400 text-sm'>{deeperInsight || "Not specified"}</span></p>
                    <p><span className="font-medium">Supporting Quotes:</span> <span className='text-gray-400 text-sm'>{supportingQuotes || "Not specified"}</span></p>
                </div>
                <div className="flex space-x-1">
                    <div onClick={() => onEdit(index)} className="text-blue-500 hover:text-blue-700">
                        <PencilIcon className="h-5 w-5" />
                    </div>
                    <div onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700">
                        <TrashIcon className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChallengesEntry = ({ challenge, ranking, justification, perception, whyItMatters, deeperInsight, supportingQuotes, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p><span className="font-medium">Challenge:</span> <span className='text-gray-400 text-sm'>{challenge || "No challenge selected"}</span></p>
                    <p><span className="font-medium">Match Rating (1-10):</span> <span className='text-gray-400 text-sm'>{ranking || "N/A"}</span></p>
                    <p><span className="font-medium">Rating Justification:</span> <span className='text-gray-400 text-sm'>{justification || "No justification available"}</span></p>
                    <p><span className="font-medium">Perception to Address:</span> <span className='text-gray-400 text-sm'>{perception || "Not specified"}</span></p>
                    <p><span className="font-medium">Why It Matters:</span> <span className='text-gray-400 text-sm'>{whyItMatters || "Not specified"}</span></p>
                    <p><span className="font-medium">Deeper Insight:</span> <span className='text-gray-400 text-sm'>{deeperInsight || "Not specified"}</span></p>
                    <p><span className="font-medium">Supporting Quotes:</span> <span className='text-gray-400 text-sm'>{supportingQuotes || "Not specified"}</span></p>
                </div>
                <div className="flex space-x-1">
                    <div onClick={() => onEdit(index)} className="text-blue-500 hover:text-blue-700">
                        <PencilIcon className="h-5 w-5" />
                    </div>
                    <div onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700">
                        <TrashIcon className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const SalesInsightsEntry = ({ insight, ranking, justification, perception, whyItMatters, deeperInsight, supportingQuotes, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p><span className="font-medium">Sales Insight:</span> <span className='text-gray-400 text-sm'>{insight || "No insight provided"}</span></p>
                    <p><span className="font-medium">Match Rating (1–10):</span> <span className='text-gray-400 text-sm'>{ranking || "N/A"}</span></p>
                    <p><span className="font-medium">Rating Justification:</span> <span className='text-gray-400 text-sm'>{justification || "No justification available"}</span></p>
                    <p><span className="font-medium">Perception to Address:</span> <span className='text-gray-400 text-sm'>{perception || "Not specified"}</span></p>
                    <p><span className="font-medium">Why It Matters:</span> <span className='text-gray-400 text-sm'>{whyItMatters || "Not specified"}</span></p>
                    <p><span className="font-medium">Deeper Insight:</span> <span className='text-gray-400 text-sm'>{deeperInsight || "Not specified"}</span></p>
                    <p><span className="font-medium">Supporting Quotes:</span> <span className='text-gray-400 text-sm'>{supportingQuotes || "Not specified"}</span></p>
                </div>
                <div className="flex space-x-1">
                    <div onClick={() => onEdit(index)} className="text-blue-500 hover:text-blue-700">
                        <PencilIcon className="h-5 w-5" />
                    </div>
                    <div onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700">
                        <TrashIcon className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </div>
    );
};


const CaseStudyVideoEntry = ({
    video_title,
    video_link,
    copy_and_paste_text,
    link_to_document,
    onEdit,
    onRemove,
    index,
}) => {
    return (
        <div
            className="border rounded-lg p-3 mb-3"
            style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}
        >
            <div className="flex justify-between items-start">
                <div className="flex-1 space-y-1">
                    <p>
                        <span className="font-medium">Video Title:</span>{' '}
                        <span className="text-gray-400 text-sm">{video_title || 'No title provided'}</span>
                    </p>
                    <p>
                        <span className="font-medium">Video Link:</span>{' '}
                        <a
                            href={video_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline text-sm"
                        >
                            {video_link || 'No link provided'}
                        </a>
                    </p>
                    <p>
                        <span className="font-medium">Copy & Paste Text:</span>{' '}
                        <span className="text-gray-400 text-sm">
                            {copy_and_paste_text || 'No text provided'}
                        </span>
                    </p>
                    <p>
                        <span className="font-medium">Link to Document:</span>{' '}
                        <a
                            href={link_to_document}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline text-sm"
                        >
                            {link_to_document || 'No document link'}
                        </a>
                    </p>
                </div>
                <div className="flex space-x-1">
                    <div onClick={() => onEdit(index)} className="text-blue-500 hover:text-blue-700 cursor-pointer">
                        <PencilIcon className="h-5 w-5" />
                    </div>
                    <div onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700 cursor-pointer">
                        <TrashIcon className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </div>
    );
};


const ValidationEntry = ({ validation, ranking, justification, perception, whyItMatters, deeperInsight, supportingQuotes, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p><span className="font-medium">Validation:</span> <span className='text-gray-400 text-sm'>{validation || "No validation selected"}</span></p>
                    <p><span className="font-medium">Match Rating (1-10):</span> <span className='text-gray-400 text-sm'>{ranking || "N/A"}</span></p>
                    <p><span className="font-medium">Rating Justification:</span> <span className='text-gray-400 text-sm'>{justification || "No justification available"}</span></p>
                    <p><span className="font-medium">Perception to Address:</span> <span className='text-gray-400 text-sm'>{perception || "Not specified"}</span></p>
                    <p><span className="font-medium">Why It Matters:</span> <span className='text-gray-400 text-sm'>{whyItMatters || "Not specified"}</span></p>
                    <p><span className="font-medium">Deeper Insight:</span> <span className='text-gray-400 text-sm'>{deeperInsight || "Not specified"}</span></p>
                    <p><span className="font-medium">Supporting Quotes:</span> <span className='text-gray-400 text-sm'>{supportingQuotes || "Not specified"}</span></p>
                </div>
                <div className="flex space-x-1">
                    <div onClick={() => onEdit(index)} className="text-blue-500 hover:text-blue-700">
                        <PencilIcon className="h-5 w-5" />
                    </div>
                    <div onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700">
                        <TrashIcon className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </div>
    );
};
const CustomCrudForm = ({ onClose, onSubmit, entityData, isEditMode = false, displayFields, currentPage, itemsPerPage, setUsers, setCurrentPage, setTotalRecords, fetchUsers, themesRank, prefilledData = null, tableName, createRecord, updateRecord, isDashboardForm, isFilesData }) => {
    const [loading, setLoading] = useState(false);

    // Themes
    const [currentTheme, setCurrentTheme] = useState("");
    const [currentRanking, setCurrentRanking] = useState("");
    const [currentJustification, setCurrentJustification] = useState("");
    const [currentPerception, setCurrentPerception] = useState("");
    const [currentWhyItMatters, setCurrentWhyItMatters] = useState("");
    const [currentDeeperInsight, setCurrentDeeperInsight] = useState("");
    const [currentSupportingQuotes, setCurrentSupportingQuotes] = useState("");

    const [themeEntries, setThemeEntries] = useState([]);
    const [editIndex, setEditIndex] = useState(null);

    // Objections
    const [currentObjection, setCurrentObjection] = useState("");
    const [currentObjectionRanking, setCurrentObjectionRanking] = useState("");
    const [currentObjectionJustification, setCurrentObjectionJustification] = useState("");
    const [currentObjectionPerception, setCurrentObjectionPerception] = useState("");
    const [currentObjectionWhyItMatters, setCurrentObjectionWhyItMatters] = useState("");
    const [currentObjectionDeeperInsight, setCurrentObjectionDeeperInsight] = useState("");
    const [currentObjectionSupportingQuotes, setCurrentObjectionSupportingQuotes] = useState("");
    const [objectionEntries, setObjectionEntries] = useState([]);
    const [objectionEditIndex, setObjectionEditIndex] = useState(null);

    //Validations
    const [currentValidation, setCurrentValidation] = useState("");
    const [currentValidationRanking, setCurrentValidationRanking] = useState("");
    const [currentValidationJustification, setCurrentValidationJustification] = useState("");
    const [currentValidationPerception, setCurrentValidationPerception] = useState("");
    const [currentValidationWhyItMatters, setCurrentValidationWhyItMatters] = useState("");
    const [currentValidationDeeperInsight, setCurrentValidationDeeperInsight] = useState("");
    const [currentValidationSupportingQuotes, setCurrentValidationSupportingQuotes] = useState("");
    const [validationEntries, setValidationEntries] = useState([]);
    const [validationEditIndex, setValidationEditIndex] = useState(null);

    //Challenges
    const [currentChallenges, setCurrentChallenges] = useState("");
    const [currentChallengesRanking, setCurrentChallengesRanking] = useState("");
    const [currentChallengesJustification, setCurrentChallengesJustification] = useState("");
    const [currentChallengesPerception, setCurrentChallengesPerception] = useState("");
    const [currentChallengesWhyItMatters, setCurrentChallengesWhyItMatters] = useState("");
    const [currentChallengesDeeperInsight, setCurrentChallengesDeeperInsight] = useState("");
    const [currentChallengesSupportingQuotes, setCurrentChallengesSupportingQuotes] = useState("");
    const [challengesEntries, setChallengesEntries] = useState([]);
    const [challengesEditIndex, setChallengesEditIndex] = useState(null);

    //Sales Insights
    const [currentSalesInsight, setCurrentSalesInsight] = useState("");
    const [currentSalesInsightRanking, setCurrentSalesInsightRanking] = useState("");
    const [currentSalesInsightJustification, setCurrentSalesInsightJustification] = useState("");
    const [currentSalesInsightPerception, setCurrentSalesInsightPerception] = useState("");
    const [currentSalesInsightWhyItMatters, setCurrentSalesInsightWhyItMatters] = useState("");
    const [currentSalesInsightDeeperInsight, setCurrentSalesInsightDeeperInsight] = useState("");
    const [currentSalesInsightSupportingQuotes, setCurrentSalesInsightSupportingQuotes] = useState("");
    const [salesInsightsEntries, setSalesInsightsEntries] = useState([]);
    const [salesInsightsEditIndex, setSalesInsightsEditIndex] = useState(null);

    // Case Study Other Video
    const [currentVideoTitle, setCurrentVideoTitle] = useState("");
    const [currentVideoLink, setCurrentVideoLink] = useState("");
    const [currentCopyAndPasteText, setCurrentCopyAndPasteText] = useState("");
    const [currentLinkToDocument, setCurrentLinkToDocument] = useState("");
    const [caseStudyVideoEntries, setCaseStudyVideoEntries] = useState([]);
    const [caseStudyVideoEditIndex, setCaseStudyVideoEditIndex] = useState(null);


    function normalizeThemes(data) {
        if (!Array.isArray(data)) return [];
        return data.map(entry => {
            if (typeof entry === "string") {
                return {
                    theme: entry, ranking: "", justification: "", perception: "",
                    whyItMatters: "",
                    deeperInsight: "",
                    supportingQuotes: ""
                };
            }
            return entry;
        });
    }

    function normalizeValidations(data) {
        if (!Array.isArray(data)) return [];
        return data.map(entry => {
            if (typeof entry === "string") {
                return {
                    validation: entry, ranking: "", justification: "", perception: "",
                    whyItMatters: "",
                    deeperInsight: "",
                    supportingQuotes: ""
                };
            }
            return entry;
        });
    }

    function normalizeObjections(data) {
        if (!Array.isArray(data)) return [];
        return data.map(entry => {
            if (typeof entry === "string") {
                return {
                    objection: entry, ranking: "", justification: "", perception: "",
                    whyItMatters: "",
                    deeperInsight: "",
                    supportingQuotes: ""
                };
            }
            return entry;
        });
    }

    function normalizeChallenges(data) {
        if (!Array.isArray(data)) return [];
        return data.map(entry => {
            if (typeof entry === "string") {
                return {
                    challenges: entry, ranking: "", justification: "", perception: "",
                    whyItMatters: "",
                    deeperInsight: "",
                    supportingQuotes: ""
                };
            }
            return entry;
        });
    }

    function normalizeSalesInsights(data) {
        if (!Array.isArray(data)) return [];
        return data.map(entry => {
            if (typeof entry === "string") {
                return {
                    insight: entry,
                    ranking: "",
                    justification: "",
                    perception: "",
                    whyItMatters: "",
                    deeperInsight: "",
                    supportingQuotes: ""
                };
            }
            return entry;
        });
    }

    function normalizeCaseStudyOtherVideo(data) {
        if (!Array.isArray(data)) return [];
        return data.map(entry => {
            if (typeof entry === "string") {
                return {
                    video_title: "",
                    video_link: "",
                    copy_and_paste_text: "",
                    link_to_document: ""
                };
            }
            return {
                video_title: entry.video_title || "",
                video_link: entry.video_link || "",
                copy_and_paste_text: entry.copy_and_paste_text || "",
                link_to_document: entry.link_to_document || ""
            };
        });
    }


    useEffect(() => {
        if (entityData?.id) {
            const matchedData = themesRank?.find(item => item.id === entityData.id);

            // --- Handle Themes
            const themeData = matchedData?.Themes;
            if (themeData) {
                try {
                    const parsed = Array.isArray(themeData) ? themeData : JSON.parse(themeData);
                    setThemeEntries(normalizeThemes(parsed));
                } catch (e) {
                    console.log("Error parsing themes:", e);
                    setThemeEntries([]);
                }
            } else {
                setThemeEntries([]);
            }

            // --- Handle Validations
            const validationData = matchedData?.Validations;
            if (validationData) {
                try {
                    const parsed = Array.isArray(validationData) ? validationData : JSON.parse(validationData);
                    setValidationEntries(normalizeValidations(parsed));
                } catch (e) {
                    console.log("Error parsing validations:", e);
                    setValidationEntries([]);
                }
            } else {
                setValidationEntries([]);
            }

            // --- Handle Objections
            const objectionData = matchedData?.Objections;
            if (objectionData) {
                try {
                    const parsed = Array.isArray(objectionData) ? objectionData : JSON.parse(objectionData);
                    setObjectionEntries(normalizeObjections(parsed));
                } catch (e) {
                    console.log("Error parsing objections:", e);
                    setObjectionEntries([]);
                }
            } else {
                setObjectionEntries([]);
            }
            // --- Handle  Challenges
            const challengesData = matchedData?.Challenges;
            if (challengesData) {
                try {
                    const parsed = Array.isArray(challengesData) ? challengesData : JSON.parse(challengesData);
                    setChallengesEntries(normalizeChallenges(parsed));
                } catch (e) {
                    console.log("Error parsing challenges:", e);
                    setChallengesEntries([]);
                }
            } else {
                setChallengesEntries([]);
            }

            // --- Handle Sales Insights 
            const salesInsightsData = matchedData?.["Sales Insights"];
            if (salesInsightsData) {
                try {
                    const parsed = Array.isArray(salesInsightsData) ? salesInsightsData : JSON.parse(salesInsightsData);
                    setSalesInsightsEntries(normalizeSalesInsights(parsed));
                } catch (e) {
                    console.log("Error parsing Sales Insights:", e);
                    setSalesInsightsEntries([]);
                }
            } else {
                setSalesInsightsEntries([]);
            }
            // === NEW: Handle Case Study Other Video ===========================
            const otherVideoData =
                matchedData?.Case_Study_Other_Video ?? matchedData?.Case_Study_Other_Video;
            if (otherVideoData) {
                try {
                    const parsed = Array.isArray(otherVideoData) ? otherVideoData : JSON.parse(otherVideoData);
                    setCaseStudyVideoEntries(normalizeCaseStudyOtherVideo(parsed));
                } catch (e) {
                    console.log("Error parsing Case Study Other Video:", e);
                    setCaseStudyVideoEntries([]);
                }
            } else {
                setCaseStudyVideoEntries([]);
            }

        } else {
            // Clear on new entry
            setThemeEntries([]);
            setValidationEntries([]);
            setObjectionEntries([]);
            setChallengesEntries([]);
            setSalesInsightsEntries([]);
        }
    }, [entityData, themesRank]);


    const validationSchema = Yup.object(
        displayFields.reduce((schema, field) => {
            if (field.key === "Themes" || field.key === "Objections" || field.key === "Validations" || field.key == "Challenges" || field.key == "Sales Insights") {
                schema[field.key] = Yup.array().of(
                    Yup.object().shape({
                        [field.key.toLowerCase().slice(0, -1)]: Yup.string().required(`${field.key.slice(0, -1)} is required`),
                        ranking: Yup.number()
                            .min(1, "Ranking must be at least 1")
                            .max(10, "Ranking must be at most 10")
                            .required("Ranking is required"),
                        justification: Yup.string().required("Justification is required"),
                        perception: Yup.string(),
                        whyItMatters: Yup.string(),
                        deeperInsight: Yup.string(),
                        supportingQuotes: Yup.string(),
                    })
                );
            } else if (!["ranking", "Ranking Justification",
                "Challenge Report_Unedited Video Link",
                "Challenge Report_Unedited Transcript Link",
                "Challenge Report_Summary",
                "Podcast Report_Unedited Video Link",
                "Podcast Report_Unedited Transcript Link",
                "Podcast Report_Summary",
                "Post-Podcast Report_Unedited Video Link",
                "Post-Podcast Report_Unedited Transcript Link",
                "Post-Podcast Report_Summary",
                "Quote Card - Extended Media"].includes(field.key)) {
                if (MULTISELECT_FIELDS.includes(field.key)) {
                    schema[field.key] = Yup.array()
                        .of(Yup.string())
                        .min(1, `${field.label} is required`);
                } else if (SINGLESELECT_FIELDS.includes(field.key)) {
                    schema[field.key] = Yup.string().required(`${field.label} is required`);
                } else if (field.type === "number") {
                    schema[field.key] = Yup.number()
                        .required(`${field.label} is required`)
                        .positive(`${field.label} must be positive`);
                } else if (field.type === "url") {
                    schema[field.key] = Yup.string().url(`${field.label} must be a valid URL`);
                } else if (field.type === "ranking") {
                    schema[field.key] = Yup.number()
                        .min(1, `${field.label} must be at least 1`)
                        .max(10, `${field.label} must be at most 10`)
                        .required(`${field.label} is required`);
                } else {
                    schema[field.key] = Yup.string().required(`${field.label} is required`);
                }
            }
            return schema;
        }, {})
    );
    const normalizeSelectOptions = (value, options = []) => {
        if (!value) return [];

        // Handle both array and single value cases
        const valuesArray = Array.isArray(value) ? value : [value];

        return valuesArray.map(item => {
            // If already in correct format
            if (typeof item === 'object' && item.label && item.value) {
                return item;
            }

            // Find matching option
            const stringValue = String(item);
            const matchedOption = options.find(opt =>
                opt.value === stringValue || opt.label === stringValue
            );

            return matchedOption || {
                label: stringValue,
                value: stringValue
            };
        });
    };
    // Initialize form values properly
    const initialValues = {};
    displayFields.forEach(field => {
        if (field.key === "Themes" || field.key === "Objections" || field.key === "Validations" ||
            field.key === "Challenges" || field.key == "Sales Insights" || field.key == 'Case_Study_Other_Video') {
            initialValues[field.key] = normalizeThemes(entityData?.[field.key] || []);
        } else if (!["ranking", "Ranking Justification"].includes(field.key)) {
            // Handle file_type and category as arrays
            if (field.key === 'file_type' || field.key === 'category') {
                initialValues[field.key] = normalizeSelectOptions(
                    entityData?.[field.key],
                    OPTIONS[field.key] || []
                );
            }
            // Handle file field
            else if (field.key === 'file') {
                initialValues[field.key] = entityData?.[field.key] || null;
            }
            // Update this part in your initialValues setup
            else if (field.key === 'template_id' || field.key === 'department_id') {
                const rawValue = (prefilledData && prefilledData[field.key]) || entityData?.[field.key];
                const options = field.options || OPTIONS[field.key] || [];

                // Force conversion to option object
                if (rawValue !== undefined && rawValue !== null) {
                    initialValues[field.key] = typeof rawValue === 'object' ?
                        rawValue :
                        options.find(opt => opt.value == rawValue) || {
                            value: rawValue,
                            label: String(rawValue)
                        };
                } else {
                    initialValues[field.key] = null;
                }
            }
            else {
                initialValues[field.key] = (prefilledData && prefilledData[field.key]) || entityData?.[field.key] ||
                    (MULTISELECT_FIELDS.includes(field.key) ? [] :
                        SINGLESELECT_FIELDS.includes(field.key) ? "" :
                            field.type === "number" ? 0 :
                                field.type === "image" ? "" :
                                    "");
            }
        }
    });
    useEffect(() => {
        console.log("Entity data on edit:", entityData);
        console.log("Initial values:", initialValues);
    }, [entityData]);
    console.log("Initial values after transformation:", {
        category: initialValues.category,
        file_type: initialValues.file_type
    });

    const formik = useFormik({
        initialValues,
        // validationSchema,
        onSubmit: async (values) => {
            try {
                let themesData = null;
                if (themeEntries.length > 0) {
                    themesData = themeEntries.map(entry => ({
                        theme: String(entry.theme || ""),
                        ranking: parseInt(entry.ranking) || 0,
                        justification: String(entry.justification || ""),
                        perception: String(entry.perception || ""),
                        whyItMatters: String(entry.whyItMatters || ""),
                        deeperInsight: String(entry.deeperInsight || ""),
                        supportingQuotes: String(entry.supportingQuotes || "")
                    }));
                }
                let objectionData = null;
                if (objectionEntries.length > 0) {
                    objectionData = objectionEntries.map(entry => ({
                        objection: String(entry.objection || ""),
                        ranking: parseInt(entry.ranking) || 0,
                        justification: String(entry.justification || ""),
                        perception: String(entry.perception || ""),
                        whyItMatters: String(entry.whyItMatters || ""),
                        deeperInsight: String(entry.deeperInsight || ""),
                        supportingQuotes: String(entry.supportingQuotes || "")
                    }));
                }
                let validationData = null;
                if (validationEntries.length > 0) {
                    validationData = validationEntries.map(entry => ({
                        validation: String(entry.validation || ""),
                        ranking: parseInt(entry.ranking) || 0,
                        justification: String(entry.justification || ""),
                        perception: String(entry.perception || ""),
                        whyItMatters: String(entry.whyItMatters || ""),
                        deeperInsight: String(entry.deeperInsight || ""),
                        supportingQuotes: String(entry.supportingQuotes || "")
                    }));
                }

                let challengesData = null;
                if (challengesEntries.length > 0) {
                    challengesData = challengesEntries.map(entry => ({
                        challenges: String(entry.challenges || ""),
                        ranking: parseInt(entry.ranking) || 0,
                        justification: String(entry.justification || ""),
                        perception: String(entry.perception || ""),
                        whyItMatters: String(entry.whyItMatters || ""),
                        deeperInsight: String(entry.deeperInsight || ""),
                        supportingQuotes: String(entry.supportingQuotes || "")
                    }));
                }

                let salesInsightsData = null;
                if (salesInsightsEntries.length > 0) {
                    salesInsightsData = salesInsightsEntries.map(entry => ({
                        insight: String(entry.insight || ""),
                        ranking: parseInt(entry.ranking) || 0,
                        justification: String(entry.justification || ""),
                        perception: String(entry.perception || ""),
                        whyItMatters: String(entry.whyItMatters || ""),
                        deeperInsight: String(entry.deeperInsight || ""),
                        supportingQuotes: String(entry.supportingQuotes || "")
                    }));
                }


                // Create the payload with properly formatted values
                const formattedValuesDashboard = {
                    ...values,
                    Themes: themeEntries.length > 0 ? themeEntries : null,
                    Objections: objectionEntries.length > 0 ? objectionEntries : null,
                    Validations: validationEntries.length > 0 ? validationEntries : null,
                    Challenges: challengesEntries.length > 0 ? challengesEntries : null,
                    "Sales Insights": salesInsightsEntries.length > 0 ? salesInsightsEntries : null,
                    Case_Study_Other_Video: caseStudyVideoEntries.length > 0 ? caseStudyVideoEntries : null,
                    company_id: localStorage.getItem('company_id'),
                    template_id: values.template_id?.value || values.template_id || null,
                    department_id: values.department_id?.value || values.department_id || null
                };

                const formattedValues = isDashboardForm ? formattedValuesDashboard : { company_id: localStorage.getItem('company_id'), ...values };

                console.log("forrr", formattedValues);


                // Uplod images and Files
                for (const field of displayFields) {
                    const fieldValue = values[field.key];

                    console.log(`Processing field: ${field.key}`, {
                        type: field.type,
                        value: fieldValue,
                        isFile: fieldValue instanceof File
                    });

                    // Handle file uploads (both files and images)
                    if (field.type === "file" || field.type === "image") {
                        try {
                            // Case 1: Already uploaded file (has URL)
                            if (typeof fieldValue === "object" && fieldValue?.url) {
                                formattedValues[field.key] = fieldValue.url;
                                continue;
                            }

                            // Case 2: New file upload
                            if (fieldValue instanceof File) {
                                const bucketName = field.type === "image" ? "images" : "documents";
                                const fileExt = fieldValue.name.split(".").pop();
                                const fileName = `${Date.now()}.${fileExt}`;
                                const filePath = `${fileName}`;

                                // Upload the file
                                const { error: uploadError, data: uploadData } = await supabase
                                    .storage
                                    .from(bucketName)
                                    .upload(filePath, fieldValue, {
                                        cacheControl: "3600",
                                        upsert: false // Set to true if you want to overwrite existing files
                                    });

                                if (uploadError) {
                                    console.error(`Upload failed for ${field.key}:`, uploadError);
                                    throw uploadError;
                                }

                                console.log(`Successfully uploaded to ${bucketName}:`, uploadData);

                                // Get public URL
                                const { data: publicUrlData } = supabase
                                    .storage
                                    .from(bucketName)
                                    .getPublicUrl(filePath);

                                formattedValues[field.key] = publicUrlData.publicUrl;
                                continue;
                            }

                            // Case 3: String value (could be initial value or fakepath)
                            if (typeof fieldValue === "string") {
                                // If it's a URL, keep it
                                if (fieldValue.startsWith('http')) {
                                    formattedValues[field.key] = fieldValue;
                                }
                                // If it's a fakepath, ignore it (no file was selected)
                                else if (fieldValue.includes('fakepath')) {
                                    formattedValues[field.key] = ''; // or null, depending on your needs
                                }
                                continue;
                            }
                        } catch (error) {
                            console.error(`File processing failed for ${field.key}:`, error);
                            formattedValues[field.key] = null;
                            continue;
                        }
                    }
                    if (field.key === 'template_id' || field.key === 'department_id') {
                        continue;
                    }
                    // Non-file fields
                    formattedValues[field.key] = fieldValue;
                }
                // After your big loop:
                if (formattedValues.template_id){
                    formattedValues.template_id = formik.values?.template_id?.value || formik.values.template_id || null;
                }
      if (formattedValues.department_id){
                formattedValues.department_id = formik.values?.department_id?.value || formik.values.department_id || null;
      }
                console.log("Final formatted values:", formattedValues);

                let response;
                // ✅ Force file_type, category, and tags into valid arrays for jsonb
                if (isFilesData) {
                    ['file_type', 'category', 'tags'].forEach((key) => {
                        if (!(key in formattedValues)) return;
                        const val = formattedValues[key];

                        if (Array.isArray(val)) {
                            formattedValues[key] = val
                                .map((v) => {
                                    if (typeof v === 'string') return v.trim();
                                    if (v && typeof v === 'object' && v.value) return v.value;
                                    return null;
                                })
                                .filter(Boolean);
                        } else if (val && typeof val === 'object' && val.value) {
                            formattedValues[key] = [val.value];
                        } else if (typeof val === 'string') {
                            formattedValues[key] = val.trim() ? [val.trim()] : null;
                        } else {
                            formattedValues[key] = null;
                        }
                    });

                }


                if (isEditMode) {
                    response = await supabase
                        .from(tableName)
                        .update(formattedValues)
                        .eq("id", entityData.id);
                } else {
                    response = await supabase
                        .from(tableName)
                        .insert([formattedValues]);
                }

                if (response.error) throw response.error;
                console.log("Creating record with values:", formattedValues);


                Alert.show('Success', isEditMode ? 'Record updated successfully.' : 'Record created successfully.', [{
                    text: 'OK',
                    primary: true,
                }]);
                // Refresh data
                const { count, error: countError } = await supabase
                    .from(tableName)
                    .select("*", { count: "exact", head: true })
                    .order('id_order', { ascending: false });

                if (countError) throw countError;
                setTotalRecords(count || 0);

                if ((currentPage - 1) * itemsPerPage >= count) {
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                }

                const { data, error } = await supabase
                    .from(tableName)
                    .select("*")
                    .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)
                    .order('id_order', { ascending: false });

                if (error) throw error;

                setUsers(data);
                onSubmit(formattedValues);
                onClose();
                fetchUsers();
            } catch (error) {
                console.log("Error saving data:", error);
                ShowCustomToast("Error saving data: " + error.message, "error");
            }
        },
    });

    //Themes Handlers
    const handleAddTheme = () => {
        // if (!currentTheme || !currentRanking || !currentJustification) {
        //     ShowCustomToast("Please fill all theme fields before adding.", "error");
        //     return;
        // }

        const newEntry = {
            theme: currentTheme,
            ranking: parseInt(currentRanking) || 0,
            justification: currentJustification,
            perception: currentPerception,
            whyItMatters: currentWhyItMatters,
            deeperInsight: currentDeeperInsight,
            supportingQuotes: currentSupportingQuotes
        };

        if (editIndex !== null) {
            const updated = [...themeEntries];
            updated[editIndex] = newEntry;
            setThemeEntries(updated);
            setEditIndex(null);
        } else {
            setThemeEntries([...themeEntries, newEntry]);
        }

        // Reset fields
        setCurrentTheme("");
        setCurrentRanking("");
        setCurrentJustification("");
        setCurrentPerception("");
        setCurrentWhyItMatters("");
        setCurrentDeeperInsight("");
        setCurrentSupportingQuotes("");

    };

    const handleEditTheme = (index) => {
        const entry = themeEntries[index];
        setCurrentTheme(entry.theme);
        setCurrentRanking(entry.ranking);
        setCurrentJustification(entry.justification);
        setCurrentPerception(entry.perception);
        setCurrentWhyItMatters(entry.whyItMatters);
        setCurrentDeeperInsight(entry.deeperInsight);
        setCurrentSupportingQuotes(entry.supportingQuotes);
        setEditIndex(index);
    };

    const handleRemoveTheme = (index) => {
        const updated = themeEntries.filter((_, i) => i !== index);
        setThemeEntries(updated);
        if (editIndex === index) {
            setCurrentTheme("");
            setCurrentRanking("");
            setCurrentJustification("");
            setCurrentPerception("");
            setCurrentWhyItMatters("");
            setCurrentDeeperInsight("");
            setCurrentSupportingQuotes("");

            setEditIndex(null);
        } else if (editIndex > index) {
            setEditIndex(editIndex - 1);
        }
    };

    // Objection handlers
    const handleAddObjection = () => {
        // if (!currentObjection || !currentObjectionRanking || !currentObjectionJustification) {
        //     ShowCustomToast("Please fill all objection fields before adding.", "error");
        //     return;
        // }

        const newEntry = {
            objection: currentObjection,
            ranking: parseInt(currentObjectionRanking) || 0,
            justification: currentObjectionJustification,
            perception: currentObjectionPerception,
            whyItMatters: currentObjectionWhyItMatters,
            deeperInsight: currentObjectionDeeperInsight,
            supportingQuotes: currentObjectionSupportingQuotes
        };

        if (objectionEditIndex !== null) {
            const updated = [...objectionEntries];
            updated[objectionEditIndex] = newEntry;
            setObjectionEntries(updated);
            setObjectionEditIndex(null);
        } else {
            setObjectionEntries([...objectionEntries, newEntry]);
        }

        setCurrentObjection("");
        setCurrentObjectionRanking("");
        setCurrentObjectionJustification("");
        setCurrentObjectionPerception("");
        setCurrentObjectionWhyItMatters("");
        setCurrentObjectionDeeperInsight("");
        setCurrentObjectionSupportingQuotes("");
    };

    const handleEditObjection = (index) => {
        const entry = objectionEntries[index];
        setCurrentObjection(entry.objection);
        setCurrentObjectionRanking(entry.ranking);
        setCurrentObjectionJustification(entry.justification);
        setCurrentObjectionPerception(entry.perception);
        setCurrentObjectionWhyItMatters(entry.whyItMatters);
        setCurrentObjectionDeeperInsight(entry.deeperInsight);
        setCurrentObjectionSupportingQuotes(entry.supportingQuotes);
        setObjectionEditIndex(index);
    };

    const handleRemoveObjection = (index) => {
        const updated = objectionEntries.filter((_, i) => i !== index);
        setObjectionEntries(updated);
        if (objectionEditIndex === index) {
            setCurrentObjection("");
            setCurrentObjectionRanking("");
            setCurrentObjectionJustification("");
            setCurrentObjectionPerception("");
            setCurrentObjectionWhyItMatters("");
            setCurrentObjectionDeeperInsight("");
            setCurrentObjectionSupportingQuotes("");
            setObjectionEditIndex(null);
        } else if (objectionEditIndex > index) {
            setObjectionEditIndex(objectionEditIndex - 1);
        }
    };


    // Challenges handlers
    const handleAddChallenges = () => {
        // if (!currentChallenges || !currentChallengesRanking || !currentChallengesJustification) {
        //     ShowCustomToast("Please fill all challenge fields before adding.", "error");
        //     return;
        // }

        const newEntry = {
            challenges: currentChallenges,
            ranking: parseInt(currentChallengesRanking) || 0,
            justification: currentChallengesJustification,
            perception: currentChallengesPerception,
            whyItMatters: currentChallengesWhyItMatters,
            deeperInsight: currentChallengesDeeperInsight,
            supportingQuotes: currentChallengesSupportingQuotes
        };

        if (challengesEditIndex !== null) {
            const updated = [...challengesEntries];
            updated[challengesEditIndex] = newEntry;
            setChallengesEntries(updated);
            setChallengesEditIndex(null);
        } else {
            setChallengesEntries([...challengesEntries, newEntry]);
        }

        setCurrentChallenges("");
        setCurrentChallengesRanking("");
        setCurrentChallengesJustification("");
        setCurrentChallengesPerception("");
        setCurrentChallengesWhyItMatters("");
        setCurrentChallengesDeeperInsight("");
        setCurrentChallengesSupportingQuotes("");

    };

    const handleEditChallenges = (index) => {
        const entry = challengesEntries[index];
        setCurrentChallenges(entry.challenges);
        setCurrentChallengesRanking(entry.ranking);
        setCurrentChallengesJustification(entry.justification);
        setCurrentChallengesPerception(entry.perception);
        setCurrentChallengesWhyItMatters(entry.whyItMatters);
        setCurrentChallengesDeeperInsight(entry.deeperInsight);
        setCurrentChallengesSupportingQuotes(entry.supportingQuotes);
        setChallengesEditIndex(index);
    };

    const handleRemoveChallenges = (index) => {
        const updated = challengesEntries.filter((_, i) => i !== index);
        setChallengesEntries(updated);
        if (challengesEditIndex === index) {
            setCurrentChallenges("");
            setCurrentChallengesRanking("");
            setCurrentChallengesJustification("");
            setCurrentChallengesPerception("");
            setCurrentChallengesWhyItMatters("");
            setCurrentChallengesDeeperInsight("");
            setCurrentChallengesSupportingQuotes("");
            setChallengesEditIndex(null);
        } else if (challengesEditIndex > index) {
            setChallengesEditIndex(challengesEditIndex - 1);
        }
    };

    // Sales Insights handlers
    const handleAddSalesInsight = () => {
        // if (!currentSalesInsight || !currentSalesInsightRanking || !currentSalesInsightJustification) {
        //     ShowCustomToast("Please fill all Sales Insight fields before adding.", "error");
        //     return;
        // }

        const newEntry = {
            insight: currentSalesInsight,
            ranking: parseInt(currentSalesInsightRanking) || 0,
            justification: currentSalesInsightJustification,
            perception: currentSalesInsightPerception,
            whyItMatters: currentSalesInsightWhyItMatters,
            deeperInsight: currentSalesInsightDeeperInsight,
            supportingQuotes: currentSalesInsightSupportingQuotes
        };

        if (salesInsightsEditIndex !== null) {
            const updated = [...salesInsightsEntries];
            updated[salesInsightsEditIndex] = newEntry;
            setSalesInsightsEntries(updated);
            setSalesInsightsEditIndex(null);
        } else {
            setSalesInsightsEntries([...salesInsightsEntries, newEntry]);
        }

        setCurrentSalesInsight("");
        setCurrentSalesInsightRanking("");
        setCurrentSalesInsightJustification("");
        setCurrentSalesInsightPerception("");
        setCurrentSalesInsightWhyItMatters("");
        setCurrentSalesInsightDeeperInsight("");
        setCurrentSalesInsightSupportingQuotes("");
    };

    const handleEditSalesInsight = (index) => {
        const entry = salesInsightsEntries[index];
        setCurrentSalesInsight(entry.insight);
        setCurrentSalesInsightRanking(entry.ranking);
        setCurrentSalesInsightJustification(entry.justification);
        setCurrentSalesInsightPerception(entry.perception);
        setCurrentSalesInsightWhyItMatters(entry.whyItMatters);
        setCurrentSalesInsightDeeperInsight(entry.deeperInsight);
        setCurrentSalesInsightSupportingQuotes(entry.supportingQuotes);
        setSalesInsightsEditIndex(index);
    };

    const handleRemoveSalesInsight = (index) => {
        const updated = salesInsightsEntries.filter((_, i) => i !== index);
        setSalesInsightsEntries(updated);
        if (salesInsightsEditIndex === index) {
            setCurrentSalesInsight("");
            setCurrentSalesInsightRanking("");
            setCurrentSalesInsightJustification("");
            setCurrentSalesInsightPerception("");
            setCurrentSalesInsightWhyItMatters("");
            setCurrentSalesInsightDeeperInsight("");
            setCurrentSalesInsightSupportingQuotes("");
            setSalesInsightsEditIndex(null);
        } else if (salesInsightsEditIndex > index) {
            setSalesInsightsEditIndex(salesInsightsEditIndex - 1);
        }
    };

    // CaseStudyVideo handlers
    const handleAddCaseStudyVideo = () => {
        // Optional validation (uncomment if required)
        // if (!currentVideoTitle || !currentVideoLink) {
        //     ShowCustomToast("Please fill required fields before adding.", "error");
        //     return;
        // }

        const newEntry = {
            video_title: currentVideoTitle,
            video_link: currentVideoLink,
            copy_and_paste_text: currentCopyAndPasteText,
            link_to_document: currentLinkToDocument
        };

        if (caseStudyVideoEditIndex !== null) {
            const updated = [...caseStudyVideoEntries];
            updated[caseStudyVideoEditIndex] = newEntry;
            setCaseStudyVideoEntries(updated);
            setCaseStudyVideoEditIndex(null);
        } else {
            setCaseStudyVideoEntries([...caseStudyVideoEntries, newEntry]);
        }

        // Reset fields
        setCurrentVideoTitle("");
        setCurrentVideoLink("");
        setCurrentCopyAndPasteText("");
        setCurrentLinkToDocument("");
    };

    const handleEditCaseStudyVideo = (index) => {
        const entry = caseStudyVideoEntries[index];
        setCurrentVideoTitle(entry.video_title);
        setCurrentVideoLink(entry.video_link);
        setCurrentCopyAndPasteText(entry.copy_and_paste_text);
        setCurrentLinkToDocument(entry.link_to_document);
        setCaseStudyVideoEditIndex(index);
    };
    const handleRemoveCaseStudyVideo = (index) => {
        const updated = caseStudyVideoEntries.filter((_, i) => i !== index);
        setCaseStudyVideoEntries(updated);

        if (caseStudyVideoEditIndex === index) {
            setCurrentVideoTitle("");
            setCurrentVideoLink("");
            setCurrentCopyAndPasteText("");
            setCurrentLinkToDocument("");
            setCaseStudyVideoEditIndex(null);
        } else if (caseStudyVideoEditIndex > index) {
            setCaseStudyVideoEditIndex(caseStudyVideoEditIndex - 1);
        }
    };


    // Validation handlers 
    const handleAddValidation = () => {
        // if (!currentValidation || !currentValidationRanking || !currentValidationJustification) {
        //     ShowCustomToast("Please fill all validation fields before adding.", "error");
        //     return;
        // }

        const newEntry = {
            validation: currentValidation,
            ranking: parseInt(currentValidationRanking) || 0,
            justification: currentValidationJustification,
            perception: currentValidationPerception,
            whyItMatters: currentValidationWhyItMatters,
            deeperInsight: currentValidationDeeperInsight,
            supportingQuotes: currentValidationSupportingQuotes
        };

        if (validationEditIndex !== null) {
            const updated = [...validationEntries];
            updated[validationEditIndex] = newEntry;
            setValidationEntries(updated);
            setValidationEditIndex(null);
        } else {
            setValidationEntries([...validationEntries, newEntry]);
        }

        setCurrentValidation("");
        setCurrentValidationRanking("");
        setCurrentValidationJustification("");
        setCurrentValidationPerception("");
        setCurrentValidationWhyItMatters("");
        setCurrentValidationDeeperInsight("");
        setCurrentValidationSupportingQuotes("");
    };

    const handleEditValidation = (index) => {
        const entry = validationEntries[index];
        setCurrentValidation(entry.validation);
        setCurrentValidationRanking(entry.ranking);
        setCurrentValidationJustification(entry.justification);
        setCurrentValidationPerception(entry.perception);
        setCurrentValidationWhyItMatters(entry.whyItMatters);
        setCurrentValidationDeeperInsight(entry.deeperInsight);
        setCurrentValidationSupportingQuotes(entry.supportingQuotes);
        setValidationEditIndex(index);
    };

    const handleRemoveValidation = (index) => {
        const updated = validationEntries.filter((_, i) => i !== index);
        setValidationEntries(updated);
        if (validationEditIndex === index) {
            setCurrentValidation("");
            setCurrentValidationRanking("");
            setCurrentValidationJustification("");
            setCurrentValidationPerception("");
            setCurrentValidationWhyItMatters("");
            setCurrentValidationDeeperInsight("");
            setCurrentValidationSupportingQuotes("");
            setValidationEditIndex(null);
        } else if (validationEditIndex > index) {
            setValidationEditIndex(validationEditIndex - 1);
        }
    };

    const handleFormSubmit = async () => {
        // Convert all rankings to numbers in theme entries
        const validatedThemeEntries = themeEntries.map(entry => ({
            ...entry,
            ranking: Number(entry.ranking)
        }));

        const validatedObjectionEntries = objectionEntries.map(entry => ({
            ...entry,
            ranking: Number(entry.ranking)
        }));

        const validatedValidationEntries = validationEntries.map(entry => ({
            ...entry,
            ranking: Number(entry.ranking)
        }));
        const validatedChallengesEntries = challengesEntries.map(entry => ({
            ...entry,
            ranking: Number(entry.ranking)
        }));
        const validatedSalesInsightsEntries = salesInsightsEntries.map(entry => ({
            ...entry,
            ranking: Number(entry.ranking)
        }));

        setThemeEntries(validatedThemeEntries);
        setObjectionEntries(validatedObjectionEntries);
        setValidationEntries(validatedValidationEntries);
        setChallengesEntries(validatedChallengesEntries);
        setSalesInsightsEntries(validatedSalesInsightsEntries);

        // setTimeout(async () => {
        //     const errors = await formik.validateForm();
        //     if (Object.keys(errors).length > 0) {
        //         ShowCustomToast("Please fill all required fields.", 'info', 2000);
        //         return;
        //     }
        //     formik.handleSubmit();
        // }, 0);

    };

    console.log("Vhalllll", displayFields);
    return (
        <>
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50" onClick={onClose} />
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="shadow-lg p-4 border border-gray-300 rounded-lg w-[40%]" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                    <h2 className="text-[20px] font-bold mt-[2px] p-0 w-full">
                        {isEditMode ? updateRecord : createRecord}
                        <hr className="border-t border-gray-300 mb-6 mt-[10px] -mx-4" />
                    </h2>
                    <form onSubmit={formik.handleSubmit} className="border rounded-lg p-4 -mt-[10px]">
                        <div className="max-h-[60vh] overflow-y-auto pr-2">
                            {displayFields.map((field) => (
                                <div key={field.key} className="mb-4">
                                    {![
                                        'Themes',
                                        'Objections',
                                        'Validations',
                                        'Challenges',
                                        'Sales Insights',
                                        'Case_Study_Other_Video',
                                        'ranking',
                                        'Ranking Justification',
                                        'Challenge Report_Unedited Video Link',
                                        'Challenge Report_Unedited Transcript Link',
                                        'Challenge Report_Summary',
                                        'Podcast Report_Unedited Video Link',
                                        'Podcast Report_Unedited Transcript Link',
                                        'Podcast Report_Summary',
                                        'Post-Podcast Report_Unedited Video Link',
                                        'Post-Podcast Report_Unedited Transcript Link',
                                        'Post-Podcast Report_Summary',
                                        'Full Case Study_Interactive Link',
                                        'Full Case Study_Copy and Paste Text',
                                        'Full Case Study_Link To Document',
                                        'Problem Section_Video Link',
                                        'Problem Section_Copy and Paste Text',
                                        'Problem Section_Link To Document',
                                        'Solution Section_Video Link',
                                        'Solution Section_Copy and Paste Text',
                                        'Solution Section_Link To Document',
                                        'Results Section_Video Link',
                                        'Results Section_Copy and Paste Text',
                                        'Results Section_Link To Document',
                                        'Case Study Video Short_Video Link',
                                        'Case Study Video Short_Copy and Paste Text',
                                        'Case Study Video Short_Link To Document',
                                        'Case Study Other Video_Video Title',
                                        'Case Study Other Video_Video Link',
                                        'Case Study Other Video_Copy and Paste Text',
                                        'Case Study Other Video_Link To Document',
                                        "file_link"
                                    ].includes(field.key) ? (

                                        !(
                                            (field.key == "Mentioned_Quotes" && formik.values["Mentions"] !== "Yes") ||
                                            (field.key === "Case_Study_Transcript" && !formik.values["Case_Study"]) ||
                                            (
                                                field.key === "report_link" &&
                                                !(
                                                    Array.isArray(formik.values["Video Type"]) &&
                                                    formik.values["Video Type"].some(type =>
                                                        ["Challenge Video", "Post-Podcast Video"].includes(type)
                                                    )
                                                )
                                            )
                                        ) && (
                                            <>
                                                <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                    {field.label === "Video Type" ? "Content Type" : field.label}:
                                                    {(field.key == 'temp_name' || field.key == 'dept_name' || field.key == 'doc_title' || field.key == 'department_id' || field.key == 'template_id') && (
                                                        <span className="text-red-500 ml-1">*</span>
                                                    )}
                                                </label>

                                                {(field.key === 'file_type' || field.key === 'category') ? (
                                                    MULTISELECT_FIELDS.includes(field.key) ? (
                                                        <CustomSelect
                                                            key={`${field.key}-${JSON.stringify(formik.values[field.key])}`} // Force re-render
                                                            id={field.key}
                                                            options={OPTIONS[field.key] || []}
                                                            value={normalizeSelectOptions(formik.values[field.key], OPTIONS[field.key])}
                                                            isMulti={true}
                                                            onChange={(value) => formik.setFieldValue(field.key, value)}
                                                            placeholder={field.placeholder || `Select ${field.label}...`}
                                                            className="w-full mb-2"
                                                        />
                                                    ) : SINGLESELECT_FIELDS.includes(field.key) ? (
                                                        <CustomSelect
                                                            key={`${field.key}-${JSON.stringify(formik.values[field.key])}`}
                                                            id={field.key}
                                                            options={field.options || OPTIONS[field.key] || []}
                                                            value={normalizeSelectOptions(formik.values[field.key], OPTIONS[field.key])[0] || null}
                                                            isMulti={false}
                                                            onChange={(value) => formik.setFieldValue(field.key, value ? [value] : [])}
                                                            placeholder={field.placeholder || `Select ${field.label}...`}
                                                            className="w-full mb-2"
                                                        />
                                                    ) : null
                                                ) : (field.key == 'temp_name' || field.key == 'dept_name' || field.key == 'dept_name' || field.key == 'doc_title') ? (
                                                    <CustomInput
                                                        type={field.type || "text"}
                                                        name={field.key}
                                                        value={formik.values[field.key] || ""}
                                                        onChange={formik.handleChange}
                                                        required={true}
                                                        onBlur={formik.handleBlur}
                                                        className="w-full p-2 border rounded"
                                                        placeholder={field.placeholder || `Select ${field.label}...`}
                                                    />
                                                ) : (field.key === 'template_id' || field.key === 'department_id') ? (
                                                    SINGLESELECT_FIELDS.includes(field.key) ? (
                                                        <>
                                                            {console.log('Final Debug:', {
                                                                field: field.key,
                                                                options: field.options || OPTIONS[field.key],
                                                                formikValue: formik.values[field.key],
                                                                resolvedValue: (field.options || OPTIONS[field.key] || []).find(
                                                                    opt => opt.value == formik.values[field.key]?.value ||
                                                                        opt.value == formik.values[field.key]
                                                                ),
                                                                isMatch: (field.options || OPTIONS[field.key] || []).some(
                                                                    opt => opt.value == formik.values[field.key]?.value ||
                                                                        opt.value == formik.values[field.key]
                                                                )
                                                            })}
                                                            <CustomSelect
                                                                key={`${field.key}-${formik.values[field.key]?.value || 'empty'}`}
                                                                id={field.key}
                                                                options={field.options || OPTIONS[field.key] || []}

                                                                value={
                                                                    formik.values[field.key] ?
                                                                        // Try to find matching option by value
                                                                        (field.options || OPTIONS[field.key] || []).find(
                                                                            opt => opt.value == formik.values[field.key]?.value ||
                                                                                opt.value == formik.values[field.key]
                                                                        ) ||
                                                                        // Fallback to creating basic object if value exists
                                                                        (formik.values[field.key] !== null && formik.values[field.key] !== undefined ?
                                                                            { value: formik.values[field.key], label: String(formik.values[field.key]) }
                                                                            : null)
                                                                        : null
                                                                }
                                                                isMulti={false}
                                                                required={true}
                                                                onChange={(selectedOption) => {
                                                                    // Always store the complete option object
                                                                    formik.setFieldValue(field.key, selectedOption || null);
                                                                }}
                                                                placeholder={field.placeholder || `Select ${field.label}...`}
                                                                className="w-full mb-2"

                                                            />
                                                        </>

                                                    ) : null

                                                ) : MULTISELECT_FIELDS.includes(field.key) ? (
                                                    <CustomSelect
                                                        id={field.key}
                                                        options={OPTIONS[field.key] || []}
                                                        value={formik.values[field.key] || []}
                                                        isMulti={true}
                                                        onChange={(value) => formik.setFieldValue(field.key, value)}
                                                        placeholder={field.placeholder || `Select ${field.label}...`}
                                                        className="w-full mb-2"
                                                    />
                                                ) : SINGLESELECT_FIELDS.includes(field.key) ? (
                                                    <CustomSelect
                                                        id={field.key}
                                                        options={OPTIONS[field.key] || []}
                                                        value={formik.values[field.key] || ""}
                                                        isMulti={false}
                                                        onChange={(value) => formik.setFieldValue(field.key, value)}
                                                        placeholder={field.placeholder || `Select ${field.label}...`}
                                                        className="w-full mb-2"
                                                    />
                                                ) : field.type === "image" ? (
                                                    <>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(event) => {
                                                                const file = event.currentTarget.files[0];
                                                                formik.setFieldValue(field.key, file);
                                                            }}
                                                        />
                                                        {formik.values[field.key] && typeof formik.values[field.key] === "string" && (
                                                            <img src={formik.values[field.key]} alt="Uploaded Avatar" className="mt-2 h-16 rounded" />
                                                        )}
                                                    </>
                                                ) : field.type === "file" ? (
                                                    <div className="space-y-2">
                                                        {/* Upload file */}
                                                        <div>
                                                            {/* <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Upload File:
                                                            </label> */}
                                                            <CustomInput
                                                                type="file"
                                                                accept="*/*"
                                                                onChange={(event) => {
                                                                    const file = event.currentTarget.files[0];
                                                                    formik.setFieldValue(field.key, file);
                                                                    formik.setFieldValue(`${field.key}_link`, ""); // clear link if file selected
                                                                }}
                                                            />
                                                        </div>

                                                        {/* OR enter link */}
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Or Provide Google Doc / Link:
                                                            </label>
                                                            <CustomInput
                                                                type="url"
                                                                placeholder="https://docs.google.com/..."
                                                                value={formik.values[`${field.key}_link`] || ""}
                                                                onChange={(e) => {
                                                                    formik.setFieldValue(`${field.key}_link`, e.target.value);
                                                                    formik.setFieldValue(field.key, null); // clear file if link entered
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <CustomInput
                                                        type={field.type || "text"}
                                                        name={field.key}
                                                        value={formik.values[field.key] || ""}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        className="w-full p-2 border rounded"
                                                        placeholder={field.placeholder || `Select ${field.label}...`}
                                                    />
                                                )}

                                                {formik.errors[field.key] && (
                                                    <p className="text-red-500 text-sm">{formik.errors[field.key]}</p>
                                                )}

                                            </>
                                        )) : field.key === 'Themes' ? (
                                            <div>
                                                <label className="block font-semibold mb-2" style={{ color: appColors.textColor }}>
                                                    Themes:
                                                </label>

                                                <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div>
                                                            <CustomSelect
                                                                id="theme-select"
                                                                options={OPTIONS['Themes'] || []}
                                                                value={currentTheme}
                                                                isMulti={false}
                                                                onChange={(value) => setCurrentTheme(value)}
                                                                placeholder="Select a theme..."
                                                                className="w-full mb-2"
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <CustomInput
                                                                    type="number"
                                                                    min="1"
                                                                    max="10"
                                                                    label="Match Rating (1-10)"
                                                                    value={currentRanking}
                                                                    onChange={(e) => setCurrentRanking(e.target.value)}
                                                                    className="w-full p-2 border rounded"
                                                                    placeholder="1-10"
                                                                />
                                                            </div>

                                                            <div>
                                                                <CustomInput
                                                                    type="text"
                                                                    label="Rating Justification"
                                                                    value={currentJustification}
                                                                    onChange={(e) => setCurrentJustification(e.target.value)}
                                                                    className="w-full p-2 border rounded"
                                                                    placeholder="Enter justification"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Perception to Address"
                                                                value={currentPerception}
                                                                onChange={(e) => setCurrentPerception(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter perception to address"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Why It Matters"
                                                                value={currentWhyItMatters}
                                                                onChange={(e) => setCurrentWhyItMatters(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter why it matters"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Deeper Insight"
                                                                value={currentDeeperInsight}
                                                                onChange={(e) => setCurrentDeeperInsight(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter deeper insight"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Supporting Quotes"
                                                                value={currentSupportingQuotes}
                                                                onChange={(e) => setCurrentSupportingQuotes(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter supporting quotes"
                                                            />
                                                        </div>

                                                        <div className="flex justify-end">
                                                            <CustomButton
                                                                type="button"
                                                                onClick={handleAddTheme}
                                                                disabled={!currentTheme || !currentRanking || !currentJustification}
                                                                className="flex items-center gap-1"
                                                            >
                                                                <PlusIcon className="h-4 w-4" />
                                                                {editIndex !== null ? "Update Theme" : "Add Theme"}
                                                            </CustomButton>
                                                        </div>
                                                    </div>
                                                    {themeEntries.length > 0 && (
                                                        <div className="mt-2 max-h-[200px] overflow-y-auto">
                                                            <h4 className="font-medium text-sm mb-2">Added Themes:</h4>
                                                            {themeEntries.map((entry, index) => (
                                                                <ThemeEntry
                                                                    key={index}
                                                                    index={index}
                                                                    theme={entry.theme}
                                                                    ranking={entry.ranking}
                                                                    justification={entry.justification}
                                                                    perception={entry.perception}
                                                                    whyItMatters={entry.whyItMatters}
                                                                    deeperInsight={entry.deeperInsight}
                                                                    supportingQuotes={entry.supportingQuotes}
                                                                    onEdit={handleEditTheme}
                                                                    onRemove={handleRemoveTheme}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {formik.errors['Themes'] && formik.touched['Themes'] && (
                                                    <p className="text-red-500 text-sm mb-2">{formik.errors['Themes']}</p>
                                                )}
                                            </div>
                                        ) : field.key === 'Objections' ? (
                                            <div>
                                                <label className="block font-semibold mb-2" style={{ color: appColors.textColor }}>
                                                    Objections:
                                                </label>
                                                <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div>
                                                            <CustomSelect
                                                                id="objection-select"
                                                                options={OPTIONS['Objections'] || []}
                                                                value={currentObjection}
                                                                isMulti={false}
                                                                onChange={(value) => setCurrentObjection(value)}
                                                                placeholder="Select an objection..."
                                                                className="w-full mb-2"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <CustomInput
                                                                    type="number"
                                                                    min="1"
                                                                    max="10"
                                                                    label="Match Rating (1-10)"
                                                                    value={currentObjectionRanking}
                                                                    onChange={(e) => setCurrentObjectionRanking(e.target.value)}
                                                                    className="w-full p-2 border rounded"
                                                                    placeholder="1-10"
                                                                />
                                                            </div>
                                                            <div>
                                                                <CustomInput
                                                                    type="text"
                                                                    label="Rating Justification"
                                                                    value={currentObjectionJustification}
                                                                    onChange={(e) => setCurrentObjectionJustification(e.target.value)}
                                                                    className="w-full p-2 border rounded"
                                                                    placeholder="Enter justification"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Perception to Address"
                                                                value={currentObjectionPerception}
                                                                onChange={(e) => setCurrentObjectionPerception(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter perception to address"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Why It Matters"
                                                                value={currentObjectionWhyItMatters}
                                                                onChange={(e) => setCurrentObjectionWhyItMatters(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter why it matters"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Deeper Insight"
                                                                value={currentObjectionDeeperInsight}
                                                                onChange={(e) => setCurrentObjectionDeeperInsight(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter deeper insight"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Supporting Quotes"
                                                                value={currentObjectionSupportingQuotes}
                                                                onChange={(e) => setCurrentObjectionSupportingQuotes(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter supporting quotes"
                                                            />
                                                        </div>

                                                        <div className="flex justify-end">
                                                            <CustomButton
                                                                type="button"
                                                                onClick={handleAddObjection}
                                                                disabled={!currentObjection || !currentObjectionRanking || !currentObjectionJustification}
                                                                className="flex items-center gap-1"
                                                            >
                                                                <PlusIcon className="h-4 w-4" />
                                                                {objectionEditIndex !== null ? "Update Objection" : "Add Objection"}
                                                            </CustomButton>
                                                        </div>
                                                        {objectionEntries.length > 0 && (
                                                            <div className="mt-2 max-h-[200px] overflow-y-auto">
                                                                <h4 className="font-medium text-sm mb-2">Added Objections:</h4>
                                                                {objectionEntries.map((entry, index) => (
                                                                    <ObjectionEntry
                                                                        key={index}
                                                                        index={index}
                                                                        objection={entry.objection}
                                                                        ranking={entry.ranking}
                                                                        justification={entry.justification}
                                                                        perception={entry.perception}
                                                                        whyItMatters={entry.whyItMatters}
                                                                        deeperInsight={entry.deeperInsight}
                                                                        supportingQuotes={entry.supportingQuotes}
                                                                        onEdit={handleEditObjection}
                                                                        onRemove={handleRemoveObjection}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {formik.errors['Objections'] && formik.touched['Objections'] && (
                                                    <p className="text-red-500 text-sm mb-2">{formik.errors['Objections']}</p>
                                                )}
                                            </div>
                                        ) : field.key === 'Validations' ? (
                                            <div>
                                                <label className="block font-semibold mb-2" style={{ color: appColors.textColor }}>
                                                    Validations:
                                                </label>
                                                <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div>
                                                            <CustomSelect
                                                                id="validation-select"
                                                                options={OPTIONS['Validations'] || []}
                                                                value={currentValidation}
                                                                isMulti={false}
                                                                onChange={(value) => setCurrentValidation(value)}
                                                                placeholder="Select a validation..."
                                                                className="w-full mb-2"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <CustomInput
                                                                    type="number"
                                                                    min="1"
                                                                    max="10"
                                                                    label="Match Rating (1-10)"
                                                                    value={currentValidationRanking}
                                                                    onChange={(e) => setCurrentValidationRanking(e.target.value)}
                                                                    className="w-full p-2 border rounded"
                                                                    placeholder="1-10"
                                                                />
                                                            </div>

                                                            <div>
                                                                <CustomInput
                                                                    type="text"
                                                                    label="Rating Justification"
                                                                    value={currentValidationJustification}
                                                                    onChange={(e) => setCurrentValidationJustification(e.target.value)}
                                                                    className="w-full p-2 border rounded"
                                                                    placeholder="Enter justification"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Perception to Address"
                                                                value={currentValidationPerception}
                                                                onChange={(e) => setCurrentValidationPerception(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter perception to address"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Why It Matters"
                                                                value={currentValidationWhyItMatters}
                                                                onChange={(e) => setCurrentValidationWhyItMatters(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter why it matters"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Deeper Insight"
                                                                value={currentValidationDeeperInsight}
                                                                onChange={(e) => setCurrentValidationDeeperInsight(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter deeper insight"
                                                            />
                                                        </div>
                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Supporting Quotes"
                                                                value={currentValidationSupportingQuotes}
                                                                onChange={(e) => setCurrentValidationSupportingQuotes(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter supporting quotes"
                                                            />
                                                        </div>
                                                        <div className="flex justify-end">
                                                            <CustomButton
                                                                type="button"
                                                                onClick={handleAddValidation}
                                                                disabled={!currentValidation || !currentValidationRanking || !currentValidationJustification}
                                                                className="flex items-center gap-1"
                                                            >
                                                                <PlusIcon className="h-4 w-4" />
                                                                {validationEditIndex !== null ? "Update Validation" : "Add Validation"}
                                                            </CustomButton>
                                                        </div>
                                                        {validationEntries.length > 0 && (
                                                            <div className="mt-2 max-h-[200px] overflow-y-auto">
                                                                <h4 className="font-medium text-sm mb-2">Added Validations:</h4>
                                                                {validationEntries.map((entry, index) => (
                                                                    <ValidationEntry
                                                                        key={index}
                                                                        index={index}
                                                                        validation={entry.validation}
                                                                        ranking={entry.ranking}
                                                                        justification={entry.justification}
                                                                        perception={entry.perception}
                                                                        whyItMatters={entry.whyItMatters}
                                                                        deeperInsight={entry.deeperInsight}
                                                                        supportingQuotes={entry.supportingQuotes}
                                                                        onEdit={handleEditValidation}
                                                                        onRemove={handleRemoveValidation}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {formik.errors['Validations'] && formik.touched['Validations'] && (
                                                    <p className="text-red-500 text-sm mb-2">{formik.errors['Validations']}</p>
                                                )}
                                            </div>
                                        ) : field.key === 'Challenges' ? (
                                            <div>
                                                <label className="block font-semibold mb-2" style={{ color: appColors.textColor }}>
                                                    Challenges:
                                                </label>
                                                <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div>
                                                            <CustomSelect
                                                                id="challenges-select"
                                                                options={OPTIONS['Challenges'] || []}
                                                                value={currentChallenges}
                                                                isMulti={false}
                                                                onChange={(value) => setCurrentChallenges(value)}
                                                                placeholder="Select a challenge..."
                                                                className="w-full mb-2"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <CustomInput
                                                                    type="number"
                                                                    min="1"
                                                                    max="10"
                                                                    label="Match Rating (1-10)"
                                                                    value={currentChallengesRanking}
                                                                    onChange={(e) => setCurrentChallengesRanking(e.target.value)}
                                                                    className="w-full p-2 border rounded"
                                                                    placeholder="1-10"
                                                                />
                                                            </div>
                                                            <div>
                                                                <CustomInput
                                                                    type="text"
                                                                    label="Rating Justification"
                                                                    value={currentChallengesJustification}
                                                                    onChange={(e) => setCurrentChallengesJustification(e.target.value)}
                                                                    className="w-full p-2 border rounded"
                                                                    placeholder="Enter justification"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Perception to Address"
                                                                value={currentChallengesPerception}
                                                                onChange={(e) => setCurrentChallengesPerception(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter perception to address"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Why It Matters"
                                                                value={currentChallengesWhyItMatters}
                                                                onChange={(e) => setCurrentChallengesWhyItMatters(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter why it matters"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Deeper Insight"
                                                                value={currentChallengesDeeperInsight}
                                                                onChange={(e) => setCurrentChallengesDeeperInsight(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter deeper insight"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Supporting Quotes"
                                                                value={currentChallengesSupportingQuotes}
                                                                onChange={(e) => setCurrentChallengesSupportingQuotes(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter supporting quotes"
                                                            />
                                                        </div>

                                                        <div className="flex justify-end">
                                                            <CustomButton
                                                                type="button"
                                                                onClick={handleAddChallenges}
                                                                disabled={!currentChallenges || !currentChallengesRanking || !currentChallengesJustification}
                                                                className="flex items-center gap-1"
                                                            >
                                                                <PlusIcon className="h-4 w-4" />
                                                                {challengesEditIndex !== null ? "Update Challenge" : "Add Challenge"}
                                                            </CustomButton>
                                                        </div>
                                                        {challengesEntries.length > 0 && (
                                                            <div className="mt-2 max-h-[200px] overflow-y-auto">
                                                                <h4 className="font-medium text-sm mb-2">Added Challenges:</h4>
                                                                {challengesEntries.map((entry, index) => (
                                                                    <ChallengesEntry
                                                                        key={index}
                                                                        index={index}
                                                                        challenge={entry.challenges}
                                                                        ranking={entry.ranking}
                                                                        justification={entry.justification}
                                                                        perception={entry.perception}
                                                                        whyItMatters={entry.whyItMatters}
                                                                        deeperInsight={entry.deeperInsight}
                                                                        supportingQuotes={entry.supportingQuotes}
                                                                        onEdit={handleEditChallenges}
                                                                        onRemove={handleRemoveChallenges}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {formik.errors['Challenges'] && formik.touched['Challenges'] && (
                                                    <p className="text-red-500 text-sm mb-2">{formik.errors['Challenges']}</p>
                                                )}
                                            </div>
                                        ) : field.key === 'Sales Insights' ? (
                                            <div>
                                                <label className="block font-semibold mb-2" style={{ color: appColors.textColor }}>
                                                    Sales Insights:
                                                </label>
                                                <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div>
                                                            <CustomSelect
                                                                id="sales-insights-select"
                                                                options={OPTIONS['Sales Insights'] || []}
                                                                value={currentSalesInsight}
                                                                isMulti={false}
                                                                onChange={(value) => setCurrentSalesInsight(value)}
                                                                placeholder="Select a sales insight..."
                                                                className="w-full mb-2"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <CustomInput
                                                                    type="number"
                                                                    min="1"
                                                                    max="10"
                                                                    label="Match Rating (1-10)"
                                                                    value={currentSalesInsightRanking}
                                                                    onChange={(e) => setCurrentSalesInsightRanking(e.target.value)}
                                                                    className="w-full p-2 border rounded"
                                                                    placeholder="1-10"
                                                                />
                                                            </div>
                                                            <div>
                                                                <CustomInput
                                                                    type="text"
                                                                    label="Rating Justification"
                                                                    value={currentSalesInsightJustification}
                                                                    onChange={(e) => setCurrentSalesInsightJustification(e.target.value)}
                                                                    className="w-full p-2 border rounded"
                                                                    placeholder="Enter justification"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Perception to Address"
                                                                value={currentSalesInsightPerception}
                                                                onChange={(e) => setCurrentSalesInsightPerception(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter perception"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Why It Matters"
                                                                value={currentSalesInsightWhyItMatters}
                                                                onChange={(e) => setCurrentSalesInsightWhyItMatters(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter why it matters"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Deeper Insight"
                                                                value={currentSalesInsightDeeperInsight}
                                                                onChange={(e) => setCurrentSalesInsightDeeperInsight(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter deeper insight"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Supporting Quotes"
                                                                value={currentSalesInsightSupportingQuotes}
                                                                onChange={(e) => setCurrentSalesInsightSupportingQuotes(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter supporting quotes"
                                                            />
                                                        </div>

                                                        <div className="flex justify-end">
                                                            <CustomButton
                                                                type="button"
                                                                onClick={handleAddSalesInsight}
                                                                disabled={!currentSalesInsight || !currentSalesInsightRanking || !currentSalesInsightJustification}
                                                                className="flex items-center gap-1"
                                                            >
                                                                <PlusIcon className="h-4 w-4" />
                                                                {salesInsightsEditIndex !== null ? "Update Insight" : "Add Insight"}
                                                            </CustomButton>
                                                        </div>

                                                        {salesInsightsEntries.length > 0 && (
                                                            <div className="mt-2 max-h-[200px] overflow-y-auto">
                                                                <h4 className="font-medium text-sm mb-2">Added Sales Insights:</h4>
                                                                {salesInsightsEntries.map((entry, index) => (
                                                                    <SalesInsightsEntry // You may want to create a `SalesInsightEntry` component
                                                                        key={index}
                                                                        index={index}
                                                                        insight={entry.insight}
                                                                        ranking={entry.ranking}
                                                                        justification={entry.justification}
                                                                        perception={entry.perception}
                                                                        whyItMatters={entry.whyItMatters}
                                                                        deeperInsight={entry.deeperInsight}
                                                                        supportingQuotes={entry.supportingQuotes}
                                                                        onEdit={handleEditSalesInsight}
                                                                        onRemove={handleRemoveSalesInsight}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {formik.errors['Sales Insights'] && formik.touched['Sales Insights'] && (
                                                    <p className="text-red-500 text-sm mb-2">{formik.errors['Sales Insights']}</p>
                                                )}
                                            </div>

                                        ) : field.key == 'Case_Study_Other_Video' ? (
                                            <>
                                                <h3 className="text-lg font-semibold mb-2" style={{ color: appColors.textColor }}>Case Study Other Video:</h3>

                                                <div className="border rounded-lg p-4 mb-4" style={{ borderColor: appColors.borderColor }}>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>Video Title</label>
                                                            {/* Video Title */}
                                                            <CustomInput
                                                                type="text"
                                                                value={currentVideoTitle}
                                                                onChange={(e) => setCurrentVideoTitle(e.target.value)}
                                                                placeholder="Enter Video Title…"
                                                                className="w-full p-2 border rounded"

                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>Video Link</label>

                                                            {/* Video Link */}
                                                            <CustomInput
                                                                type="url"
                                                                value={currentVideoLink}
                                                                onChange={(e) => setCurrentVideoLink(e.target.value)}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Video Link"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>Copy & Paste Text</label>

                                                            {/* Copy-and-Paste Text */}
                                                            <CustomInput
                                                                as="textarea"
                                                                rows={3}
                                                                value={currentCopyAndPasteText}
                                                                onChange={(e) => setCurrentCopyAndPasteText(e.target.value)}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Copy & Paste Text"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>Link to Document</label>
                                                            {/* Link to Document */}
                                                            <CustomInput
                                                                type="text"
                                                                value={currentLinkToDocument}
                                                                onChange={(e) => setCurrentLinkToDocument(e.target.value)}
                                                                className="w-full p-2 border rounded font-semibold"
                                                                placeholder="Enter Link to Document"
                                                            />
                                                        </div>
                                                        {/* Add / Update button */}
                                                        <div className="flex justify-end">
                                                            <CustomButton
                                                                type="button"
                                                                onClick={handleAddCaseStudyVideo}
                                                                disabled={!currentVideoTitle || !currentVideoLink}
                                                                className="flex items-center gap-1"
                                                            >
                                                                <PlusIcon className="h-4 w-4" />
                                                                {caseStudyVideoEditIndex !== null ? 'Update Other Video' : 'Add Other Video'}
                                                            </CustomButton>
                                                        </div>

                                                        {/* List of added videos */}
                                                        {caseStudyVideoEntries.length > 0 && (
                                                            <div className="mt-2 max-h-[200px] overflow-y-auto">
                                                                <h4 className="font-medium text-sm mb-2">
                                                                    Added Case Study Other Videos:
                                                                </h4>

                                                                {caseStudyVideoEntries.map((entry, index) => (
                                                                    <CaseStudyVideoEntry          /* create a tiny component like SalesInsightsEntry */
                                                                        key={index}
                                                                        index={index}
                                                                        video_title={entry.video_title}
                                                                        video_link={entry.video_link}
                                                                        copy_and_paste_text={entry.copy_and_paste_text}
                                                                        link_to_document={entry.link_to_document}
                                                                        onEdit={handleEditCaseStudyVideo}
                                                                        onRemove={handleRemoveCaseStudyVideo}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {formik.errors['Case Study Other Video'] &&
                                                    formik.touched['Case Study Other Video'] && (
                                                        <p className="text-red-500 text-sm mb-2">
                                                            {formik.errors['Case Study Other Video']}
                                                        </p>
                                                    )}
                                            </>
                                        ) : field.key === "Full Case Study_Interactive Link" ? (
                                            <>
                                                <h3 className="text-lg font-semibold mb-2" style={{ color: appColors.textColor }}>Full Case Study:</h3>
                                                <div className="border rounded-lg p-4 mb-4" style={{ borderColor: appColors.borderColor }}>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Interactive Link:
                                                            </label>
                                                            <CustomInput
                                                                type="url"
                                                                name="Full Case Study_Interactive Link"
                                                                value={formik.values["Full Case Study_Interactive Link"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Interactive Link"
                                                            />
                                                            {formik.errors["Full Case Study_Interactive Link"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Full Case Study_Interactive Link"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Copy and Paste Text:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Full Case Study_Copy and Paste Text"
                                                                value={formik.values["Full Case Study_Copy and Paste Text"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Copy and Paste Text"
                                                            />
                                                            {formik.errors["Full Case Study_Copy and Paste Text"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Full Case Study_Copy and Paste Text"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Link To Document:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Full Case Study_Link To Document"
                                                                value={formik.values["Full Case Study_Link To Document"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Link To Document"
                                                            />
                                                            {formik.errors["Full Case Study_Link To Document"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Full Case Study_Link To Document"]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : field.key === "Problem Section_Video Link" ? (
                                            <>
                                                <h3 className="text-lg font-semibold mb-2" style={{ color: appColors.textColor }}>Problem Section:</h3>
                                                <div className="border rounded-lg p-4 mb-4" style={{ borderColor: appColors.borderColor }}>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Video Link:
                                                            </label>
                                                            <CustomInput
                                                                type="url"
                                                                name="Problem Section_Video Link"
                                                                value={formik.values["Problem Section_Video Link"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Video Link"
                                                            />
                                                            {formik.errors["Problem Section_Video Link"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Problem Section_Video Link"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Copy and Paste Text:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Problem Section_Copy and Paste Text"
                                                                value={formik.values["Problem Section_Copy and Paste Text"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Copy and Paste Text"
                                                            />
                                                            {formik.errors["Problem Section_Copy and Paste Text"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Problem Section_Copy and Paste Text"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Link To Document:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Problem Section_Link To Document"
                                                                value={formik.values["Problem Section_Link To Document"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Link To Document"
                                                            />
                                                            {formik.errors["Problem Section_Link To Document"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Problem Section_Link To Document"]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : field.key === "Solution Section_Video Link" ? (
                                            <>
                                                <h3 className="text-lg font-semibold mb-2" style={{ color: appColors.textColor }}>Solution Section:</h3>
                                                <div className="border rounded-lg p-4 mb-4" style={{ borderColor: appColors.borderColor }}>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Video Link:
                                                            </label>
                                                            <CustomInput
                                                                type="url"
                                                                name="Solution Section_Video Link"
                                                                value={formik.values["Solution Section_Video Link"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Video Link"
                                                            />
                                                            {formik.errors["Solution Section_Video Link"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Solution Section_Video Link"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Copy and Paste Text:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Solution Section_Copy and Paste Text"
                                                                value={formik.values["Solution Section_Copy and Paste Text"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Copy and Paste Text"
                                                            />
                                                            {formik.errors["Solution Section_Copy and Paste Text"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Solution Section_Copy and Paste Text"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Link To Document:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Solution Section_Link To Document"
                                                                value={formik.values["Solution Section_Link To Document"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Link To Document"
                                                            />
                                                            {formik.errors["Solution Section_Link To Document"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Solution Section_Link To Document"]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : field.key === "Results Section_Video Link" ? (
                                            <>
                                                <h3 className="text-lg font-semibold mb-2" style={{ color: appColors.textColor }}>Results Section:</h3>
                                                <div className="border rounded-lg p-4 mb-4" style={{ borderColor: appColors.borderColor }}>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Video Link:
                                                            </label>
                                                            <CustomInput
                                                                type="url"
                                                                name="Results Section_Video Link"
                                                                value={formik.values["Results Section_Video Link"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Video Link"
                                                            />
                                                            {formik.errors["Results Section_Video Link"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Results Section_Video Link"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Copy and Paste Text:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Results Section_Copy and Paste Text"
                                                                value={formik.values["Results Section_Copy and Paste Text"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Copy and Paste Text"
                                                            />
                                                            {formik.errors["Results Section_Copy and Paste Text"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Results Section_Copy and Paste Text"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Link To Document:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Results Section_Link To Document"
                                                                value={formik.values["Results Section_Link To Document"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Link To Document"
                                                            />
                                                            {formik.errors["Results Section_Link To Document"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Results Section_Link To Document"]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : field.key === "Case Study Video Short_Video Link" ? (
                                            <>
                                                <h3 className="text-lg font-semibold mb-2" style={{ color: appColors.textColor }}>Case Study Video Short:</h3>
                                                <div className="border rounded-lg p-4 mb-4" style={{ borderColor: appColors.borderColor }}>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Video Link:
                                                            </label>
                                                            <CustomInput
                                                                type="url"
                                                                name="Case Study Video Short_Video Link"
                                                                value={formik.values["Case Study Video Short_Video Link"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Video Link"
                                                            />
                                                            {formik.errors["Case Study Video Short_Video Link"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Case Study Video Short_Video Link"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Copy and Paste Text:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Case Study Video Short_Copy and Paste Text"
                                                                value={formik.values["Case Study Video Short_Copy and Paste Text"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Copy and Paste Text"
                                                            />
                                                            {formik.errors["Case Study Video Short_Copy and Paste Text"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Case Study Video Short_Copy and Paste Text"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Link To Document:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Case Study Video Short_Link To Document"
                                                                value={formik.values["Case Study Video Short_Link To Document"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Link To Document"
                                                            />
                                                            {formik.errors["Case Study Video Short_Link To Document"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Case Study Video Short_Link To Document"]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : field.key === "Challenge Report_Unedited Video Link" ? (
                                            <>
                                                <div className="border rounded-lg p-4 mb-4" style={{ borderColor: appColors.borderColor }}>

                                                    <div className="space-y-4">
                                                        {/* Challenge Report fields */}
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Challenge Video:
                                                            </label>
                                                            <CustomInput
                                                                type="url"
                                                                name="Challenge Report_Unedited Video Link"
                                                                value={formik.values["Challenge Report_Unedited Video Link"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Challenge Video Link"
                                                            />
                                                            {formik.errors["Challenge Report_Unedited Video Link"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Challenge Report_Unedited Video Link"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Challenge Transcript:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Challenge Report_Unedited Transcript Link"
                                                                value={formik.values["Challenge Report_Unedited Transcript Link"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Challenge Transcript"
                                                            />
                                                            {formik.errors["Challenge Report_Unedited Transcript Link"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Challenge Report_Unedited Transcript Link"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Challenge Report:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Challenge Report_Summary"
                                                                value={formik.values["Challenge Report_Summary"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Challenge Report"
                                                            />
                                                            {formik.errors["Challenge Report_Summary"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Challenge Report_Summary"]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>

                                        ) : field.key === "Podcast Report_Unedited Video Link" ? (
                                            <>
                                                <div className="border rounded-lg p-4 mb-4" style={{ borderColor: appColors.borderColor }}>
                                                    <div className="space-y-4">
                                                        {/* Podcast Report fields */}
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Podcast Video (Unedited):
                                                            </label>
                                                            <CustomInput
                                                                type="url"
                                                                name="Podcast Report_Unedited Video Link"
                                                                value={formik.values["Podcast Report_Unedited Video Link"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Podcast Video (Unedited) Link"
                                                            />
                                                            {formik.errors["Podcast Report_Unedited Video Link"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Podcast Report_Unedited Video Link"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Podcast Transcript:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Podcast Report_Unedited Transcript Link"
                                                                value={formik.values["Podcast Report_Unedited Transcript Link"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Podcast Transcript"
                                                            />
                                                            {formik.errors["Podcast Report_Unedited Transcript Link"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Podcast Report_Unedited Transcript Link"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Podcast Summary:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Podcast Report_Summary"
                                                                value={formik.values["Podcast Report_Summary"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Podcast Summary"
                                                            />
                                                            {formik.errors["Podcast Report_Summary"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Podcast Report_Summary"]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>

                                        ) : field.key === "Post-Podcast Report_Unedited Video Link" && (
                                            <>
                                                <div className="border rounded-lg p-4 mb-4" style={{ borderColor: appColors.borderColor }}>

                                                    <div className="space-y-4">
                                                        {/* Post-Podcast Report fields */}
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Post-Podcast Video:
                                                            </label>
                                                            <CustomInput
                                                                type="url"
                                                                name="Post-Podcast Report_Unedited Video Link"
                                                                value={formik.values["Post-Podcast Report_Unedited Video Link"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Post-Podcast Video Link"
                                                            />
                                                            {formik.errors["Post-Podcast Report_Unedited Video Link"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Post-Podcast Report_Unedited Video Link"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Post-Podcast Transcript:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Post-Podcast Report_Unedited Transcript Link"
                                                                value={formik.values["Post-Podcast Report_Unedited Transcript Link"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Post-Podcast Transcript"
                                                            />
                                                            {formik.errors["Post-Podcast Report_Unedited Transcript Link"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Post-Podcast Report_Unedited Transcript Link"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Post-Podcast Report:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Post-Podcast Report_Summary"
                                                                value={formik.values["Post-Podcast Report_Summary"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Post-Podcast Report"
                                                            />
                                                            {formik.errors["Post-Podcast Report_Summary"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Post-Podcast Report_Summary"]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                </div>
                            ))}
                        </div>
                        <hr className="border-t border-gray-300 mb-6 mt-[10px] -mx-4" />
                        <div className="flex justify-end space-x-3 mt-4">
                            <CustomButton
                                type="submit"
                                title={isEditMode ? "Update" : "Save"}
                                loading={formik.isSubmitting}
                                disabled={formik.isSubmitting}
                                onClick={handleFormSubmit}
                                className="mb-0 w-[100px] -mt-2"
                            />
                            <CustomButton
                                type="button"
                                title="Cancel"
                                onClick={onClose}
                                className="mb-0 w-[100px] -mt-2"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CustomCrudForm;