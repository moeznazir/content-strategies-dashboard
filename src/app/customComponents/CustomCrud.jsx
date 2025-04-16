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

const supabase = createClient(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


const MULTISELECT_FIELDS = [
    "Guest Industry",
    "Video Type",
    "Tags",
    "Validations",
    "Themes/Triggers",
    "Objections"
];

const SINGLESELECT_FIELDS = [
    "Mentions",
    "Client",
    "Employee",
    "Public_vs_Private"
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
    "Themes/Triggers": [
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


const CustomCrudForm = ({ onClose, onSubmit, entityData, isEditMode = false, displayFields, currentPage, itemsPerPage, setUsers, setCurrentPage, setTotalRecords, fetchUsers }) => {
    const [loading, setLoading] = useState(false);

    // Define validation schema
    const validationSchema = Yup.object(
        displayFields.reduce((schema, field) => {
            if (MULTISELECT_FIELDS.includes(field.key)) {
                schema[field.key] = Yup.array().of(Yup.string())
                    .min(1, `${field.label} is required`);
            } else if (SINGLESELECT_FIELDS.includes(field.key)) {
                schema[field.key] = Yup.string().required(`${field.label} is required`);
            } else if (field.type === "number") {
                schema[field.key] = Yup.number().required(`${field.label} is required`).positive(`${field.label} must be positive`);
            } else if (field.type === "url") {
                schema[field.key] = Yup.string().url(`${field.label} must be a valid URL`);
            } else if (field.type === "rating") {
                schema[field.key] = Yup.number().min(1, `${field.label} must be at least 1`).max(10, `${field.label} must be at most 10`).required(`${field.label} is required`);

            } else {
                schema[field.key] = Yup.string().required(`${field.label} is required`);
            }
            return schema;
        }, {})
    );
    // console.log("Entity ID:", entityData.id);
    // console.log("isEditMode:", isEditMode);
    // Formik setup
    useEffect(() => {
        console.log("Entity Data:", entityData);
        console.log("Initial Form Values:", formik.initialValues);
    }, [entityData]);
    const formik = useFormik({
        initialValues: displayFields.reduce((values, field) => {
            let fieldValue = entityData?.[field.key];

            if (MULTISELECT_FIELDS.includes(field.key)) {
                fieldValue = fieldValue ? (fieldValue) : [];
            } else {
                fieldValue = fieldValue || "";
            }

            return { ...values, [field.key]: fieldValue };
        }, {}),

        validationSchema,

        onSubmit: async (values) => {


            try {
                console.log("valuesss", values);
                const formattedValues = { ...values };
                MULTISELECT_FIELDS.forEach((field) => {
                    formattedValues[field] = (values[field] || []);
                });


                for (const field of displayFields) {
                    if (field.type === "image" && values[field.key] instanceof File) {
                        const file = values[field.key];
                        const fileExt = file.name.split(".").pop();
                        const fileName = `${Date.now()}.${fileExt}`;
                        const filePath = `${fileName}`;

                        // Upload to Supabase Storage
                        const { error: uploadError } = await supabase
                            .storage
                            .from("images")
                            .upload(filePath, file, {
                                cacheControl: "3600",
                                upsert: true,
                            });

                        // if (uploadError) {
                        //     console.error("Error uploading file:", uploadError);
                        //     throw uploadError;
                        // }

                        // Get the public URL
                        const { data: publicUrlData } = supabase
                            .storage
                            .from("images")
                            .getPublicUrl(filePath);

                        const publicUrl = publicUrlData.publicUrl;

                        console.log("File uploaded successfully:", publicUrl);

                        // Save the image URL into the form values
                        formattedValues[field.key] = publicUrl;
                    }
                }



                let response;
                if (isEditMode) {
                    response = await supabase
                        .from("users_record")
                        .update(formattedValues)
                        .eq("id", entityData.id);

                    Alert.show('Success', 'Record updated successfully.', [
                        {
                            text: 'OK',
                            primary: true,
                            onPress: () => {
                                console.log('Record deleted and user clicked OK.');
                            },
                        },
                    ]);
                    fetchUsers();
                } else {
                    response = await supabase.from("users_record").insert([formattedValues]);
                    Alert.show('Success', 'Record created successfully.', [
                        {
                            text: 'OK',
                            primary: true,
                            onPress: () => {
                                console.log('Record deleted and user clicked OK.');
                            },
                        },
                    ]);

                }

                if (response.error) throw response.error;

                const { count, error: countError } = await supabase
                    .from("users_record")
                    .select("*", { count: "exact", head: true })
                    .order('id_order', { ascending: false });

                if (countError) throw countError;
                setTotalRecords(count || 0);
                if ((currentPage - 1) * itemsPerPage >= count) {
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                }

                const { data, error } = await supabase
                    .from("users_record")
                    .select("*")
                    .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)
                    .order('id_order', { ascending: false });

                if (error) {
                    throw error;
                }

                setUsers(data);
                onSubmit(values);
                onClose();
                fetchUsers();
            } catch (error) {
                console.error("Error saving data:", error);
            }
        },


    });
    const handleFormSubmit = async () => {
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
            <div className="fixed inset-0 flex items-center justify-center z-50 ">
                <div className="shadow-lg p-4 border border-gray-300 rounded-lg w-[40%]" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                    <h2 className="text-[20px] font-bold mt-[2px] p-0 w-full">
                        {isEditMode ? "Edit Record" : "Create Record"}
                        <hr className="border-t border-gray-300 mb-6 mt-[10px] -mx-4" />
                    </h2>
                    <form onSubmit={formik.handleSubmit} className="border rounded-lg p-4 -mt-[10px]">
                        <div className="max-h-[60vh] overflow-y-auto pr-2">
                            {displayFields.map((field) => (
                                <div key={field.key} className="mb-4">
                                    <label className="block font-semibold" style={{ color: appColors.textColor }}>{field.label}:</label >

                                    {MULTISELECT_FIELDS.includes(field.key) ? (
                                        <CustomSelect
                                            id={field.key}
                                            options={OPTIONS[field.key] || []}
                                            value={formik.values[field.key]}
                                            isMulti={true}
                                            onChange={(value) => formik.setFieldValue(field.key, value)}
                                            placeholder={field.placeholder || `Select ${field.label}...`}
                                            className="w-full mb-2"
                                        />
                                    ) : SINGLESELECT_FIELDS.includes(field.key) ? (
                                        <CustomSelect
                                            id={field.key}
                                            options={OPTIONS[field.key] || []}
                                            value={formik.values[field.key]}
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
                                                    formik.setFieldValue(field.key, file); // Temporarily store file in formik
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
                                            value={formik.values[field.key]}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className="w-full p-2 border rounded"
                                            placeholder={field.placeholder || `Select ${field.label}...`}
                                        />
                                    )}

                                    {formik.errors[field.key] && <p className="text-red-500 text-sm">{formik.errors[field.key]}</p>}
                                </div>
                            ))}


                        </div>
                        <hr className="border-t border-gray-300 mb-6 mt-[10px] -mx-4" />
                        <div className="flex justify-end space-x-3 mt-4">
                            <CustomButton
                                type={"submit"}
                                title={isEditMode ? "Update" : "Save"}
                                loading={formik.isSubmitting}
                                disabled={formik.isSubmitting}
                                onClick={handleFormSubmit}
                                className="mb-0 w-[100px] -mt-2"
                            />
                            <CustomButton
                                type="text"
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
