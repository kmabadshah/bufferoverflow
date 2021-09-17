import React from 'react'
import {backend_url} from './utilities'
import {useSelector, useDispatch} from 'react-redux'
import axios from 'axios'
import {extras_actions, users_actions, questions_actions} from '../index.js'
import {useHistory} from 'react-router-dom'
import {Navbar, get_user_info_async,wtc, new_user_obj} from './utilities'

/*
 *
 * a page for editing and submitting a question
 * url: /ask_question
 * contains the following sections
 * a small_height bar to type the title in
 * a big_height bar to type the description
 * a submit button
 *
 */


export default function AskQuestion() {
    const history = useHistory(),
    dispatch = useDispatch(),
    [loading, set_loading] = React.useState(true),
    {extras: {random_error, fetched_all_questions}, users: {current_user}, questions} = useSelector(store => store);

    React.useEffect(() => wtc(async () => {
        if (!current_user && localStorage.getItem('github_api_token')) {
            const github_api_token = localStorage.getItem('github_api_token')
            if (!github_api_token)
                return history.push(`/`)

            const user_data = await get_user_info_async(github_api_token)
            const {data} = await axios.post(`${backend_url}/users`, user_data)
            dispatch(users_actions.set_current_user(new_user_obj(data)))
        }

        set_loading(false)
    })(() => dispatch(extras_actions.random_error_on())), [])

    
    const handle_submit = wtc(async (e) => {
        e.preventDefault()

        let [question_title, question_description] = Object.values(e.target)
        question_title = question_title.value
        question_description = question_description.value

        if (!question_title || !question_description)
            return

        let question_obj = {
            title: question_title,
            description: question_description,
            user_id: current_user.user_id
        }

        const res = await axios.post(`${backend_url}/questions`, question_obj)
        if (res.status !== 200)
            return
        question_obj = res.data
        history.push(`questions/${question_obj.question_id}`)
    })

    if (loading) return `loading...`
    else if (random_error) return `something went wrong, please try refreshing the page`
    else return (
        <div  className={`flex flex-col mx-10 h-screen brder border-red-900`} >
            <form method={`post`} onSubmit={handle_submit}>
                {/* row-1 */}
                <h1 className={`text-center text-5xl mt-10`}>Ask a question</h1>

                {/* row-2 */}
                <input name={`question_title`}  placeholder={`Question title goes here`} className={`border border-red-900  mt-10 w-full h-20`} type={`text`} />

                {/* row-3 */}
                <textarea name={`question_title`} className={`w-full mt-10 h-1/2 border border-red-900`} placeholder={`Question description goes here`}></textarea>

                {/* row-4 */}
                <button type={`submit`} className={`w-full p-5 bg-green-300 mt-5 hover:bg-green-400`}>Submit</button>
            </form>
        </div>
    )

}
