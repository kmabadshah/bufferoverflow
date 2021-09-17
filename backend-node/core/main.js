import express from 'express'
import axios from 'axios'
import pg_promise from 'pg-promise'
import {user_create_conditionally_async} from './route_methods/users.js'
import {question_create_async, question_update_async, question_get_async, question_get_all_async} from './route_methods/questions.js'
import {increment_or_decrement_table_vote_async, wtc, Message} from './route_methods/shared.js'
import {answer_create_async, answer_update_async, answer_get_async} from './route_methods/answers.js'
import {comment_create_async, comment_get_async, comment_update_async} from './route_methods/comments.js'
import {parse} from 'url'
import {
    already_voted_table_create_async,
    already_voted_table_get_async,
    already_voted_table_delete_async,
} from './route_methods/already_voted.js'
import exws from 'express-ws'
import { WebSocketServer } from 'ws'
import compression from 'compression'

const app = express()
const port = 8000

const pgp = pg_promise()
export const db = pgp('postgres://awkward:awk@localhost:5432/bufferoverflow')

app.use(compression({level: 9, threshold: 1000}))
app.use(express.json())

// cors middleware
app.use((req, res, next) => {
    res.set({
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Methods': 'POST, PUT, GET, DELETE',
        'Access-Control-Allow-Headers': 'content-type',
    })

    next()
})



// handle outbound client requests
app.post(`/cors`, wtc(async(req, res) => {
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
}))




/* USERS SECTION */
app.post(`/users`, user_create_conditionally_async)


/* QUESTIONS SECTION */
app.post(`/questions`, question_create_async)
app.get(`/questions`, question_get_all_async)
app.get(`/questions/:question_id`, question_get_async)
app.put(`/questions/:question_id`, question_update_async)

app.get(`/increment_vote/questions/:question_id`, (req, res) => increment_or_decrement_table_vote_async(req, res, `question`, `increment`))
app.get(`/decrement_vote/questions/:question_id`, (req, res) => increment_or_decrement_table_vote_async(req, res, `question`, `decrement`))

app.get(`/already_voted_questions/:question_id/:user_id/:vote_flag`, (req, res) => already_voted_table_create_async(req, res, `question`))
app.get(`/already_voted_questions/:question_id/:user_id`, (req, res) => already_voted_table_get_async(req, res, `question`))
app.delete(`/already_voted_questions/:question_id/:user_id`, (req, res) => already_voted_table_delete_async(req, res, `question`))




/* QUESTION COMMENTS */
app.post(`/question_comments/:question_id`, comment_create_async)
app.get(`/question_comments/:question_id`, comment_get_async)
app.put(`/question_comments/:comment_id`, comment_update_async)

app.get(`/increment_vote/question_comments/:comment_id`, (req, res) => increment_or_decrement_table_vote_async(req, res, `question_comment`, `increment`))
app.get(`/decrement_vote/question_comments/:comment_id`, (req, res) => increment_or_decrement_table_vote_async(req, res, `question_comment`, `decrement`))

app.get(`/already_voted_question_comments/:comment_id/:user_id/:vote_flag`, (req, res) => already_voted_table_create_async(req, res, `question_comment`))
app.get(`/already_voted_question_comments/:comment_id/:user_id`, (req, res) => already_voted_table_get_async(req, res, `question_comment`))
app.delete(`/already_voted_question_comments/:comment_id/:user_id`, (req, res) => already_voted_table_delete_async(req, res, `question_comment`))





/* ANSWERS SECTION */
app.post(`/answers`, answer_create_async)
app.get(`/answers/:question_id`, answer_get_async)
app.put(`/answers/:answer_id`, answer_update_async)

app.get(`/increment_vote/answers/:answer_id`, (req, res) => increment_or_decrement_table_vote_async(req, res, `answer`, `increment`))
app.get(`/decrement_vote/answers/:answer_id`, (req, res) => increment_or_decrement_table_vote_async(req, res, `answer`, `decrement`))

app.get(`/already_voted_answers/:answer_id/:user_id/:vote_flag`, (req, res) => already_voted_table_create_async(req, res, `answer`))
app.get(`/already_voted_answers/:answer_id/:user_id`, (req, res) => already_voted_table_get_async(req, res, `answer`))
app.delete(`/already_voted_answers/:answer_id/:user_id`, (req, res) => already_voted_table_delete_async(req, res, `answer`))












// [*] create a client pool
// [] create a new user, post a question
// [] check if the first user got updated
export const sockets = []
let counter = 0;
const handle_upgraded_socket = wtc((req, ws) => {
    const index = counter
    counter++;
    const {pathname, query:{username}} = parse(req.url,true)

    sockets.push(ws)

    ws.on(`close`, wtc(() => {
        // doesn't modify the length of the array, just empties the slot
        // this is intentional
        delete sockets[index]
    }))

    ws.on(`message`, (msg) => {
        try {
            let message = new Message(JSON.parse(msg.toString()))
            if (message.signal === `ack`) 
                ws.latest_message_from_client = message

        } catch(e) {
            const message = new Message({
                signal: `fin`,
                message: `MALFORMED data`
            })
            ws.send(JSON.stringify(message))
            ws.terminate()
        }
    })

})






const server = app.listen(port, () => console.log(`listening on ${port}`))
const soc_serv = new WebSocketServer({ noServer: true, maxPayload: 100 })

server.on(`upgrade`, (req, original_socket, head) => {
    if (parse(req.url,true).pathname !== `/websocket`) {
        original_socket.destroy()
    } else {
        soc_serv.handleUpgrade(
            req, 
            original_socket, 
            head, 
            upgraded_socket => handle_upgraded_socket(req, upgraded_socket)
        )
    }
})











