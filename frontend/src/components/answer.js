import React from 'react'
import axios from 'axios'
import {backend_url, Br, wtc, error_log} from './utilities'
import {useSelector, useDispatch} from 'react-redux'
import {useHistory} from 'react-router-dom'
import PropTypes from 'prop-types'
import {extras_actions, users_actions, 
  already_voted_answers_actions, answers_actions, 
  questions_actions, answer_comments_actions
} from '../index.js'
import AnswerComment from './answer_comment.js'

Answer.propTypes = {
  answer_data: PropTypes.object.isRequired
}
export default function Answer({answer_data}) {
  const
  [loading, set_loading] = React.useState(true),
  [answer_editable, set_answer_editable] = React.useState(false),
  [show_comment_dialog, set_show_comment_dialog] = React.useState(false),
  history = useHistory(),
  dispatch = useDispatch(),
  answer_text_ref = React.useRef(),

  current_user = useSelector(store => store.users.current_user),
  random_error = useSelector(store => store.extras.random_error),
  comments = useSelector(
    store => store
    .answer_comments
    .filter(c => c.answer_id == answer_data.answer_id)),

  already_voted_answer = useSelector(store => store.already_voted_answers.find(ava => {
    return ava.answer_id == answer_data.answer_id
      && ava.user_id == (current_user && current_user.user_id)
  })) || {
    answer_id: answer_data.answer_id,
    user_id: current_user && current_user.user_id,
    vote_flag: undefined
  },
  vote_flag = already_voted_answer.vote_flag,
  answer_owner_data = useSelector(store => {
    return store.users.list.find(u => u.user_id === answer_data.user_id) 
  }) || {};






  React.useEffect(() => (async() => { try { if (loading) {
    // if current_user has been modified at this point, 
    // it's value will be either null or an object
    if (current_user !== null) {
      // fetch vote flag, if any
      const res = await axios.get(`
                      ${backend_url}/already_voted_answers/${answer_data.answer_id}/${current_user.user_id}
                `, {validateStatus: (status) => status < 500})
      if (res.status === 200) {
        dispatch(already_voted_answers_actions.update({
          answer_id: answer_data.answer_id, 
          user_id: current_user.user_id,
          vote_flag: res.data.vote_flag
        }))

      } else if (res.status !== 204)
        throw res
    }

    // if no answer_owner_data, fetch
    if (Object.keys(answer_owner_data).length === 0) {
      // get the answer owner's data
      let res = await axios.post(`${backend_url}/users`, {
        user_id: answer_data.user_id
      })
      if (res.status !== 200) throw res
      dispatch(users_actions.update(res.data))
    }

    // fetch answer comments
    const res = await axios.get(`${backend_url}/answer_comments/answer/${answer_data.answer_id}`)
    if (res.status !== 200) {
      throw res
    }
    dispatch(answer_comments_actions.add(res.data))
    set_loading(false)

  }} catch(e) {error_log(e)} })() ,[])






  const handle_edit_answer_submit_click = wtc(async() => {
    if (answer_text_ref.current.textContent && answer_text_ref.current.textContent !== answer_data.text) {
      const res = await axios.put(`${backend_url}/answers/${answer_data.answer_id}`, {text: answer_text_ref.current.textContent})
      if (res.status !== 204)
        throw res
      dispatch(answers_actions.update({
        ...answer_data, 
        text: answer_text_ref.current.textContent
      }))
    }

    set_answer_editable(false)
    answer_text_ref.current.blur()

    answer_text_ref.current.classList.remove(`border`)
    answer_text_ref.current.classList.remove(`border-red-900`)
  })








  /*
   *
   * if not voted, increment and lock
   * if downvoted already, double increment and lock
   * if upvoted already, decrement and unlock
   *
   */
  const handle_answer_vote_up_click = wtc(async() => {
    if (!current_user)
      return

    if (vote_flag === `upvoted`) {
      // decrement
      let res = await axios.get(`${backend_url}/decrement_vote/answers/${answer_data.answer_id}`)
      if (res.status !== 204) throw res
      dispatch(answers_actions.update({
        ...answer_data, 
        vote_count: answer_data.vote_count-1
      }))

      // unlock
      res = await axios.delete(`${backend_url}/already_voted_answers/${answer_data.answer_id}/${current_user.user_id}`)
      if (res.status !== 204) throw res
      dispatch(already_voted_answers_actions.delete(already_voted_answer))
    }

    else if (!vote_flag || vote_flag === `downvoted`) {
      let current_vote_count = answer_data.vote_count

      // increment
      let res = await axios.get(`${backend_url}/increment_vote/answers/${answer_data.answer_id}`)
      if (res.status !== 204) throw res
      current_vote_count++;

      // lock
      res = await axios.get(`${backend_url}/already_voted_answers/${answer_data.answer_id}/${current_user.user_id}/upvoted`)
      if (res.status !== 204) throw res
      dispatch(already_voted_answers_actions.update({
        ...already_voted_answer,
        vote_flag: `upvoted`
      }))

      if (vote_flag === `downvoted`) {
        // increment again
        res = await axios.get(`${backend_url}/increment_vote/answers/${answer_data.answer_id}`)
        if (res.status !== 204) throw res
        current_vote_count++;
      }
      dispatch(answers_actions.update({
        ...answer_data, 
        vote_count: current_vote_count
      }))
    }
  })









  /*
   *
   * if not voted, decrement and lock
   * if upvoted already, double decrement and lock
   * if downvoted already, increment and unlock
   *
   */
  const handle_answer_vote_down_click = wtc(async() => {
    if (!current_user)
      return

    if (vote_flag === `downvoted`) {
      // increment
      let res = await axios.get(`${backend_url}/increment_vote/answers/${answer_data.answer_id}`)
      if (res.status !== 204) throw res
      dispatch(answers_actions.update({
        ...answer_data, 
        vote_count: answer_data.vote_count+1
      }))

      // unlock
      res = await axios.delete(`${backend_url}/already_voted_answers/${answer_data.answer_id}/${current_user.user_id}`)
      if (res.status !== 204) throw res
      dispatch(already_voted_answers_actions.delete(already_voted_answer))
    }

    else if (!vote_flag || vote_flag === `upvoted`) {
      let current_vote_count = answer_data.vote_count

      // decrement
      let res = await axios.get(`${backend_url}/decrement_vote/answers/${answer_data.answer_id}`)
      if (res.status !== 204) throw res
      current_vote_count--;

      // lock
      res = await axios.get(`${backend_url}/already_voted_answers/${answer_data.answer_id}/${current_user.user_id}/downvoted`)
      if (res.status !== 204) throw res
      dispatch(already_voted_answers_actions.update({
        ...already_voted_answer,
        vote_flag: `downvoted`
      }))

      if (vote_flag === `upvoted`) {
        // decrement again
        res = await axios.get(`${backend_url}/decrement_vote/answers/${answer_data.answer_id}`)
        if (res.status !== 204) throw res
        current_vote_count--;
      }

      dispatch(answers_actions.update({
        ...answer_data, 
        vote_count: current_vote_count
      }))
    }
  })















  if (random_error) {
    return `something went wrong, please try refreshing the page`
  }

  if (loading)
    return <p>loading...</p>


  else return (<>
    <div className={`flex mt-40`}>
      <div className={`flex flex-col align-center border h-[max-content] border-red-900`}>
        {/* vote_up_icon */}
        <button onClick={handle_answer_vote_up_click}>vote_up {vote_flag === `upvoted` && `^`}</button>

        {/* vote_count */}
        <p className={`text-center`}>{answer_data.vote_count}</p>

        {/* vote down icon */}
        <button onClick={handle_answer_vote_down_click}>vote_down {vote_flag === `downvoted` && `v`}</button>
      </div>

      {/* answer text */}
      <div className={`ml-20 overflow-x-auto h-80 flex-grow`} ref={answer_text_ref} suppressContentEditableWarning={true}  contentEditable={answer_editable} >{answer_data.text}</div>
    </div>

    <div className={`boder border-red-900 flex flex-wrap justify-end mt-20`}>
      {current_user && current_user.username === answer_owner_data.username &&  
      <button
        className={`ml-40 w-16 mt-2 h-12`}
        onClick={answer_editable ? handle_edit_answer_submit_click : handle_edit_answer_click}
      >
        {answer_editable ? `submit` : `edit`}
      </button>
      }
      {current_user &&
      <button
        className={`ml-10 mt-2 h-12`}
        onClick={handle_comment_click}
      >
        comment_button
      </button>
      }

      <div className={`h-16 w-16 mr-5 flex ml-auto items-center border border-red-900`}>
        <p className={`text-center`}>usrimg</p>
      </div>
      <button className={`my-auto`} onClick={handle_username_click}>{answer_owner_data.username}</button>
      <Br />
      <p className={`mt-5`}>{answer_data.timestamp}</p>
      <Br />


      {show_comment_dialog && (
        <form onSubmit={handle_comment_submit_click} className={`ml-40 mt-10 flex flex-col w-full`}>
          <textarea className={` border border-red-900  w-full`} rows={8}></textarea>

          <div className={`flex mt-3`}>
            <button className={`border ml-auto border-red-900  `} onClick={handle_comment_cancel_click}>Cancel</button>
            <button className={`border border-red-900  ml-5`}>Submit</button>
          </div>
        </form>
      )}

      {comments.map(c => (
        <AnswerComment comment_data={c} key={c.comment_id} />
      ))}
    </div>
  </>)

  function handle_username_click() {
    history.push(`/users/${answer_owner_data.user_id}`)
  }

  function handle_comment_click() {
    set_show_comment_dialog(prev => !prev)
  }

  function handle_comment_cancel_click() {
    set_show_comment_dialog(false)
  }

  async function handle_comment_submit_click(e) { try {
    e.preventDefault()
    set_show_comment_dialog(false)

    if (!e.target[0].value) {
      return 
    }
    const res = await axios.post(`${backend_url}/answer_comments/${answer_data.answer_id}`, {
      text: e.target[0].value,
      user_id: current_user.user_id
    })
    if (res.status !== 200) {
      throw res
    }

    dispatch(answer_comments_actions.add(res.data))

  }catch(e){error_log(e)}}

  function handle_edit_answer_click() {
    // editable=on
    set_answer_editable(true)
    answer_text_ref.current.classList.add(`border`)
    answer_text_ref.current.classList.add(`border-red-900`)

    answer_text_ref.current.focus()
  }

}






