import axios from "axios";
import { baseUrl, EventsUrl } from "../../../../assets/environment/apiManage";

export const fetchCreateEvent = (createData: any, tokenId: any) => {
    return axios.post(baseUrl+EventsUrl.createEvents,
        createData, {
        headers: { Authorization: `Bearer ${tokenId}` }
    });
}

export const fetchEventAssets = (tokenId: any) => {
    return axios.get(baseUrl+EventsUrl.eventAssets, {
        headers: { Authorization: `Bearer ${tokenId}` }
    });
}

export const fetchLogoUpload = (formData: any, tokenId: any) => {
    return axios.post(
        baseUrl+EventsUrl.logoUploads,
        formData,
        {
            headers: {
                Authorization: `Bearer ${tokenId}`, // Ensure `tokenId` is correctly set
                'Content-Type': 'multipart/form-data'
            }
        }
    );
}

export const fetchAudioUpload = (formData: any, tokenId: any) => {
    return axios.post(
        baseUrl+EventsUrl.audioUploads,
        formData,
        {
            headers: {
                Authorization: `Bearer ${tokenId}`, // Ensure `tokenId` is correctly set
                'Content-Type': 'multipart/form-data',
            },
        }
    );
}