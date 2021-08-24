/* keslint-disable */
import React from 'react';
import axios from 'axios';
import {Redirect} from 'react-router-dom';
import {fetch_token_async, get_user_info} from './utilities'
import {extras_actions} from '../index'
import {useDispatch, useSelector} from 'react-redux'
// import auth0 from 'auth0-js';

const backend_url = 'http://localhost:8000'

export default function Enter() {
    const [img_src, set_img_src] = React.useState()
    const dispatch = useDispatch()
    const loading = useSelector(store => store.extras.loading)

    React.useEffect(() => {
        //
    }, [])


    return (
        <>
            <h1>Enter home</h1>
            <button onClick={(e) => handleClick(e)}>Click Me</button>
            {img_src && (<img src={img_src} alt="face" />)}
        </>
    );

    async function handleClick(e) {
        /* fetch and store the url string given by github before the actual token */

        try {
            let get_token_url =
                'https://www.github.com/login/oauth/authorize' +
                '?client_id=24bf0d137961d6038ffb' +
                '&redirect_uri=http://localhost:3000/oauth_consent' +
                '&scope=read:user'

            const win = window.open(get_token_url, '_blank', 'toolbar=0,location=0,menubar=0');
            const timer_promise = () => new Promise((resolve, reject) => {
                const timer = setInterval(() =>  {
                    if (win.closed) {
                        resolve(window.localStorage.getItem('string_before_api_token'))
                        clearInterval(timer)
                    }
                }, 1000)
            })

            const string_before_api_token = await timer_promise()
            if (!string_before_api_token) return

            // fetch and store the token
            const token = await fetch_token_async(string_before_api_token)
            localStorage.setItem('github_api_token', token)

            // redirect to home page
            dispatch(extras_actions.loading_on())

        } catch(e) {
            if (e.response)
                console.log("REQUEST ERROR: ", e.response)
            else
                console.log("ERROR: ", e)

        }
    }
}


