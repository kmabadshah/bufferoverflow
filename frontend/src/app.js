import React from 'react'
import Enter from './components/enter'
import Home from './components/home'
import User from './components/user'
import Question from './components/question'
import Protected from './components/protected'
import AskQuestion from './components/ask_question'
import NotFound from './components/not_found'
import {wtc, get_user_info_async, backend_url, new_user_obj} from './components/utilities'
import axios from 'axios'
import {useDispatch, useSelector} from 'react-redux'
import {users_actions, extras_actions} from './index.js'
import { Switch, Route, BrowserRouter as Router, useHistory } from 'react-router-dom';

export default function App() {
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
            <Route path={`/enter`}><Enter /></Route>
            <Route path={`/`}> <NotFound/> </Route>
        </Switch>
    </Router>

}

