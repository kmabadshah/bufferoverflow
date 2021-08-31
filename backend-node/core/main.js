import express from 'express'
import axios from 'axios'
import pg_promise from 'pg-promise'
import user_create_conditionaly_async from './route_methods/users.js'
import {question_create_async, question_get_async, increment_or_decrement_vote_async} from './route_methods/questions.js'
import {answer_create_async} from './route_methods/answers.js'

const app = express()
const port = 8000

const pgp = pg_promise()
export const db = pgp('postgres://awkward:awk@localhost:5432/bufferoverflow')

app.use(express.json())

// cors middleware
app.use((req, res, next) => {
    res.header({
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



app.post(`/users`, user_create_conditionaly_async)


app.post(`/questions`, question_create_async)
app.get(`/increment_vote/questions/:question_id`, (req, res) => increment_or_decrement_vote_async(req, res, `increment`))
app.get(`/decrement_vote/questions/:question_id`, (req, res) => increment_or_decrement_vote_async(req, res,`decrement`))
app.get(`/questions/:question_id`, question_get_async)

app.post(`/answers`, answer_create_async)

app.listen(port, () => console.log(`listening on ${port}`))
