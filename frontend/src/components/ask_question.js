import React from 'react'
import {backend_url} from './utilities'
import {useSelector} from 'react-redux'
import axios from 'axios'
import {useHistory} from 'react-router-dom'

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
    const current_user = useSelector(store => store.users.current_user)
    const history = useHistory()

    return (
        <form className={`flex flex-col my-10 mx-10 h-screen brder border-red-900`} method={`post`} onSubmit={handle_submit}>
            {/* row-1 */}
            <h1 className={`text-center text-5xl`}>Ask a question</h1>

            {/* row-2 */}
            <input name={`question_title`}  placeholder={`Question title goes here`} className={`border border-red-900  mt-10 w-full h-20`} type={`text`} />

            {/* row-3 */}
            <textarea name={`question_title`} className={`w-full mt-10 h-1/2 border border-red-900`} placeholder={`Question description goes here`}></textarea>

            {/* row-4 */}
            <button type={`submit`} className={`w-full p-5 bg-green-300 mt-5 hover:bg-green-400`}>Submit</button>
        </form>
    )

    async function handle_submit(e) {
        try {
            e.preventDefault()

            let [question_title, question_description] = Object.values(e.target)
            question_title = question_title.value
            question_description = question_description.value

            if (!question_title || !question_description) {
                return
            }

            // submit the question
            // go to the questions/{question_id} page
            // when user visits / fetch all the questions and display

            let question_obj = {
                title: question_title,
                description: question_description,
                user_id: current_user.user_id
            }

            const res = await axios.post(`${backend_url}/questions`, question_obj)

            if (res.status !== 200) {
                return
            }

            question_obj = res.data
            history.push(`questions/${question_obj.question_id}`)

        } catch(e) {
            if (e.response)
                console.log("REQUEST ERROR: ", e.response)
            else
                console.log("ERROR: ", e)
        }
    }
}
