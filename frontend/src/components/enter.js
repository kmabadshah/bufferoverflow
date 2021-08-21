/* keslint-disable */
import React from 'react';
import axios from 'axios';
import croxy from 'cors-anywhere';
// import auth0 from 'auth0-js';

const backend_url = 'http://localhost:8000'

export default function Enter() {
    const [img_src, set_img_src] = React.useState()

    return (
        <>
            <h1>Enter home</h1>
            <button onClick={(e) => handleClick(e)}>Click Me</button>
            {img_src && (<img src={img_src} alt="face" />)}
        </>
    );

    async function handleClick(e) {
        try {
            /* get the oauth token BEGIN */
            let get_token_url =
                'https://www.github.com/login/oauth/authorize' +
                '?client_id=24bf0d137961d6038ffb' +
                '&redirect_uri=http://localhost:3000/oauth_consent' +
                '&scope=read:user'

            const win = window.open(get_token_url, '_blank', 'toolbar=0,location=0,menubar=0');
            const timerPromise = () => new Promise((resolve, reject) => {
                const timer = setInterval(() =>  {
                    if (win.closed) {
                        const oauth_url = window.localStorage.getItem('oauth_url')
                        if (!oauth_url) { return }
                        window.localStorage.removeItem('oauth_url')
                        resolve(oauth_url)
                        clearInterval(timer)
                    }
                }, 1000)
            })


            const oauth_url = await timerPromise()
            const data = oauth_url.substring(oauth_url.indexOf("?")+1)
            const [_, code] = data.match(/code=(.*)/)
            get_token_url = "https://github.com/login/oauth/access_token"
            const {data: {query_data: resStr, query_status}} = await axios.post(backend_url+"/cors", {
                url: get_token_url,
                method: 'POST',
                data: {
                    client_id: "24bf0d137961d6038ffb",
                    client_secret: '9698017268cd16f3b72dd169646826ac0924dba4',
                    code: code,
                    redirect_uri: 'http://localhost:3000/oauth_consent'
                }
            })

            const [__, token] = resStr.match(/access_token=(.*?)&/)
            /* get the oauth token END */




            /* process oauth token BEGIN */
            const get_data_url = "https://api.github.com/user"
            const {data: {login: username, avatar_url: image_url}} = await axios.get(get_data_url, {
                headers: {Authorization: `token ${token}`}
            })
            /* process oauth token END */




            /* create the user BEGIN */
            const res = await axios.post(`${backend_url}/users`, {
                username, image_url, profile_description: ''
            })
            if (res.status === 200)
                console.log("WELCOME HOME")

            /* create the user END */



            // const res = await axios.get(url)
            // console.log(res)
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
