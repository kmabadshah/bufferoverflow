import React from 'react';
import ReactDOM from 'react-dom';
import App from './app.js';
import {configureStore, createSlice} from '@reduxjs/toolkit'
import {Provider} from 'react-redux'

import './index.css';
import './tailwind.css';

function f(action_name) {
    let row_id_property_name;

    switch (action_name) {
        case `already_voted_question_comments`:
            row_id_property_name = `comment_id`
            break
        
        case `already_voted_questions`:
            row_id_property_name = `question_id`
            break

        case `already_voted_answers`:
            row_id_property_name = `answer_id`
            break

        default:
            throw `invalid action_name`
    }


    return createSlice({
        name: action_name,
        initialState: [],
        reducers: {
            delete: (state, {payload}) => state.filter(avq => {
                if (avq[row_id_property_name] === payload[row_id_property_name] && avq.user_id === payload.user_id)
                    return false
                else
                    return true
            }),
            update: (state, {payload}) => {
                payload = {
                    user_id: payload[`user_id`], 
                    vote_flag: payload[`vote_flag`],
                    [row_id_property_name]: payload[row_id_property_name]
                }

                const found = state.find(avq => avq[row_id_property_name] === payload[row_id_property_name] && avq.user_id === payload.user_id)
                if (!found) // insert
                    return [...state, payload]

                else // update
                    return state.map(avq => {
                        if (avq[row_id_property_name] === payload[row_id_property_name] && avq.user_id === payload.user_id)
                            return payload
                        else
                            return avq
                    })
            }
        }
    })
}





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
    name: 'users',
    initialState: {
        current_user: null,
        list: []
    },
    reducers: {
        set_current_user: (state, action) => {
            state.current_user = action.payload
        },

        unset_current_user: (state, _) => {
            state.current_user = null
        },

        add: (state, {payload}) => {
            state.list.push(payload)
        }
    }
})






/* =========QUESTIONS SECTION=========== */
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

export const {
    reducer: already_voted_questions_reducer, 
    actions: already_voted_questions_actions} = f(`already_voted_questions`)

export const {
    reducer: already_voted_question_comments_reducer, 
    actions: already_voted_question_comments_actions} = f(`already_voted_question_comments`)

export const {reducer: question_comments_reducer, actions: question_comments_actions} = createSlice({
    name: 'question_comments',
    initialState: [],
    reducers: {
        add: (state, {payload}) => {
            if (payload.constructor.name === `Array`)
                return [...state, ...payload]

            else
                return [...state, payload]
        },

        update: (state, {payload}) => {
            return state.map(c => {
                if (c.comment_id === payload.comment_id && c.user_id === payload.user_id)
                    return payload
                else
                    return c
            })
        }
    }
})









/* =========ANSWERS SECTION=========== */
export const {reducer: answers_reducer, actions: answers_actions} = createSlice({
    name: 'answers',
    initialState: [],
    reducers: {
        add: (state, {payload}) => {
            if (payload.constructor.name === `Array`)
                return [...state, ...payload]

            else
                return [...state, payload]
        },

        // expecting payload to be a full answer object
        update: (state, {payload}) => {
            return state.map(q => {
                if (q.answer_id === payload.answer_id)
                    return payload
                else
                    return q
            })
        }
    }
})

export const {
    reducer: already_voted_answers_reducer, 
    actions: already_voted_answers_actions} = f(`already_voted_answers`)






const store = configureStore({
    reducer: {
        extras: extras_reducer,
        users: users_reducer,

        questions: questions_reducer,
        question_comments: question_comments_reducer,
        already_voted_questions: already_voted_questions_reducer,
        already_voted_question_comments: already_voted_question_comments_reducer,

        answers: answers_reducer,
        already_voted_answers: already_voted_answers_reducer,
    }
})



ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.querySelector("#root")
);

