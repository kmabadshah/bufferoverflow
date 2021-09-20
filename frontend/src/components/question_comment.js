import React from 'react'
import axios from 'axios'
import {backend_url, Navbar, new_answer_obj, Br, wtc, error_log} from './utilities'
import {extras_actions, question_comments_actions, users_actions, already_voted_question_comments_actions} from '../index.js'
import {useSelector, useDispatch} from 'react-redux'
import PropTypes from 'prop-types'


QuestionComment.propTypes = {
  comment_data: PropTypes.object.isRequired
}
export default function QuestionComment({comment_data}) {
  const 
  [loading, set_loading] = React.useState(true),
    dispatch = useDispatch(),
    comment_text_ref = React.useRef(),
    [edit_comment_clicked, set_edit_comment_clicked] = React.useState(false),

    /* get the flag using useSelector() */
    current_user = useSelector(store => store.users.current_user),
    random_error = useSelector(store => store.extras.random_error),
    already_voted_question_comment = useSelector(store => store.already_voted_question_comments.find(qc => {
      return qc.comment_id === comment_data.comment_id 
        && qc.user_id === (current_user && current_user.user_id)
    })) || {
      comment_id: comment_data.comment_id,
      user_id: current_user && current_user.user_id,
      vote_flag: null
    },
    vote_flag = already_voted_question_comment.vote_flag,
    comment_owner_data = useSelector(store => {
      return store.users.list.find(u => u.user_id === comment_data.user_id) 
    }) || {};








  React.useEffect(() => (async() => { try {
    // fetch comment_owner_data
    let res = await axios.post(`${backend_url}/users`, {user_id: comment_data.user_id})
    if (res.status !== 200) throw res
    dispatch(users_actions.update(res.data))

    // fetch and update vote flag, if any
    res = await axios.get(`${backend_url}/already_voted_question_comments/${comment_data.comment_id}/${current_user.user_id}`)
    if (res.status !== 200 && res.status !== 204) 
      throw res
    if (res.status === 200) 
      dispatch(already_voted_question_comments_actions.update(res.data))

    set_loading(false)
  } catch(e) {error_log(e)} })(), [])








  // if not voted, increment and lock
  // if already downvoted, double increment and lock
  // if already upvoted, decrement and unlock
  const handle_upvote_click = wtc(async () => {
    if (!current_user)
      return 

    if (!vote_flag || vote_flag === `downvoted`) {
      let current_vote_count = comment_data.vote_count

      // lock
      let res = await axios.get(`${backend_url}/already_voted_question_comments/${comment_data.comment_id}/${current_user.user_id}/upvoted`)
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
      let res = await axios.get(`${backend_url}/already_voted_question_comments/${comment_data.comment_id}/${current_user.user_id}/downvoted`)
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




  if (random_error) {
    return `something went wrong, please try refreshing the page`
  }

  if (loading) {
    return `loading...`
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
          {current_user && current_user.username === comment_owner_data.username && (
            <button 
              className={`ml-10 inline bg-blue-400`} 
              onClick={edit_comment_clicked ? handle_edit_comment_submit_click : handle_edit_comment_click}
            >
              {edit_comment_clicked ? `submit` : `edit`}
            </button>
          )}
          <p className={`ml-3 inline bg-red-900`}>{comment_owner_data.username}</p>
          <p className={`ml-3 inline bg-green-900`}>{comment_data.timestamp}</p>
        </div>
      </div>
    </div>
  )
}
