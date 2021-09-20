import React from 'react';
import {backend_url, wtc, Navbar, get_user_info_async, new_user_obj, error_log} from './utilities'
import {useHistory} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import {extras_actions, users_actions, questions_actions} from '../index.js'
import {ws} from '../app.js'
import axios from 'axios'

/*
 *
 * a component for the home page
 * url: /
 * has the following sections
 * row-1: navbar(left: logo, right: notification and profile icon)
 * row-2: ask question button at far right
 * row-3: column with all questions
 *
 * */
export default function Home() {
    const dispatch = useDispatch()
    const history = useHistory()
    const [loading, set_loading] = React.useState(true)
    const {extras: {random_error, fetched_all_questions}, users: {current_user}, questions} = useSelector(store => store)




    React.useEffect(() => (async() => { try {
        const listener = async(e) => { try {
            const {table} = JSON.parse(e.data)

            console.log(JSON.parse(e.data))
            if (table === `questions`) {
                const res = await axios.get(`${backend_url}/questions`)
                if (res.status !== 200)
                    throw res

                dispatch(questions_actions.set(res.data))
                ws.send(JSON.stringify({table, signal: `ack`}))
            }
        } catch(e) {error_log(e)} }
        ws.addEventListener(`message`, listener)

        if (!current_user && localStorage.getItem('github_api_token')) {
            const user_data = await get_user_info_async(localStorage.getItem('github_api_token'))
            const {data} = await axios.post(`${backend_url}/users`, user_data)
            dispatch(users_actions.set_current_user(new_user_obj(data)))
        }

        if (!fetched_all_questions) {
            const res = await axios.get(`${backend_url}/questions`)
            if (res.status !== 200)
                throw res

            dispatch(questions_actions.set(res.data))
            dispatch(extras_actions.fetched_all_questions_on())
        }
        set_loading(false)

    } catch(e) {error_log(e)} })(), [])








    function AskQuestionButton()  {
        return (
            <div className={`flex justify-end boder border-red-900 mt-10`}>
                <button className={``} onClick={handle_ask_question_click}>Ask Question</button>
            </div>
        )

        function handle_ask_question_click() {
            history.push(`/ask_question`)
        }
    }



    function Questions() {
        const on_question_click = (question_id) => {
            history.push(`/questions/${question_id}`)
        }

        return (
            <div className={`flex flex-col boder border-red-900 mt-10`}>
                {questions.map(({title, timestamp, question_id}) => (
                    <button className={`flex justify-between mt-2`} onClick={() => on_question_click(question_id)} key={question_id}>
                        <p>user_image_url</p>
                        <h1>{title}</h1>
                        <p>{timestamp}</p>
                    </button>
                ))}
            </div>
        )
    }




    if (loading) return `loading...`
    else if (random_error) return `something went wrong, please try refreshing the page`
    else return (
        <div className={`flex flex-col h-screen container mx-auto`}>
            {/* row-1 */}
            <Navbar />

            {/* row-2 */}
            {current_user && <AskQuestionButton />}

            {/* row-3 */}
            <Questions />
        </div>
    );
}
