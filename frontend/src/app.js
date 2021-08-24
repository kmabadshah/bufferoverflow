import React from 'react';
import Enter from './components/enter';
import Home from './components/home';
import axios from 'axios';
import NotFound from './components/not_found';
import {fetch_and_store_token, get_user_info, backend_url, User} from './components/utilities';
import { Switch, Route, BrowserRouter as Router, useHistory } from 'react-router-dom';
import {extras_actions, users_actions} from './index'
import {useSelector, useDispatch} from 'react-redux'
import './index.css';
import './tailwind.css';

export default function App() {
    const history = useHistory()
    const pathname = window.location.pathname
    const string_before_api_token = localStorage.getItem('string_before_api_token')
    const {extras: {loading}, users: {current_user}} = useSelector(store => store)
    const [something_went_wrong, set_something_went_wrong] = React.useState(false)
    const dispatch = useDispatch()

    /* fetch the user,
     * store the user,
     * update the `authenticating` variable */
    React.useLayoutEffect(() => {
        (async () => {
            const string_before_api_token = localStorage.getItem('string_before_api_token')

            if (loading) {
                /* do not fetch user on the /oauth_consent
                 * that page is only for storing the github code and github token
                 * */
                if (pathname !== "/oauth_consent" && !current_user && string_before_api_token) try {
                    const token = await fetch_and_store_token(string_before_api_token)
                    const user_data = await get_user_info(token)
                    const res = await axios.post(`${backend_url}/users`, user_data)

                    const user_instance = new User(res)
                    dispatch(users_actions.set_current_user(user_instance))
                } catch(e) {
                    if (e.response)
                        console.log("REQUEST ERROR: ", e.response)
                    else
                        console.log("ERROR: ", e)

                    set_something_went_wrong(true)
                }

                dispatch(extras_actions.loading_off())
            }
        })()

        return () => null
    }, [loading])








    if (pathname === '/oauth_consent') {
        const string_before_api_token = window.location.href
        localStorage.setItem('string_before_api_token', string_before_api_token)

        window.close()
        return <NotFound/>
    }


    if (something_went_wrong) {
        return <h1>Something went wrong, please try refreshing the page</h1>
    }

    if (loading) {
        return <h1>Loading...</h1>
    }



    if (!string_before_api_token) {
        window.history.replaceState(null, "", "/enter")
        return <Enter />
    }

    if (pathname === "/enter") {
        window.history.replaceState(null, "", "/")
    }

    return <Router>
        <Switch>
            <Route exact path="/"> <Home/> </Route>
            <Route path="/"> <NotFound/> </Route>
        </Switch>
    </Router>

}

