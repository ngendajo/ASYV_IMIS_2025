import axios from "axios";
import baseUrl from '../../api/baseUrl';

export const fetchPDFNews = (auth) => {
    return axios.get(baseUrl + "/pdfnews/", {
        headers: {
            "Authorization": 'Bearer ' + String(auth.accessToken),
        },
    });
};

export const createPDFNews = (formData, auth) => {
    return axios.post(baseUrl + "/pdfnews/", formData, {
        headers: {
            "Authorization": 'Bearer ' + String(auth.accessToken),
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const deletePDFNews = (id, auth) => {
    return axios.delete(`${baseUrl}/pdfnews/${id}/`, {
        headers: {
            "Authorization": 'Bearer ' + String(auth.accessToken),
        },
    });
};