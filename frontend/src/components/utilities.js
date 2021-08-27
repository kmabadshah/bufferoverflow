/* keslint-disable */

import axios from 'axios'

export function new_user_obj({user_id, username, image_url, profile_description, timestamp}) {
    if (!user_id) throw new Error(`invalid user_id: "${user_id}"`)
    else if (!username) throw new Error(`invalid username: "${username}"`)
    else if (!image_url) throw new Error(`invalid image_url: "${image_url}"`)
    else if (!timestamp) throw new Error(`invalid timestamp: "${timestamp}"`)

    return { user_id, username, image_url, profile_description, timestamp }
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










