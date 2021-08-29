import React from 'react'
import {useParams} from 'react-router-dom'
import axios from 'axios'
import {backend_url, Navbar} from './utilities'
import {useSelector} from 'react-redux'

/*
 *
 * a page for one single question and all it's answers
 * url: /questions/{id}
 * questions and answers are upvotable
 * contains the following sections
 * row-1: title
 * row-2: username, timestamp
 * row-3: vote_counter on the left, description on the right
 * row-4: answer_button on the left, (user_image, username) on the right
 * row-5: all_answers
 *
 * one answer has the following sections
 * row-1: vote_counter on the left, description on the right
 * row-2(far-right): user_image, username
 *
*/

export default function Question() {
    const [loading, set_loading] = React.useState(true)
    const [page_dont_exist, set_page_dont_exist] = React.useState(false)
    const [question_data, set_question_data] = React.useState()
    const {question_id} = useParams()
    const current_user = useSelector(store => store.users.current_user)

    React.useEffect(() => {
        (async () => {
            try {
                const res = await axios.get(`${backend_url}/questions/${question_id}`)

                set_question_data(res.data)
                set_loading(false)
            } catch(e) {
                set_page_dont_exist(true)
                set_loading(false)
                return
            }
        })()
    }, [])

    if (loading) {
        return `loading`
    }

    if (page_dont_exist) {
        return `this page doesn't exist`
    }

    return (
        <div className={`flex flex-col container mx-auto`}>
            <Navbar />
            <h1 className={`text-5xl mt-10`}>{question_data.title}</h1>

            <div className={`flex mt-5`}>
                <p className={`mr-5`}>by: {current_user.username}</p>
                <p>at: {question_data.timestamp}</p>
            </div>

            {/* vote counter */}
            <div className={`flex mt-20`}>
                <div className={`flex flex-col mr-20`}>
                    {/* vote_up_icon */}
                    <p>vote_up</p>

                    {/* vote_count */}
                    <p>vote_count</p>

                    {/* vote_down_icon */}
                    <p>vote_down</p>
                </div>

                {/* question_description */}
                <div>{question_data.description}</div>
            </div>
        </div>
    )
}
