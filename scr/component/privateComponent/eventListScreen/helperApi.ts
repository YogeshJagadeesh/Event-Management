import axios from "axios";
import { baseUrl, EventsUrl } from "../../../../assets/environment/apiManage";

export const fetchEventsList = (currentPage:any, tokenId:any) => {
    return axios.get(`${baseUrl+EventsUrl.getEvents}?page=${currentPage}&limit=10`, {
        headers: { Authorization: `Bearer ${tokenId}` }
    })
}