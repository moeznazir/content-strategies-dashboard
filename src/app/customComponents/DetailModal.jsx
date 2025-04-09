import { FaTimes } from "react-icons/fa";
import CustomInput from "./CustomInput";
import { appColors } from "@/lib/theme";

const Modal = ({ data, onClose }) => {
    const filteredData = Object.entries(data).filter(
        ([key]) => key !== "Avatar" && key !== "id" && !key.includes("Rating (1-5 stars by the user)")
    );

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg w-1/3 max-h-[80vh] overflow-y-auto shadow-lg" style={{ backgroundColor: appColors.primaryColor }}>
                <div className="sticky top-0 py-2 flex justify-between items-center border rounded p-2 z-10">
                    <h2 className="text-lg font-bold">User Details</h2>
                    <button onClick={onClose} className="text-red-500">
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* User Avatar */}
                {data.Avatar && (
                    <div className="flex justify-center my-4">
                        <img
                            src={data.Avatar || "/default-avatar.png"}
                            alt="User Avatar"
                            className="w-28 h-28 rounded-full object-cover border-4 border-orange-500"
                        />
                    </div>
                )}

                {/* User Details */}
                <div className="space-y-4">
                    {filteredData?.map(([key, value]) => (
                        <div key={key}>
                            <label className="block text-sm font-semibold text-gray-600">
                                {key === "Text comments for the rating (OPTIONAL input from the user)" ? "First Rating Comment" : key}
                            </label>
                            <CustomInput
                                type="text"
                                value={value || "-"}
                                readOnly
                                className="w-full border border-gray-300 p-2 rounded-md"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Modal;
