import express from 'express'
import axios from 'axios'
import pg_promise from 'pg-promise'
import user_create_conditionaly_async from './route_methods/users.js'
import {question_create_async, question_get_async, increment_or_decrement_vote_async} from './route_methods/questions.js'
import {answer_create_async, answer_get_async} from './route_methods/answers.js'
import {already_voted_questions_create_async, already_voted_questions_get_async} from './route_methods/already_voted.js'
import exws from 'express-ws'
import { WebSocketServer } from 'ws'

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
app.get(`/answers/:question_id`, answer_get_async)

app.get(`/already_voted_questions/:question_id/:user_id/:vote_flag`, already_voted_questions_create_async)
app.get(`/already_voted_questions/:question_id/:user_id`, already_voted_questions_get_async)

// app.listen(port, () => console.log(`listening on ${port}`))







let id = 0
const get_random_id = () => {
    return ++id
}

const clients = { }

const wss = new WebSocketServer({ noServer: true, clientTracking: true });
wss.on('connection', socket => {
    const current_client_id = get_random_id()
    clients[current_client_id] = socket

    Object.keys(clients).forEach(clid => {
        if (parseInt(clid, 10) !== current_client_id)
        {
            clients[clid].send(`client number ${current_client_id} has joined the server`)
        }
    })

    socket.on(`close`, () => {
        Object.keys(clients).forEach(clid => {
            if (parseInt(clid, 10) !== current_client_id)
            {
                clients[clid].send(`client no ${current_client_id} has left the server`)
            }
        })

        delete clients[current_client_id]
    })


    // client1->server->client2
    socket.on(`message`, (data, isBinary) => {
        try {
            const {to, message} = JSON.parse(data)

            if (clients[to])
            {
                clients[to].send(`from client ${current_client_id}: ${message}`)
            }
            else
            {
                socket.send(`client doesnt exist`)
            }
        } catch(e) {
            if (e.name === `SyntaxError`)
            {
                console.log(`Error: received invalid json message`)
                socket.send(`Error: received invalid json message`)
            }
            else
            {
                console.log(e)
            }
        }
    })
});


const server = app.listen(8000, console.log(`listening on 8000`));
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, socket => {
        wss.emit('connection', socket, request);
    });
});






                    // TODO:
// convert all backend api to use websockets
// expose only one endpoint, that will upgrade the connection
// afterwards, all communication should happen with json and websocket messages
// json schema(from client to server):
// {
//  action: POST,
//  table: answers,
//  data: {
//    text: this is an answer,
//    user_id: 10,
//    question_id: 20,
//    vote_count: 0
//  }
// }
//
// json schema(server to answer owner)
// {
//   action: OK || ERROR,
//   data: `invalid_user_id`
// }
//
// json schema(from server to question owner):
// {
//  action: POSTED,
//  table: answers,
//  data: {
//    question_id: 20,
//    user_id: 10,
//    text: this is an answer,
//    vote_count: 0,
//    answer_id: 99,
//    timestamp: 9375987345
//  }
// }
//
//
//
// if the websocket connection is dropped from the client
// the frontend will show a dialog that the client is now offline
// and the frontend will try to connect to the server in intervals.
// once the connection is ok, remove the dialog.
//
// in the offline period, the user cannot click or change anything.
// all changes are discarded.
//
//
// establish a json schema for frontend-backend communication
//
// convert all frontend code to use websockets
// in the beginning, the frontend will create a websocket connection
// with the backend. Afterwards all communication will happen with json
