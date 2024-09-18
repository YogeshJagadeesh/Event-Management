import axios from "axios"
import { baseUrl, usersUrl } from "../../../../assets/environment/apiManage"

export const fetchLogin = (formData:any) => {
    return axios.post(baseUrl+usersUrl.login, formData)
}