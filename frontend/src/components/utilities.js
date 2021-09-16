/* keslint-disable */
import axios from 'axios'
import React from 'react';
import {Link, useHistory} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import {extras_actions, users_actions} from '../index.js'

export const backend_url = 'http://localhost:8000'
const github_client_id = "24bf0d137961d6038ffb"
const github_client_secret = '9698017268cd16f3b72dd169646826ac0924dba4'
const github_redirect_uri = 'http://localhost:3000/oauth_consent'
const github_get_token_url = 'https://github.com/login/oauth/access_token'

/*
 *
 * wtc is an acronym for wrapped_in_try_catch
 * it's a simple try-catch wrapper
 * takes a function and returns the same function, but try-catch included
 * example:
 *   const do_something = wtc((str) => {
 *     return str
 *   })
 *
 *   do_something(`hello world`) === `hello world`
 *
 */
export function wtc(f) {
    const is_async = f.constructor.name === `AsyncFunction`

    if (is_async) {
        return async function() {
            try {
                return await f.apply(this, arguments)
            }
            catch(e) {
                console.log(`-------------ERROR_BEGIN---------`)
                console.dir(e)
                console.trace(e)
                console.log(`-------------ERROR_END---------`)

                // additional error handling code
                if (typeof arguments[0] === `function`)
                    arguments[0]()
            }
        }
    }

    return function() {
        try {
            return f.apply(this, arguments)
        }
        catch(e) {
            console.log(`-------------ERROR_BEGIN---------`)
            console.dir(e)
            console.trace(e)
            console.log(`-------------ERROR_END---------`)

            // additional error handling code
            if (typeof arguments[0] === `function`)
                arguments[0]()
        }
    }
}





/* sort based on 1)_vote_count and 2)_timestamp(low->high ascending) */
export const sort_by_vote_count_and_timestamp = wtc((a, b) => {
    // sort by vote count, highest first
    if (a.vote_count < b.vote_count)
        return 1

    else if (a.vote_count === b.vote_count) {
        // sort by timestamp, lowest->highest (old->new)
        const ta = new Date(a.timestamp)
        const tb = new Date(b.timestamp)

        if (ta > tb)
            return 1
        else
            return 0
    }

    else return 0
})







export function new_user_obj({user_id, username, image_url, profile_description, timestamp}) {
    if (!user_id) throw `invalid user_id: "${user_id}"`
    else if (!username) throw `invalid username: "${username}"`
    else if (!image_url) throw `invalid image_url: "${image_url}"`
    else if (!timestamp) throw `invalid timestamp: "${timestamp}"`

    return { user_id, username, image_url, profile_description, timestamp }
}





export function new_notification_obj({notification_id, notification_title, notification_link, timestamp, user_id}) {
    if (!notification_id) throw `invalid notification_id: "${notification_id}"`
    else if (!notification_title) throw `invalid notification_title: "${notification_title}"`
    else if (!notification_link) throw `invalid notification_link: "${notification_link}"`
    else if (!timestamp) throw `invalid timestamp: "${timestamp}"`
    else if (!user_id) throw `invalid user_id: "${user_id}"`

    return {notification_id, notification_title, notification_link, timestamp, user_id}
}





export function new_question_obj({ question_id, title, description, user_id, timestamp }) {
    if (!question_id) throw `invalid question_id: "${question_id}"`
    else if (!title) throw `invalid title: "${title}"`
    else if (!description) throw `invalid description: "${description}"`
    else if (!user_id) throw `invalid user_id: "${user_id}"`
    else if (!timestamp) throw `invalid timestamp: "${timestamp}"`

    return { question_id, title, description, user_id, timestamp }
}





export function new_answer_obj({answer_id, text, user_id, question_id, vote_count, timestamp}) {
    if (!answer_id) throw `invalid answer_id: ${answer_id}`
    else if (!text) throw `invalid text: ${text}`
    else if (!user_id) throw `invalid user_id: ${user_id}`
    else if (!question_id) throw `invalid question_id: ${question_id}`
    else if (vote_count !== 0 && !vote_count) throw `invalid vote_count: ${vote_count}`
    else if (!timestamp) throw `invalid timestamp: ${timestamp}`

    return { answer_id, text, user_id, question_id, vote_count, timestamp }
}






export async function fetch_token_async(string_before_api_token) {
    if (!string_before_api_token) return null

    const idx = string_before_api_token.indexOf("?")+1
    if (!idx) return null

    const data = string_before_api_token.substring(idx)
    const [_, github_code] = data.match(/code=(.*)/)
    if (!github_code) return null

    const {data: {query_data: resStr, query_status}} = await axios.post(backend_url+"/cors", {
        url: github_get_token_url,
        method: 'POST',
        data: {
            client_id: github_client_id,
            client_secret: github_client_secret,
            code: github_code,
            redirect_uri: github_redirect_uri
        }
    })
    const [__, token] = resStr.match(/access_token=(.*?)&/)

    return token
}








