
const INIT_STATE = {
    token: null,
    user: null,
};

const userReducer = (state = INIT_STATE, action) => {
    switch (action.type) {
        case "USER_TOKEN_SET":
            return {
                ...state, token: action.payload
            }
        case "SET_AUTH_USER_DATA":
            return {
                ...state, user: action.payload
            }
        default:
            return {
                ...state
            }
    }
}

export default userReducer;