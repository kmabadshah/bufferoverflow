import React from 'react';
import Enter from './components/enter';
import Home from './components/home';
import axios from 'axios';
import NotFound from './components/not_found';
import {fetch_and_store_token, get_user_info, backend_url} from './components/utilities';
import { Switch, Route, BrowserRouter as Router, useHistory } from 'react-router-dom';
import './index.css';
import './tailwind.css';

export default function App() {
    const history = useHistory()
    const pathname = window.location.pathname

    if (pathname === '/oauth_consent') {
        const string_before_api_token = window.location.href
        localStorage.setItem('string_before_api_token', string_before_api_token)

        window.close()
        return <NotFound/>
    }

    let user_data;

    (async () => {

        /* create the user BEGIN */
        const string_before_api_token = localStorage.getItem('string_before_api_token')
        const token = fetch_and_store_token(string_before_api_token)
        user_data = await get_user_info(token)
        await axios.post(`${backend_url}/users`, user_data)
        /* create the user END */
    })()

    // if no user, redirect to /enter

    return !user_data ? (() => {
        window.history.replaceState(null, "", "/enter")
        return <Enter />
    })() : (() => {
        if (pathname === "/enter") {
            window.history.replaceState(null, "", "/")
        }

        return <Router>
            <Switch>
                <Route exact path="/"> <Home/> </Route>
                <Route path="/"> <NotFound/> </Route>
            </Switch>
        </Router>
    })();
}

