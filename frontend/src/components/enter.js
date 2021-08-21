/* keslint-disable */
import React from 'react';
import axios from 'axios';
import {Redirect} from 'react-router-dom';
import {fetch_and_store_token, get_user_info} from './utilities'
// import auth0 from 'auth0-js';

const backend_url = 'http://localhost:8000'

export default function Enter() {
    const [img_src, set_img_src] = React.useState()

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

            // redirect to home page
            <Redirect
                pathname="/"
            />



        } catch(e) {
            if (e.response)
                console.log("REQUEST ERROR: ", e.response)
            else
                console.log("ERROR: ", e)

        }
    }
}




// user clicks on the login button
// popup window with google oauth
// after user consent, redirect back to root url
// close the popup window
// reload the main window with user data
