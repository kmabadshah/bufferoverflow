import React from 'react'
import Home from './components/home'
import User from './components/user'
import Question from './components/question'
import AskQuestion from './components/ask_question'
import NotFound from './components/not_found'
import {wtc, get_user_info_async, backend_url, new_user_obj} from './components/utilities'
import axios from 'axios'
import {useDispatch, useSelector} from 'react-redux'
import {users_actions, extras_actions} from './index.js'
import { Switch, Route, BrowserRouter as Router, useHistory } from 'react-router-dom';

export default function App() {

    React.useEffect(() => wtc(async() => {
        const ws = new WebSocket(`ws://localhost:8000/websocket`)
        ws.addEventListener('error', (e) => { console.log(e) })
        ws.addEventListener('open', (e) => { console.log(`connected`) })
        ws.addEventListener('close', e => console.log(`CLOSED`, e.data))
        ws.addEventListener(`message`, wtc(e => {
            let msg_obj
            msg_obj = JSON.parse(e.data)

            console.log(msg_obj)
            ws.send(JSON.stringify({ ...msg_obj, signal: `ack` }))
        }))

    })(), [])
    // })(() => dispatch(extras_actions.random_error_on())), [])




    if (window.location.pathname === '/oauth_consent') {
        const string_before_api_token = window.location.href
        localStorage.setItem('string_before_api_token', string_before_api_token)

        window.close()
        return <NotFound/>
    }




    return <Router>
        <Switch>
            <Route exact path={`/`}> <Home/> </Route>
            <Route path={`/users/:user_id`}> <User /> </Route>
            <Route path={`/ask_question`}> <AskQuestion /> </Route>
            <Route path={`/questions/:question_id`}> <Question /> </Route>
            <Route path={`/`}> <NotFound/> </Route>
        </Switch>
    </Router>

}

