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
    "Validations": [
        { value: "Cross-Department Integration", label: "Cross-Department Integration" },
        { value: "Impact on Revenue & Growth", label: "Impact on Revenue & Growth" },
        { value: "Insights influencing Company Growth", label: "Insights Influencing Company Growth" },
        { value: "Agent Turnover Impact", label: "Agent Turnover Impact" },
        { value: "BPO Success Strategies", label: "BPO Success Strategies" },
        { value: "Contact Centers as Growth Drivers", label: "Contact Centers as Growth Drivers" },
        { value: "Role as Consultant/Partner", label: "Role as Consultant/Partner" },
        { value: "Importance of the Agent", label: "Importance of the Agent" },
        { value: "The Importance of Culture", label: "The Importance of Culture" },
        { value: "Agent Quality Trends", label: "Agent Quality Trends" },
        { value: "Are Agents Here To Stay?", label: "Are Agents Here To Stay?" },

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
        { "value": "Agent Trends & Impact", "label": "Agent Trends & Impact" },
        { "value": "BPO Services", "label": "BPO Services" },
        { "value": "Cost Center vs. Value Centers", "label": "Cost Center vs. Value Centers" },
        { "value": "Culture/Career Progression", "label": "Culture/Career Progression" },
        { "value": "Impact: Contact Center Insights", "label": "Impact: Contact Center Insights" },
        { "value": "Importance of the Agent", "label": "Importance of the Agent" },
        { "value": "Insights & Strategy Contributions", "label": "Insights & Strategy Contributions" },
        { "value": "KPI Trends", "label": "KPI Trends" },
        { "value": "Revenue & Growth", "label": "Revenue & Growth" },
        { "value": "The Role of AI", "label": "The Role of AI" },
        { "value": "Trigger: Expanding Markets", "label": "Trigger: Expanding Markets" },
        { "value": "The Role of Data", "label": "The Role of Data" },
        { "value": "CX as the New Competitive Advantage", "label": "CX as the New Competitive Advantage" },
        { "value": "Contact Center’s Role in Driving Revenue & Growth", "label": "Contact Center’s Role in Driving Revenue & Growth" },
        { "value": "Customer Experience (CX) as a Competitive Advantage", "label": "Customer Experience (CX) as a Competitive Advantage" },
        { "value": "Cost Center vs. Value Center Perceptions", "label": "Cost Center vs. Value Center Perceptions" }
    ],
    "Objections": [
        { "value": "Maintaining Quality", "label": "Maintaining Quality" },
        { "value": "BPO Value Perceptions", "label": "BPO Value Perceptions" },
        { "value": "Mitigating Risk", "label": "Mitigating Risk" }
    ]

};


// Updated ThemeEntry component to properly display theme data
const ThemeEntry = ({ theme, ranking, justification, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="flex justify-between  items-start">
                <div className="flex-1">
                    <p><span className="font-medium">Theme:</span> <span className='text-gray-400  text-sm'>{theme || "No theme selected"}</span></p>
                    <p><span className="font-medium">Ranking:</span> <span className='text-gray-400 text-sm'>{ranking || "N/A"}</span></p>
                    <p><span className="font-medium">Ranking Justification:</span> <span className='text-gray-400 text-sm'>{justification || "No justification Avilable"}</span></p>
                </div>
                <div className="flex  space-x-1">
                    <div
                        type="button"
                        onClick={() => onEdit(index)}
                        className="text-blue-500 hover:text-blue-700"
                    >
                        <PencilIcon className="h-5 w-5" />
                    </div>
                    <div
                        type="button"
                        onClick={() => onRemove(index)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const CustomCrudForm = ({ onClose, onSubmit, entityData, isEditMode = false, displayFields, currentPage, itemsPerPage, setUsers, setCurrentPage, setTotalRecords, fetchUsers, themesRank }) => {
    const [loading, setLoading] = useState(false);
    const [currentTheme, setCurrentTheme] = useState("");
    const [currentRanking, setCurrentRanking] = useState("");
    const [currentJustification, setCurrentJustification] = useState("");
    const [themeEntries, setThemeEntries] = useState([]);
    const [editIndex, setEditIndex] = useState(null);

    function normalizeThemes(data) {
        if (!Array.isArray(data)) return [];
        return data.map(entry => {
            if (typeof entry === "string") {
                return { theme: entry, ranking: "", justification: "" };
            }
            return entry; // already in correct format
        });
    }

    useEffect(() => {
        if (entityData?.id) {
            const themeData = themesRank.find(item => item.id === entityData.id)?.Themes;
            if (themeData) {
                try {
                    const parsed = Array.isArray(themeData) ? themeData : JSON.parse(themeData);
                    setThemeEntries(parsed.map(theme => ({
                        theme: theme.theme || theme,
                        ranking: theme.ranking || 0,
                        justification: theme.justification || ''
                    })));
                } catch (e) {
                    console.log("Error parsing themes:", e);
                    setThemeEntries([]);
                }
            } else {
                setThemeEntries([]);
            }
        } else {
            setThemeEntries([]);
        }
    }, [entityData, themesRank]);

    const validationSchema = Yup.object(
        displayFields.reduce((schema, field) => {
            if (field.key === "Themes") {
                schema["Themes"] = Yup.array().of(
                    Yup.object().shape({
                        theme: Yup.string().required("Theme is required"),
                        ranking: Yup.number()
                            .min(1, "Ranking must be at least 1")
                            .max(10, "Ranking must be at most 10")
                            .required("Ranking is required"),
                        justification: Yup.string().required("Justification is required"),
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
        if (field.key === "Themes") {
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
                        justification: String(entry.justification || "")
                    }));
                }
                const companyId = localStorage.getItem('company_id');
                console.log("companyId", companyId);
                // Create the payload with properly formatted values
                const formattedValues = {
                    ...values,
                    Themes: themeEntries.length > 0 ? themeEntries : null,
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

    const handleAddTheme = () => {
        if (!currentTheme || !currentRanking || !currentJustification) {
            ShowCustomToast("Please fill all theme fields before adding.", "error");
            return;
        }

        const newEntry = {
            theme: currentTheme,
            ranking: parseInt(currentRanking) || 0,
            justification: currentJustification
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
    };

    const handleEditTheme = (index) => {
        const entry = themeEntries[index];
        setCurrentTheme(entry.theme);
        setCurrentRanking(entry.ranking);
        setCurrentJustification(entry.justification);
        setEditIndex(index);
    };

    const handleRemoveTheme = (index) => {
        const updated = themeEntries.filter((_, i) => i !== index);
        setThemeEntries(updated);
        if (editIndex === index) {
            setCurrentTheme("");
            setCurrentRanking("");
            setCurrentJustification("");
            setEditIndex(null);
        } else if (editIndex > index) {
            setEditIndex(editIndex - 1);
        }
    };

    const handleFormSubmit = async () => {
        // Convert all rankings to numbers in theme entries
        const validatedThemeEntries = themeEntries.map(entry => ({
            ...entry,
            ranking: Number(entry.ranking)
        }));

        setThemeEntries(validatedThemeEntries);

        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
            ShowCustomToast("Please fill all required fields.", 'info', 2000);
            return;
        }
        formik.handleSubmit();
    };
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
                                    {!['Themes', 'ranking', 'Ranking Justification'].includes(field.key) ? (
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
                                    ) : field.key === 'Themes' && (
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
                                                                onEdit={handleEditTheme}
                                                                onRemove={handleRemoveTheme}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>


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