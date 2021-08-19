import React from 'react';
import axios from 'axios';
import croxy from 'cors-anywhere';
// import auth0 from 'auth0-js';

export default function Enter() {
    return (
        <>
            <h1>Enter home</h1>
            <button onClick={(e) => handleClick(e)}>Click Me</button>
        </>
    );

    async function handleClick(e) {
        /* get the oauth token BEGIN */
        let get_token_url = 'https://accounts.google.com/o/oauth2/v2/auth?'
        get_token_url += '\
client_id=924892241355-hncoru00pl5k444kslb20poi0ath6ikt.apps.googleusercontent.com\
&redirect_uri=http://localhost:3000/oauth_consent\
&response_type=token\
&scope=https://www.googleapis.com/auth/userinfo.profile\
        '
        const win = window.open(get_token_url, '_blank', 'toolbar=0,location=0,menubar=0');
        const timerPromise = () => new Promise((resolve, reject) => {
            const timer = setInterval(() =>  {
                if (win.closed) {
                    const oauth_url = window.localStorage.getItem('oauth_url')
                    window.localStorage.removeItem('oauth_url')
                    resolve(oauth_url)
                    clearInterval(timer)
                }
            }, 1000)
        })

        // const u = "access_token=ya29.a0ARrdaM8kJLZJUo9CwWzWkMkqXx_JGA3qyKKiBbGJulcpoe6rVREdQSAIDbPacPvbZUPsGy_RSqEpNU-fFgWZxoc7jydMlotQi7hA4VggAwOj7MBgN3SiJ4uaw4Gwq-VJ9f3BUAbkjB0aZI1WOXoCzpO-VRTy&token_type=Bearer&expires_in=3599&scope=profile%20https://www.googleapis.com/auth/userinfo.profile"
        const oauth_url = await timerPromise()
        const data = oauth_url.substring(oauth_url.indexOf("#")+1)
        const [_, access_token, token_type, expiresIn, scope] = data.match(/access_token=(.*)&token_type=(.*)&expires_in=(.*)&scope=(.*)/)
        /* get the oauth token END */



        const get_data_url = "http://localhost:8080/http://www.googleapis.com/auth/androidpublisher"
        const res = await axios.get(get_data_url, {
            headers: {'Authorization': `Bearer ${access_token}`},
        })

        console.log(res)


        // const res = await axios.get(url)
        // console.log(res)
    }
}




// user clicks on the login button
// popup window with google oauth
// after user consent, redirect back to root url
// close the popup window
// reload the main window with user data
