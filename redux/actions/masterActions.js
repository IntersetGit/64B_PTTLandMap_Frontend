// Action Creator

export const setMasterRoles = (data) => {
    return dispatch => {
        dispatch({
            type: "SET_ROLES",
            payload: data,
        });
    };
};

export const setMasterProvince = (data) => {
    return dispatch => {
        dispatch({
            type: "SET_PROVINCE",
            payload: data,
        });
    };
};

export const setMasterDistrict = (data) => {
    return dispatch => {
        dispatch({
            type: "SET_DISTRICT",
            payload: data,
        });
    };
};

export const setMasterSubDistrict = (data) => {
    return dispatch => {
        dispatch({
            type: "SET_SUB_DISTRICT",
            payload: data,
        });
    };
};

/* คำนำหน้า */
export const setMasterNameTitle = (data) => {
    return dispatch => {
        dispatch({
            type: "SET_NAME_TITLE",
            payload: data,
        });
    };
};