export const get_user_info_async = wtc(async (token_promise) => {
    const token = await token_promise
    /* get the user data BEGIN */
    const get_data_url = "https://api.github.com/user"
    const res = await axios.get(get_data_url, {
        headers: {Authorization: `token ${token}`}
    })

    if (res.status !== 200) return null
    const {data: {login: username, avatar_url: image_url}} = res
    /* get the user data END */

    return {username, image_url}
})


export function Br({height}) {
    return (
        <div style={{flexBasis: `100%`, height: `${height || 0}px`}}></div>
    )
}







export function Navbar() {
    const pathname = window.location.pathname
    const dispatch = useDispatch()
    const [notification_icon_clicked, set_notification_icon_clicked] = React.useState(false)
    const current_user = useSelector(store => store.users.current_user)
    const [profile_icon_clicked, set_profile_icon_clicked] = React.useState(false)
    const history = useHistory()

    const handle_login_click = wtc(async () => {
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

        const user_data = await get_user_info_async(token)
        const {data} = await axios.post(`${backend_url}/users`, user_data)

        dispatch(users_actions.set_current_user(new_user_obj(data)))
        set_notification_icon_clicked(false)
        set_profile_icon_clicked(false)
    })





    return (
        <div id='navbar' className={`flex justify-between brder border-red-900 mt-10`}>
            <button className={``} onClick={handle_logo_click}>bufferoverflow</button>

            <div className={`flex`}>
                <div className={`relative`}>
                    {current_user && <button className={`mr-2`} onClick={handle_notification_icon_click}>noticon</button> }
                    {current_user && notification_icon_clicked && <Notifications />}
                </div>

                <div className={`relative`}>
                    {current_user ?
                        <button onClick={handle_profile_icon_click}>proficon</button>
                        : <button onClick={handle_login_click}>login</button>
                    }

                    {current_user && profile_icon_clicked && <Profile />}
                </div>
            </div>
        </div>
    )


    function handle_logo_click() {
        if (pathname !== '/') {
            history.push(`/`)
        }
    }

    /* show a dialog containing all the notifications */
    function handle_notification_icon_click() {
        set_profile_icon_clicked(false)
        set_notification_icon_clicked(prev => !prev)
    }

    function handle_profile_icon_click() {
        set_notification_icon_clicked(false)
        set_profile_icon_clicked(prev => !prev)
    }



    function Notifications() {
        const notifications = [...Array(10)].map(() => new_notification_obj({
            notification_id: 10,
            notification_title: `Somebody replied to your post`,
            notification_link: `http://google.com`,
            timestamp: new Date(`2021-08-27T08:02:00.490Z`) / 1000,
            user_id: 12,
        }))

        return (
            <div tabIndex={-1} className={`flex flex-col w-80 cursor-none max-h-80 overflow-scroll absolute top-10 right-0 bg-white border border-black`}>
                {notifications.map(({notification_title, timestamp, notification_id, notification_link}, i) => (
                    <button className={`notification_button flex justify-end`}
                        onClick={() => handle_notification_click(notification_link)}
                        key={i /*notification_id*/}
                    >
                        <h1 className={`notification_title`}>{notification_title}</h1>
                        <p>{timestamp}</p>
                    </button>
                ))}
            </div>
        )


        function handle_notification_click() {
            // func_args(1): the notification object

            // notification can be something like
            // notification {
            //   notification_id: 10,
            //   notification_title: Somebody replied to your post,
            //   notification_link: 20,
            //   timestamp: 2021-08-27T08:02:00.490Z,
            //   user_id: 12,
            // }

            // turn state.loading = true
            // history.push() to notification.notification_link
            // turn state.loading = false
        }
    }



    function Profile() {
        const handle_go_to_profile_click = () => {
            // turn state.loading = true
            // history.push() to /users/{id} page
            // turn state.loading = false

            dispatch(extras_actions.loading_on())
            history.push(`/users/${current_user.user_id}`)
        }

        const handle_logout_click = () => {
            // turn state.loading = true
            // remove user from the redux store
            // delete all tokens from localStorage
            // turn state.loading = false

            dispatch(users_actions.unset_current_user())
            localStorage.clear()
        }

        return (
            <div id='profile_dialog' tabIndex={-1} className={`flex p-3 flex-col w-80 cursor-none max-h-80 overflow-scroll absolute top-10 right-0 bg-white border border-black`}>
                <h1 id='profile_user_image' className={`text-center`}>user_image</h1>
                <h1 id='profile_user_name' className={`text-center`}>{current_user.username}</h1>
                <button id='profile_link' onClick={handle_go_to_profile_click}>go_to_profile</button>
                <button id='profile_logout_button' onClick={handle_logout_click}>logout</button>
            </div>
        )
    }
}
