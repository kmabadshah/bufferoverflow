/* keslint-disable */

import axios from 'axios'

export function new_user_obj({user_id, username, image_url, profile_description, timestamp}) {
    if (!user_id) throw new Error(`invalid user_id: "${user_id}"`)
    else if (!username) throw new Error(`invalid username: "${username}"`)
    else if (!image_url) throw new Error(`invalid image_url: "${image_url}"`)
    else if (!timestamp) throw new Error(`invalid timestamp: "${timestamp}"`)

    return { user_id, username, image_url, profile_description, timestamp }
}

export function new_notification_obj({notification_id, notification_title, notification_link, timestamp, user_id}) {
    if (!notification_id) throw new Error(`invalid notification_id: "${notification_id}"`)
    else if (!notification_title) throw new Error(`invalid notification_title: "${notification_title}"`)
    else if (!notification_link) throw new Error(`invalid notification_link: "${notification_link}"`)
    else if (!timestamp) throw new Error(`invalid timestamp: "${timestamp}"`)
    else if (!user_id) throw new Error(`invalid user_id: "${user_id}"`)

    return {notification_id, notification_title, notification_link, timestamp, user_id}
}


     // question_id serial primary key,
     // title varchar(100) unique not null,
     // description varchar(1000) unique not null,
     // user_id int,
     // timestamp timestamptz default current_timestamp not null,

export function new_question_obj({ question_id, title, description, user_id, timestamp }) {
    if (!question_id) throw new Error(`invalid question_id: "${question_id}"`)
    else if (!title) throw new Error(`invalid title: "${title}"`)
    else if (!description) throw new Error(`invalid description: "${description}"`)
    else if (!user_id) throw new Error(`invalid user_id: "${user_id}"`)
    else if (!timestamp) throw new Error(`invalid timestamp: "${timestamp}"`)

    return { question_id, title, description, user_id, timestamp }
}

export const backend_url = 'http://localhost:8000'
const github_client_id = "24bf0d137961d6038ffb"
const github_client_secret = '9698017268cd16f3b72dd169646826ac0924dba4'
const github_redirect_uri = 'http://localhost:3000/oauth_consent'
const github_get_token_url = 'https://github.com/login/oauth/access_token'

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

export async function get_user_info_async(token_promise) {
    try {
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
    } catch(e) {
        if (e.response)
            console.log("REQUEST ERROR: ", e.response)
        else
            console.log("ERROR: ", e)
    }
}










