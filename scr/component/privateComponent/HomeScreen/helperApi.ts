import axios from "axios";
import { baseUrl, EventsUrl } from "../../../../assets/environment/apiManage";

export const fetchEvents = (tokenId: any) => {
    return axios.get(baseUrl, {
        headers: { Authorization: `Bearer ${tokenId}` }
    });
}

export const fetchTotalEvents = (tokenId: any, totalCount: any) => {
    return axios.get(`${baseUrl+EventsUrl.getEvents}?page=1&limit=${totalCount}`, {
        headers: { Authorization: `Bearer ${tokenId}` }
    });
}