import { ShowCustomToast } from "@/app/customComponents/CustomToastify";
import axiosInstance from "../axiosMiddleware";

export const getAllContext = async (user_id, company_id, limit) => {
    try {
        const response = await axiosInstance.get('/get-contexts', {
            params: { user_id, company_id, limit },
        });
        console.log('Context:', response.data);
        return response.data;
    } catch (error) {
        ShowCustomToast(error.response?.data || error.message, 'error')
        return { documents: [] };
    }
};
export const sendChats = async (
    user_id,
    company_id,
    chat_id = 'msg123',
    doc_ids = [],
    prompt_id,
    message,
    message_id = 'msg123'
) => {
    try {
        const response = await axiosInstance.post('/chat', {
            user_id,
            company_id,
            chat_id,
            doc_ids,
            prompt_id,
            message,
            message_id,
        });
        return response.data;
    } catch (error) {
        ShowCustomToast(error.response?.data || error.message, 'error')
        return null;
    }
};
