import config        from "../config"
import { authorize } from "./smart"

const INITIAL_STATE = {
    adapter: getSelectedAdapter()
};

const SET_ADAPTER = "settings/setAdapter";

function getSelectedAdapter() {
    let id      = localStorage.adapterId || "";
    let adapter = config.adapters[id];
    if (!adapter) {
        id      = config.defaultAdapter;
        adapter = config.adapters[id];
    }
    localStorage.adapterId = id;
    return { ...adapter, id };
}

export function setAdapterId(id) {
    return dispatch => {
        const adapter = config.adapters[id];
        if (adapter) {
            dispatch({
                type: SET_ADAPTER,
                payload: {
                    ...adapter,
                    id
                }
            });
            localStorage.adapterId = id;
            sessionStorage.clear();
            dispatch(authorize());
        }
    };
}

export default function serversReducer(state = INITIAL_STATE, action)
{
    switch (action.type) {

        case SET_ADAPTER:
            return { ...state, adapter: action.payload };

        default:
            return state;
    }
}
