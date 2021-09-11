import React from 'react';
import ReactDOM from 'react-dom';
import App from './app.js';
import {configureStore, createSlice} from '@reduxjs/toolkit'
import {Provider} from 'react-redux'

import './index.css';
import './tailwind.css';

export const {reducer: extras_reducer, actions: extras_actions} = createSlice({
    name: 'extras',
    initialState: {
        random_error: false
    },
    reducers: {
        random_error_on: (state) => {
            state.random_error = true
        },
        random_error_off: (state) => {
            state.random_error = false
        },
    }
})

export const {reducer: users_reducer, actions: users_actions} = createSlice({
    /*
     * state {
         current_user: user_obj,
         notifications: [notification],
       }
    */

    /*
     * reducers {
     *   set_current_user: state.current_user = action.payload
     *   unset_current_user: state.current_user = null
     *   add_notification: append action.payload to state.notifications
     * }
     * */



    name: 'users',
    initialState: {
        current_user: null,
    },
    reducers: {
        set_current_user: (state, action) => {
            state.current_user = action.payload
        },

        unset_current_user: (state, _) => {
            state.current_user = null
        }
    }
})

const store = configureStore({
    reducer: {
        extras: extras_reducer,
        users: users_reducer
    }
})



ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.querySelector("#root")
);

