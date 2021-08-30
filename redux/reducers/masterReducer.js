
const INIT_STATE = {
    roles: [],
    province: [],
    district: [],
    sub_district: [],
    name_title: [],
};

const userReducer = (state = INIT_STATE, action) => {
    switch (action.type) {
        case "SET_ROLES":
            return {
                ...state, roles: action.payload
            }
        case "SET_PROVINCE":
            return {
                ...state, province: action.payload
            }
        case "SET_DISTRICT":
            return {
                ...state, district: action.payload
            }
        case "SET_SUB_DISTRICT":
            return {
                ...state, sub_district: action.payload
            }
        case "SET_NAME_TITLE":
            return {
                ...state, name_title: action.payload
            }
        default:
            return {
                ...state
            }
    }
}

export default userReducer;