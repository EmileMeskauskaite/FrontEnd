
import axios from 'axios';

const API_URL = 'http://localhost:5169'; 

export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/user/createuser`, userData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Network Error");
    }
};

export const loginUser = async (loginData) => {
    try {
        const response = await axios.post(`${API_URL}/user/login`, loginData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Network Error");
    }
};

export const updateUserCredentials = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/user/updateusercredentials`, userData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Network Error");
    }
};
