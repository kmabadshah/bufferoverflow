import React from 'react'
import Home from './components/home'
import User from './components/user'
import Question from './components/question'
import AskQuestion from './components/ask_question'
import NotFound from './components/not_found'
import {wtc, get_user_info_async, backend_url, new_user_obj, error_log} from './components/utilities'
import axios from 'axios'
import {useDispatch, useSelector} from 'react-redux'
import {users_actions, extras_actions, questions_actions} from './index.js'
import { Switch, Route, BrowserRouter as Router, useHistory } from 'react-router-dom';

export let ws = null;
export default function App() {
    const dispatch = useDispatch()
    const [loading, set_loading] = React.useState(true)

    React.useLayoutEffect(() => { try {
        ws = new WebSocket(`ws://localhost:8000/websocket`)
        ws.addEventListener('error', (e) => { error_log(e) })
        ws.addEventListener('open', (e) => { console.log(`connected`) })
        ws.addEventListener('close', e => console.log(`CLOSED`, e.data))

        set_loading(false)

    } catch(e) {error_log(e)}}, [])




    if (window.location.pathname === '/oauth_consent') {
        const string_before_api_token = window.location.href
        localStorage.setItem('string_before_api_token', string_before_api_token)

        window.close()
        return <NotFound/>
    }

    if (loading) return `loading....`

    else return <Router>
        <Switch>
            <Route exact path={`/`}> <Home /> </Route>
            <Route path={`/users/:user_id`}> <User /> </Route>
            <Route path={`/ask_question`}> <AskQuestion /> </Route>
            <Route path={`/questions/:question_id`}> <Question /> </Route>
            <Route path={`/`}> <NotFound/> </Route>
        </Switch>
    </Router>

}

