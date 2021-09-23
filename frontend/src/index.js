import React from 'react';
import ReactDOM from 'react-dom';
import App from './app.js';
import {configureStore, createSlice} from '@reduxjs/toolkit'
import {Provider} from 'react-redux'
import {sort_by_vote_count_and_timestamp} from './components/utilities.js'

import './index.css';
import './tailwind.css';

/*
 *
 * generic function to create redux slice for already_voted_{questions|answers|...} family of redux actions 
 *
 * EXAMPLE:
 *
 * create_already_voted_slice(`already_voted_questions`) 
 * -> {
 *      name: `already_voted_questions`, 
 *      initialState: [],
 *      reducers: { delete, update }
 *  }
 *
 * */
function create_already_voted_slice(action_name) {
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

    case `already_voted_answer_comments`:
      row_id_property_name = `comment_id`
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
    current_user: undefined,
    list: []
  },
  reducers: {
    set_current_user: (state, action) => {
      state.current_user = action.payload
    },

    unset_current_user: (state, _) => {
      state.current_user = null
    },

    // adds if not available, update otherwise
    update: (state, {payload}) => {
      const exists = state.list.find(u => u.user_id === payload.user_id)

      if (!exists) 
        state.list = [...state.list, payload]
      else 
        state.list = state.list.map(u => u.user_id === payload.user_id ? payload:u)
    }
  }
})








/* =========QUESTIONS SECTION=========== */
export const {reducer: questions_reducer, actions: questions_actions} = createSlice({
  name: 'questions',
  initialState: [],
  reducers: {
    add: (state, {payload}) => {
      let new_state = [...state];

      if (payload.constructor.name === `Array`)
        new_state = [...new_state, ...payload]
      else if (payload.constructor.name === `Object`) {
        const exists = state.find(cmt => cmt.question_id === payload.question_id)
        if (!exists) {
          new_state =  [...state, payload]
        }
      }
      else {
        throw `invalid payload type`
      }

      new_state.sort(sort_by_vote_count_and_timestamp)
      return new_state
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
  actions: already_voted_questions_actions} = create_already_voted_slice(`already_voted_questions`)

export const {
  reducer: already_voted_question_comments_reducer, 
  actions: already_voted_question_comments_actions} = create_already_voted_slice(`already_voted_question_comments`)

export const {reducer: question_comments_reducer, actions: question_comments_actions} = createSlice({
  name: 'question_comments',
  initialState: [],
  reducers: {
    add: (state, {payload}) => {
      let new_state = [...state];

      if (payload.constructor.name === `Array`)
        new_state = [...new_state, ...payload]
      else if (payload.constructor.name === `Object`) {
        const exists = state.find(cmt => cmt.comment_id === payload.comment_id)
        if (!exists) {
          new_state =  [...state, payload]
        }
      }
      else {
        throw `invalid payload type`
      }

      new_state.sort(sort_by_vote_count_and_timestamp)
      return new_state

    },

    update: (state, {payload}) => {
      if (payload.constructor.name === `Array`) {
        const new_state = [...state]

        for (const i1 in payload) {
          let found;
          for (const i2 in state) {
            if (payload[i1].comment_id === state[i2].comment_id) {
              new_state[i2] = payload[i1]
              found = true
            }
          }

          if (!found) {
            new_state.push(payload[i1])
          }
        }

        return new_state
      }

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
    // add if not exists
    add: (state, {payload}) => {
      let new_state = [...state];

      if (payload.constructor.name === `Array`)
        new_state = [...new_state, ...payload]
      else if (payload.constructor.name === `Object`) {
        const exists = state.find(ans => ans.answer_id === payload.answer_id)
        if (!exists) {
          new_state =  [...state, payload]
        }
      }
      else {
        throw `invalid payload type`
      }

      new_state.sort(sort_by_vote_count_and_timestamp)
      return new_state
    },

    // expecting payload to be a full answer object
    update: (state, {payload}) => {
      if (payload.constructor.name === `Array`) {
        const new_state = [...state]

        for (const i1 in payload) {
          let found;
          for (const i2 in state) {
            if (payload[i1].answer_id === state[i2].answer_id) {
              new_state[i2] = payload[i1]
              found = true
            }
          }

          if (!found) {
            new_state.push(payload[i1])
          }
        }

        return new_state
      }

      else return state.map(q => {
        if (q.answer_id === payload.answer_id)
          return payload
        else
          return q
      })
    },

  }
})

export const {
  reducer: already_voted_answers_reducer, 
  actions: already_voted_answers_actions } = create_already_voted_slice(`already_voted_answers`)

export const {reducer: answer_comments_reducer, actions: answer_comments_actions} = createSlice({
  name: 'answer_comments',
  initialState: [],
  reducers: {
    add: (state, {payload}) => {
      let new_state = [...state];

      if (payload.constructor.name === `Array`) {
        for (const p of payload) {
          let found = false;
          for (const s of state) {
            if (p.comment_id == s.comment_id) {
              found = true
              break
            }
          }

          if (!found) {
            new_state = [...new_state, p]
          }
        }
      }
      else if (payload.constructor.name === `Object`) {
        const exists = state.find(cmt => cmt.comment_id === payload.comment_id)
        if (!exists) {
          new_state =  [...state, payload]
        }
      }
      else {
        throw `invalid payload type`
      }

      new_state.sort(sort_by_vote_count_and_timestamp)
      return new_state

    },

    update: (state, {payload}) => {
      if (payload.constructor.name === `Array`) {
        const new_state = [...state]

        for (const i1 in payload) {
          let found;
          for (const i2 in state) {
            if (payload[i1].comment_id === state[i2].comment_id) {
              new_state[i2] = payload[i1]
              found = true
            }
          }

          if (!found) {
            new_state.push(payload[i1])
          }
        }

        return new_state
      }

      return state.map(c => {
        if (c.comment_id === payload.comment_id && c.user_id === payload.user_id)
          return payload
        else
          return c
      })
    }

  }
})
export const {
  reducer: already_voted_answer_comments_reducer, 
  actions: already_voted_answer_comments_actions} = create_already_voted_slice(`already_voted_answer_comments`)










export const store = configureStore({
  reducer: {
    extras: extras_reducer,
    users: users_reducer,

    questions: questions_reducer,
    question_comments: question_comments_reducer,
    already_voted_questions: already_voted_questions_reducer,
    already_voted_question_comments: already_voted_question_comments_reducer,

    answers: answers_reducer,
    answer_comments: answer_comments_reducer,
    already_voted_answers: already_voted_answers_reducer,
    already_voted_answer_comments: already_voted_answer_comments_reducer
  }
})



ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector("#root")
);

