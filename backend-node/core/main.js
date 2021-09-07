import express from 'express'
import axios from 'axios'
import pg_promise from 'pg-promise'
import {user_create_conditionally_async} from './route_methods/users.js'
import {question_create_async, question_update_async, question_get_async, question_get_all_async, increment_or_decrement_question_vote_async} from './route_methods/questions.js'
import {answer_create_async, answer_update_async, answer_get_async, increment_or_decrement_answer_vote_async} from './route_methods/answers.js'

import {
  already_voted_table_create_async,
  already_voted_table_get_async,
} from './route_methods/already_voted.js'

import exws from 'express-ws'
import { WebSocketServer } from 'ws'
import compression from 'compression'

const app = express()
const port = 8000

const pgp = pg_promise()
export const db = pgp('postgres://awkward:awk@localhost:5432/bufferoverflow')

app.use(compression({level: 9, threshold: 0}))
app.use(express.json())

// cors middleware
app.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'PUT, GET, DELETE',
    'Access-Control-Allow-Headers': 'content-type',
  })

  next()
})

// handle outbound client requests
app.post('/cors', async(req, res) => {
  try {
    const {url, method, data} =  req.body

    if (!url || !method) {
      return res.status(400).send(`
                missing fields, must contain url, method and optional data field
            `)
    }

    const query_conf = {
      url, method
    }
    if (data) {
      query_conf['data'] = data
    }

    const query_res = await axios(query_conf)
    res.status(200).send({query_data: query_res.data, query_status: query_res.status})
  } catch(e) {
    console.log("ERROR: ", e)
    res.status(500).send()
  }
})



/* USERS SECTION */
app.post(`/users`, user_create_conditionally_async)

/* QUESTIONS SECTION */
app.post(`/questions`, question_create_async)
app.get(`/questions`, question_get_all_async)
app.get(`/questions/:question_id`, question_get_async)
app.put(`/questions/:question_id`, question_update_async)

app.get(`/increment_vote/questions/:question_id`, (req, res) => increment_or_decrement_question_vote_async(req, res, `increment`))
app.get(`/decrement_vote/questions/:question_id`, (req, res) => increment_or_decrement_question_vote_async(req, res,`decrement`))

app.get(`/already_voted_questions/:question_id/:user_id/:vote_flag`, (req, res) => already_voted_table_create_async(req, res, `question`))
app.get(`/already_voted_questions/:question_id/:user_id`, (req, res) => already_voted_table_get_async(req, res, `question`))

/* ANSWERS SECTION */
app.post(`/answers`, answer_create_async)
app.get(`/answers/:question_id`, answer_get_async)
app.put(`/answers/:answer_id`, answer_update_async)

app.get(`/increment_vote/answers/:answer_id`, (req, res) => increment_or_decrement_answer_vote_async(req, res, `increment`))
app.get(`/decrement_vote/answers/:answer_id`, (req, res) => increment_or_decrement_answer_vote_async(req, res,`decrement`))

app.get(`/already_voted_answers/:answer_id/:user_id/:vote_flag`, (req, res) => already_voted_table_create_async(req, res, `answer`))
app.get(`/already_voted_answers/:answer_id/:user_id`, (req, res) => already_voted_table_get_async(req, res, `answer`))


app.listen(port, () => console.log(`listening on ${port}`))

