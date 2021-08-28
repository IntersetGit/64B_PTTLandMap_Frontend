import jwt_decode from "jwt-decode";
import { Cookies } from 'react-cookie'
import { Decrypt } from '../../util/SecretCode'
// Action Creator

export const setAuthUser = (user) => {
    // console.log('user setAuthUser :>> ', user);
    return dispatch => {
        dispatch({
            type: "SET_AUTH_USER_DATA",
            payload: user,
        });
    };
};


export const setToken = (access_token, refreshToken) => {
    return dispatch => {
        const cookies = new Cookies();
        const { token } = jwt_decode(access_token)
        const dataUser = Decrypt(token);
        cookies.set('token', access_token, { path: '/' });
        if (refreshToken) cookies.set('refresh_token', refreshToken, { path: '/' });

        dispatch(setAuthUser(dataUser));
        dispatch({
            type: "USER_TOKEN_SET",
            payload: access_token,
        });
    };
};

export const delToken = () => {
    return dispatch => {
        const cookies = new Cookies();
        cookies.remove("token", { path: '/' });
        cookies.remove("refresh_token", { path: '/' });
        location.reload();
        dispatch({
            type: "SET_AUTH_USER_DATA",
            payload: null,
        });
        dispatch({
            type: "USER_TOKEN_SET",
            payload: null,
        });
    };
};



