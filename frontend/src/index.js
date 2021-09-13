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
        random_error: false,
        fetched_all_questions: false
    },
    reducers: {
        random_error_on: (state) => {
            state.random_error = true
        },
        random_error_off: (state) => {
            state.random_error = false
        },

        fetched_all_questions_on: state => {
            state.fetched_all_questions = true
        }
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

export const {reducer: questions_reducer, actions: questions_actions} = createSlice({
    name: 'questions',
    initialState: [],
    reducers: {
        add: (state, {payload}) => {
            if (payload.constructor.name === `Array`)
                return [...state, ...payload]

            else
                return [...state, payload]
        },

        set: (state, {payload}) => payload,

        // expecting payload to be a full question object
        update: (state, {payload}) => {
            return state.map(q => {
                if (q.question_id === payload.question_id)
                    return payload
                else
                    return q
            })
        }
    }
})


export const {reducer: question_comments_reducer, actions: question_comments_actions} = createSlice({
    name: 'question_comments',
    initialState: [],
    reducers: {
        add: (state, {payload}) => {
            if (payload.constructor.name === `Array`)
                return [...state, ...payload]

            else
                return [...state, payload]
        }
    }
})

export const {reducer: answers_reducer, actions: answers_actions} = createSlice({
    name: 'answers',
    initialState: [],
    reducers: {
        add: (state, {payload}) => {
            if (payload.constructor.name === `Array`)
                return [...state, ...payload]

            else
                return [...state, payload]
        }
    }
})


const store = configureStore({
    reducer: {
        extras: extras_reducer,
        users: users_reducer,
        questions: questions_reducer,
        question_comments: question_comments_reducer,
        answers: answers_reducer
    }
})



ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.querySelector("#root")
);

