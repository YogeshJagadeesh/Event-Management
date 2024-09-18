import axios from "axios";
import { baseUrl, customersUrl } from "../../../../assets/environment/apiManage";

export const fetchCustomerList = (eventId: any, currentPage: any, tokenId: any) => {
    return axios.get(`${baseUrl+customersUrl.getCustomerByEvent+eventId}?page=${currentPage}&limit=10`, {
        headers: { Authorization: `Bearer ${tokenId}` }
    })
}

export const customerValidation = (qrData: any, tokenId: any) => {
    return axios.get(`${baseUrl+customersUrl.customerValidat+qrData}`, {
        headers: { Authorization: `Bearer ${tokenId}` }
    });
}