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
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";

const supabase = createClient(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


const MULTISELECT_FIELDS = [
    "Guest Industry",
    "Video Type",
    "Tags",
    "Validations",
    "Objections",
    "Challenges",
    "Themes",
];

const SINGLESELECT_FIELDS = [
    "Mentions",
    "Client",
    "Employee",
    "Public_vs_Private",

];

const OPTIONS = {
    "Guest Industry": [
        { value: "Ecommerce", label: "Ecommerce" },
        { value: "Technology", label: "Technology" },
        { value: "Healthcare", label: "Healthcare" },
        { value: "Finance", label: "Finance" },
    ],
    "Video Type": [
        { value: "Summary Video", label: "Summary Video" },
        { value: "Full Episode", label: "Full Episode" },
        { value: "Case Study", label: "Case Study" },
        { value: "ICP Advice", label: "ICP Advice" },
        { value: "Post-Podcast", label: "Post-Podcast" },
        { value: "Guest Introduction", label: "Guest Introduction" },
        { value: "Sales Insights", label: "Sales Insights" },
        { value: "Challenge Questions", label: "Challenge Questions" },
    ],
    "Tags": [
        { value: "Agent Empowerment", label: "Agent Empowerment" },
        { value: "Agent Satisfaction", label: "Agent Satisfaction" },
        { value: "Customer Loyalty", label: "Customer Loyalty" },
        { value: "Data & Analytics", label: "Data & Analytics" },
        { value: "AI", label: "AI" },
    ],
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

};


// Updated ThemeEntry component to properly display theme data
const ThemeEntry = ({ theme, ranking, justification, perception, whyItMatters, deeperInsight, supportingQuotes, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p><span className="font-medium">Theme:</span> <span className='text-gray-400 text-sm'>{theme || "No theme selected"}</span></p>
                    <p><span className="font-medium">Ranking:</span> <span className='text-gray-400 text-sm'>{ranking || "N/A"}</span></p>
                    <p><span className="font-medium">Ranking Justification:</span> <span className='text-gray-400 text-sm'>{justification || "No justification available"}</span></p>
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
                    <p><span className="font-medium">Ranking:</span> <span className='text-gray-400 text-sm'>{ranking || "N/A"}</span></p>
                    <p><span className="font-medium">Justification:</span> <span className='text-gray-400 text-sm'>{justification || "No justification available"}</span></p>
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
                    <p><span className="font-medium">Ranking:</span> <span className='text-gray-400 text-sm'>{ranking || "N/A"}</span></p>
                    <p><span className="font-medium">Justification:</span> <span className='text-gray-400 text-sm'>{justification || "No justification available"}</span></p>
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

const ValidationEntry = ({ validation, ranking, justification, perception, whyItMatters, deeperInsight, supportingQuotes, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p><span className="font-medium">Validation:</span> <span className='text-gray-400 text-sm'>{validation || "No validation selected"}</span></p>
                    <p><span className="font-medium">Ranking:</span> <span className='text-gray-400 text-sm'>{ranking || "N/A"}</span></p>
                    <p><span className="font-medium">Justification:</span> <span className='text-gray-400 text-sm'>{justification || "No justification available"}</span></p>
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
const CustomCrudForm = ({ onClose, onSubmit, entityData, isEditMode = false, displayFields, currentPage, itemsPerPage, setUsers, setCurrentPage, setTotalRecords, fetchUsers, themesRank }) => {
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

    useEffect(() => {
        if (entityData?.id) {
            const matchedData = themesRank.find(item => item.id === entityData.id);

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
        } else {
            // Clear on new entry
            setThemeEntries([]);
            setValidationEntries([]);
            setObjectionEntries([]);
            setChallengesEntries([]);
        }
    }, [entityData, themesRank]);


    const validationSchema = Yup.object(
        displayFields.reduce((schema, field) => {
            if (field.key === "Themes" || field.key === "Objections" || field.key === "Validations" || field.key == "Challenges") {
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
            } else if (!["ranking", "Ranking Justification"].includes(field.key)) {
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

    // Initialize form values properly
    const initialValues = {};
    displayFields.forEach(field => {
        if (field.key === "Themes" || field.key === "Objections" || field.key === "Validations" || field.key === "Challenges") {
            initialValues[field.key] = normalizeThemes(entityData?.[field.key] || []);
        } else if (!["ranking", "Ranking Justification"].includes(field.key)) {
            initialValues[field.key] = entityData?.[field.key] ||
                (MULTISELECT_FIELDS.includes(field.key) ? [] :
                    SINGLESELECT_FIELDS.includes(field.key) ? "" :
                        field.type === "number" ? 0 :
                            field.type === "image" ? "" :
                                "");
        }
    });


    const formik = useFormik({
        initialValues,
        validationSchema,
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


                // Create the payload with properly formatted values
                const formattedValues = {
                    ...values,
                    Themes: themeEntries.length > 0 ? themeEntries : null,
                    Objections: objectionEntries.length > 0 ? objectionEntries : null,
                    Validations: validationEntries.length > 0 ? validationEntries : null,
                    Challenges: challengesEntries.length > 0 ? challengesEntries : null,
                    company_id: localStorage.getItem('company_id')
                };

                console.log("forrr", formattedValues);

                // Handle file uploads if any
                for (const field of displayFields) {
                    if (field.type === "image" && values[field.key] instanceof File) {
                        const file = values[field.key];
                        const fileExt = file.name.split(".").pop();
                        const fileName = `${Date.now()}.${fileExt}`;
                        const filePath = `${fileName}`;

                        const { error: uploadError } = await supabase
                            .storage
                            .from("images")
                            .upload(filePath, file, {
                                cacheControl: "3600",
                                upsert: true,
                            });

                        if (uploadError) throw uploadError;

                        const { data: publicUrlData } = supabase
                            .storage
                            .from("images")
                            .getPublicUrl(filePath);

                        formattedValues[field.key] = publicUrlData.publicUrl;
                    }
                }

                let response;
                if (isEditMode) {
                    response = await supabase
                        .from("content_details")
                        .update(formattedValues)
                        .eq("id", entityData.id);
                } else {
                    response = await supabase
                        .from("content_details")
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
                    .from("content_details")
                    .select("*", { count: "exact", head: true })
                    .order('id_order', { ascending: false });

                if (countError) throw countError;
                setTotalRecords(count || 0);

                if ((currentPage - 1) * itemsPerPage >= count) {
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                }

                const { data, error } = await supabase
                    .from("content_details")
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
        if (!currentTheme || !currentRanking || !currentJustification) {
            ShowCustomToast("Please fill all theme fields before adding.", "error");
            return;
        }

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
        if (!currentObjection || !currentObjectionRanking || !currentObjectionJustification) {
            ShowCustomToast("Please fill all objection fields before adding.", "error");
            return;
        }

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
        if (!currentChallenges || !currentChallengesRanking || !currentChallengesJustification) {
            ShowCustomToast("Please fill all challenge fields before adding.", "error");
            return;
        }

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
    // Validation handlers 
    const handleAddValidation = () => {
        if (!currentValidation || !currentValidationRanking || !currentValidationJustification) {
            ShowCustomToast("Please fill all validation fields before adding.", "error");
            return;
        }

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

        setThemeEntries(validatedThemeEntries);
        setObjectionEntries(validatedObjectionEntries);
        setValidationEntries(validatedValidationEntries);
        setChallengesEntries(validatedChallengesEntries);


        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
            ShowCustomToast("Please fill all required fields.", 'info', 2000);
            return;
        }
        formik.handleSubmit();
    };

    console.log("Vhalllll", displayFields);
    return (
        <>
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50" onClick={onClose} />
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="shadow-lg p-4 border border-gray-300 rounded-lg w-[40%]" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                    <h2 className="text-[20px] font-bold mt-[2px] p-0 w-full">
                        {isEditMode ? "Edit Record" : "Create Record"}
                        <hr className="border-t border-gray-300 mb-6 mt-[10px] -mx-4" />
                    </h2>
                    <form onSubmit={formik.handleSubmit} className="border rounded-lg p-4 -mt-[10px]">
                        <div className="max-h-[60vh] overflow-y-auto pr-2">
                            {displayFields.map((field) => (
                                <div key={field.key} className="mb-4">
                                    {!['Themes', 'Objections', 'Validations', 'Challenges', 'ranking', 'Ranking Justification'].includes(field.key) ? (
                                        <>
                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                {field.label}:
                                            </label>

                                            {MULTISELECT_FIELDS.includes(field.key) ? (
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
                                    ) : field.key === 'Themes' ? (
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
                                                                label="Ranking (1-10)"
                                                                value={currentRanking}
                                                                onChange={(e) => setCurrentRanking(e.target.value)}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="1-10"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Justification"
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
                                                                label="Ranking (1-10)"
                                                                value={currentObjectionRanking}
                                                                onChange={(e) => setCurrentObjectionRanking(e.target.value)}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="1-10"
                                                            />
                                                        </div>
                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Justification"
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
                                                                label="Ranking (1-10)"
                                                                value={currentValidationRanking}
                                                                onChange={(e) => setCurrentValidationRanking(e.target.value)}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="1-10"
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
                                                    </div>
                                                    <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Justification"
                                                                value={currentValidationJustification}
                                                                onChange={(e) => setCurrentValidationJustification(e.target.value)}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter justification"
                                                            />
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
                                    ) : field.key === 'Challenges' && (
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
                                                                label="Ranking (1-10)"
                                                                value={currentChallengesRanking}
                                                                onChange={(e) => setCurrentChallengesRanking(e.target.value)}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="1-10"
                                                            />
                                                        </div>
                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Justification"
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