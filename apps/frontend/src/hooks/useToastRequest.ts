// src/hooks/useToastRequest.ts
import { toast } from "react-toastify";

type RequestCallback<T> = () => Promise<T>;

interface UseToastRequestOptions {
    successMessage?: string;
    errorMessage?: string;
    showSuccess?: boolean;
    showError?: boolean;
}

export const useToastRequest = () => {
    const handleRequest = async <T>(
        callback: RequestCallback<T>,
        options?: UseToastRequestOptions
    ): Promise<T | null> => {
        const {
            successMessage = "✅ Успешно",
            errorMessage = "❌ Ошибка запроса",
            showSuccess = true,
            showError = true,
        } = options || {};

        try {
            const result = await callback();
            if (showSuccess) toast.success(successMessage);
            return result;
        } catch (error: any) {
            const message =
                error?.response?.data?.message || error?.message || errorMessage;
            if (showError) toast.error(message);
            return null;
        }
    };

    return { handleRequest };
};
