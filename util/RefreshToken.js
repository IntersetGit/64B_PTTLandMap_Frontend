import axios from 'axios';
import { Cookies } from 'react-cookie'

const cookies = new Cookies();
export default async (refreshtokenval) => {
    try {
        if (refreshtokenval) {

            const { data } = await axios({
                method: "get",
                url: `${process.env.NEXT_PUBLIC_SERVICE}/provider/refreshToken`,
                headers: { Authorization: "Bearer " + refreshtokenval },
            })
            const token = data.items
            cookies.set('token', token, { path: '/' });
            // window.location.reload();
        } else {
            logout()
        }
    } catch (error) {
        logout()
    }
}

const logout = () => {
    cookies.remove("token");
    cookies.remove("refresh_token");
    window.location.href = "/login";
}