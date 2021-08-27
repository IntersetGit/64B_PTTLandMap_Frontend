import axios from 'axios';
import { Cookies } from 'react-cookie'
import jwt_decode from "jwt-decode";

const cookies = new Cookies();

export default axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVICE,
    headers: {
        'Content-Type': 'application/json',
    },
    transformRequest: [(data, headers) => {

        // Do whatever you want to transform the data
        const token = cookies.get('token');
        const refresh_token = cookies.get('refresh_token');
        // console.log('token :>> ', token);
        if (token) {
            const token_decode = jwt_decode(token);
            if (token_decode.exp < Date.now() / 1000) {
                console.log("หมดเวลาtoken")
                RefreshToken(refresh_token);
            }
        }
        if (token) headers.Authorization = "Bearer " + token
        return JSON.stringify(data);
    }],
});

const logout = () => {
    cookies.remove("token");
    cookies.remove("refresh_token");
    window.location.href = "/login";
}

const RefreshToken = async (refreshtokenval) => {
    try {
        if (refreshtokenval) {
            const { data } = await axios.post(process.env.NEXT_PUBLIC_SERVICE + '/provider/refreshToken', { token: refreshtokenval })
            const token = data.items
            cookies.set('token', token, { path: '/' });
            window.location.reload();
        } else {
            logout()
        }
    } catch (error) {
        logout()
    }
}