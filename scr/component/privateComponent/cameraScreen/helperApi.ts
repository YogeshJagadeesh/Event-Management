import axios from "axios";
import { baseUrl, videoCaptureUrl } from "../../../../assets/environment/apiManage";

export const fetchVideoProcess = (formData: any, tokenId: any, onProgress: (percentage: number) => void) => {
    return axios.post(
        baseUrl+videoCaptureUrl.videoProcess,
        formData,
        {
            headers: {
                Authorization: `Bearer ${tokenId}`,
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                const totalLength = progressEvent.total;
                if (totalLength) {
                    const progress = Math.round((progressEvent.loaded * 100) / totalLength);
                    onProgress(progress);
                }
            }
        }
    )
}