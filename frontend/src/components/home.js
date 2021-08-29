import React from 'react';
import {new_question_obj} from './utilities'
import {Link, useHistory} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import {extras_actions, users_actions} from '../index.js'
import {Navbar} from './utilities'

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

    return (
        <div className={`flex flex-col h-screen container mx-auto`}>
            {/* row-1 */}
            <Navbar />

            {/* row-2 */}
            <AskQuestionButton />

            {/* row-3 */}
            <Questions />
        </div>
    );



    function AskQuestionButton()  {
        return (
            <div className={`flex justify-end boder border-red-900 mt-10`}>
                <button className={``} onClick={handle_ask_question_click}>Ask Question</button>
            </div>
        )

        function handle_ask_question_click() {
            // loading=on
            // go to /ask_question page
            // loading=off

            dispatch(extras_actions.loading_on())
            history.push(`/ask_question`)
        }
    }




    function Questions() {
        /*
         *
         * a clickable question has the following sections
         * poster's image at the left, the title at the middle, the timestamp at the right
         *
         * */

        const questions = [...Array(10)].map(() => new_question_obj({
            question_id: 10,
            title: `This is a question about something that doesn't exist`,
            description: `This is the description for the question about something that doesn't exist`,
            user_id: 11,
            timestamp: new Date(`2021-08-27T08:02:00.490Z`) / 1000,
        }))

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

        function on_question_click(question_id) {
            // loading=on
            // go to /questions/{id}
            // loading=off

            dispatch(extras_actions.loading_on())
            history.push(`/questions/${question_id}`)
        }
    }
}
