import React from 'react'
import axios from 'axios'
import {backend_url, Navbar, new_answer_obj, Br, wtc} from './utilities'
import {extras_actions, question_comments_actions, already_voted_question_comments_actions} from '../index.js'
import {useSelector, useDispatch} from 'react-redux'

export default function QuestionComment({comment_data}) {
    const 
    dispatch = useDispatch(),
    comment_text_ref = React.useRef(),

    /* get the flag using useSelector() */
    current_user = useSelector(store => store.users.current_user),
    already_voted_question_comment = useSelector(store => store.already_voted_question_comments.find(qc => {
        return qc.comment_id === comment_data.comment_id 
        && qc.user_id === (current_user && current_user.user_id)
    })) || {
        comment_id: comment_data.comment_id,
        user_id: current_user && current_user.user_id,
        vote_flag: null
    },
    vote_flag = already_voted_question_comment.vote_flag,
    [edit_comment_clicked, set_edit_comment_clicked] = React.useState(false);





    React.useEffect(() => { wtc(async() => {
        // fetch and update vote flag, if any
        const res = await axios.get(`${backend_url}/already_voted_question_comments/${comment_data.comment_id}/${comment_data.user_id}`)
        if (res.status !== 200 && res.status !== 204)
            throw res
        if (res.status === 200)
            dispatch(already_voted_question_comments_actions.update(res.data))

    })(() => dispatch(extras_actions.random_error_on())) }, [])








    // if not voted, increment and lock
    // if already downvoted, double increment and lock
    // if already upvoted, decrement and unlock
    const handle_upvote_click = wtc(async () => {
        if (!current_user)
            return 

        if (!vote_flag || vote_flag === `downvoted`) {
            let current_vote_count = comment_data.vote_count

            // lock
            let res = await axios.get(`${backend_url}/already_voted_question_comments/${comment_data.comment_id}/${comment_data.user_id}/upvoted`)
            if (res.status !== 204)
                throw res
            dispatch(already_voted_question_comments_actions.update({
                ...already_voted_question_comment, 
                vote_flag: `upvoted`
            }))

            // increment
            res = await axios.get(`${backend_url}/increment_vote/question_comments/${comment_data.comment_id}`)
            if (res.status !== 204)
                throw res
            current_vote_count++;

            if (vote_flag === `downvoted`) {
                // increment
                res = await axios.get(`${backend_url}/increment_vote/question_comments/${comment_data.comment_id}`)
                if (res.status !== 204)
                    throw res
                current_vote_count++;
            }

            dispatch(question_comments_actions.update({...comment_data, vote_count: current_vote_count}))
        }

        else if (vote_flag === `upvoted`) {
            // decrement
            let res = await axios.get(`${backend_url}/decrement_vote/question_comments/${comment_data.comment_id}`)
            if (res.status !== 204)
                throw res
            dispatch(question_comments_actions.update({...comment_data, vote_count: comment_data.vote_count-1}))

            // unlock
            res = await axios.delete(`${backend_url}/already_voted_question_comments/${comment_data.comment_id}/${comment_data.user_id}`)
            if (res.status !== 204)
                throw res
            dispatch(already_voted_question_comments_actions.delete(already_voted_question_comment))
        }
    })








    // if not voted, decrement and lock
    // if already upvoted, double decrement and lock
    // if already downvoted, increment and unlock
    const handle_downvote_click = wtc(async () => {
        if (!current_user)
            return 
        if (!vote_flag || vote_flag === `upvoted`) {
            let current_vote_count = comment_data.vote_count

            // lock
            let res = await axios.get(`${backend_url}/already_voted_question_comments/${comment_data.comment_id}/${comment_data.user_id}/downvoted`)
            if (res.status !== 204)
                throw res
            dispatch(already_voted_question_comments_actions.update({...already_voted_question_comment, vote_flag: `downvoted`}))

            // increment
            res = await axios.get(`${backend_url}/decrement_vote/question_comments/${comment_data.comment_id}`)
            if (res.status !== 204)
                throw res
            current_vote_count--;

            if (vote_flag === `upvoted`) {
                // decrement
                res = await axios.get(`${backend_url}/decrement_vote/question_comments/${comment_data.comment_id}`)
                if (res.status !== 204)
                    throw res
                current_vote_count--;
            }

            dispatch(question_comments_actions.update({...comment_data, vote_count: current_vote_count}))
        }

        else if (vote_flag === `downvoted`) {
            // increment
            let res = await axios.get(`${backend_url}/increment_vote/question_comments/${comment_data.comment_id}`)
            if (res.status !== 204)
                throw res
            dispatch(question_comments_actions.update({...comment_data, vote_count: comment_data.vote_count+1}))

            // unlock
            res = await axios.delete(`${backend_url}/already_voted_question_comments/${comment_data.comment_id}/${comment_data.user_id}`)
            if (res.status !== 204)
                throw res
            dispatch(already_voted_question_comments_actions.delete(already_voted_question_comment))
        }
    })







    const handle_edit_comment_submit_click = wtc(async () => {
        const text = comment_text_ref.current.textContent

        if (!text || text === `something...`) {
            comment_text_ref.current.textContent = `something...`
            comment_text_ref.current.focus()
        }

        if (text === comment_data.text)
            return set_edit_comment_clicked(false)

        const res = await axios.put(`${backend_url}/question_comments/${comment_data.comment_id}`, {
            text: text
        })

        if (res.status === 200)
            comment_data.text = text

        comment_text_ref.current.blur()
        set_edit_comment_clicked(false)
    })



    function handle_edit_comment_click() {
        set_edit_comment_clicked(true)
        comment_text_ref.current.focus()
    }







    return (
        <div className={`ml-80 mt-10 flex`}>
            <div className={`flex flex-col`}>
                <button onClick={handle_upvote_click}>up {vote_flag === `upvoted` && `^`}</button>
                <p>{comment_data.vote_count}</p>
                <button onClick={handle_downvote_click}>down {vote_flag === `downvoted` && `v`}</button>
            </div>

            <div className={`flex flex-col`}>
                <div className={`ml-10 `}>
                    <div
                        contentEditable={edit_comment_clicked}
                        style={{overflowWrap: `anywhere`}}
                        ref={comment_text_ref}
                        tabIndex={100}
                        suppressContentEditableWarning={true}
                        className={`inline ${edit_comment_clicked ? `border border-red-900` : ``}`}
                    >
                        {comment_data.text}
                    </div>
                    <button className={`ml-10 inline bg-blue-400`} onClick={edit_comment_clicked ? handle_edit_comment_submit_click : handle_edit_comment_click}>{edit_comment_clicked ? `submit` : `edit`}</button>
                    <p className={`ml-3 inline bg-red-900`}>anonymous</p>
                    <p className={`ml-3 inline bg-green-400`}>{comment_data.timestamp}</p>
                </div>
            </div>
        </div>
    )
}
