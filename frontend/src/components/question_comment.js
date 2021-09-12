import React from 'react'
import axios from 'axios'
import {backend_url, Navbar, new_answer_obj, Br, wtc} from './utilities'
import {extras_actions} from '../index.js'
import {useSelector, useDispatch} from 'react-redux'

export default function QuestionComment({comment_obj}) {
  const [comment_data, set_comment_data] = React.useState(comment_obj)
  const [edit_comment_clicked, set_edit_comment_clicked] = React.useState(false)
  const [vote_flag, set_vote_flag] = React.useState(null)
  const random_error = useSelector(store => store.extras.random_error)
  const dispatch = useDispatch()
  const comment_text_ref = React.useRef()

  React.useEffect(() => {
    wtc(async() => {
      // fetch vote flag, if any
      const res = await axios.get(`${backend_url}/already_voted_question_comments/${comment_data.comment_id}/${comment_data.user_id}`)
      if (res.status === 200)
      {
        set_vote_flag(res.data.vote_flag)
      }
    })(() => {
      dispatch(extras_actions.random_error_on())
    })
  }, [])

  const handle_upvote_click = wtc(async () => {
    // if not voted, increment and lock
    // if already downvoted, double increment and lock
    // if already upvoted, decrement and unlock

    if (!vote_flag || vote_flag === `downvoted`)
    {
      let current_vote_count = comment_data.vote_count

      // lock
      let res = await axios.get(`${backend_url}/already_voted_question_comments/${comment_data.comment_id}/${comment_data.user_id}/upvoted`)
      if (res.status !== 204)
      {
        throw new Error(res)
      }
      set_vote_flag(`upvoted`)

      // increment
      res = await axios.get(`${backend_url}/increment_vote/question_comments/${comment_data.comment_id}`)
      if (res.status !== 204)
      {
        throw new Error(res)
      }
      current_vote_count++;

      if (vote_flag === `downvoted`)
      {
        // increment
        res = await axios.get(`${backend_url}/increment_vote/question_comments/${comment_data.comment_id}`)
        if (res.status !== 204)
        {
          throw new Error(res)
        }
        current_vote_count++;
      }

      set_comment_data({...comment_data, vote_count: current_vote_count})
    }

    else if (vote_flag === `upvoted`)
    {
      // decrement
      let res = await axios.get(`${backend_url}/decrement_vote/question_comments/${comment_data.comment_id}`)
      if (res.status !== 204)
      {
        throw new Error(res)
      }
      set_comment_data({...comment_data, vote_count: comment_data.vote_count-1})

      // unlock
      res = await axios.delete(`${backend_url}/already_voted_question_comments/${comment_data.comment_id}/${comment_data.user_id}`)
      if (res.status !== 204)
      {
        throw new Error(res)
      }

      set_vote_flag(null)
    }
  })

  const handle_downvote_click = wtc(async () => {
    // if not voted, decrement and lock
    // if already upvoted, double decrement and lock
    // if already downvoted, increment and unlock

    if (!vote_flag || vote_flag === `upvoted`)
    {
      let current_vote_count = comment_data.vote_count

      // lock
      let res = await axios.get(`${backend_url}/already_voted_question_comments/${comment_data.comment_id}/${comment_data.user_id}/downvoted`)
      if (res.status !== 204)
      {
        throw new Error(res)
      }
      set_vote_flag(`downvoted`)

      // increment
      res = await axios.get(`${backend_url}/decrement_vote/question_comments/${comment_data.comment_id}`)
      if (res.status !== 204)
      {
        throw new Error(res)
      }
      current_vote_count--;

      if (vote_flag === `upvoted`)
      {
        // decrement
        res = await axios.get(`${backend_url}/decrement_vote/question_comments/${comment_data.comment_id}`)
        if (res.status !== 204)
        {
          throw new Error(res)
        }
        current_vote_count--;
      }

      set_comment_data({...comment_data, vote_count: current_vote_count})
    }

    else if (vote_flag === `downvoted`)
    {
      // increment
      let res = await axios.get(`${backend_url}/increment_vote/question_comments/${comment_data.comment_id}`)
      if (res.status !== 204)
      {
        throw new Error(res)
      }
      set_comment_data({...comment_data, vote_count: comment_data.vote_count+1})

      // unlock
      res = await axios.delete(`${backend_url}/already_voted_question_comments/${comment_data.comment_id}/${comment_data.user_id}`)
      if (res.status !== 204)
      {
        throw new Error(res)
      }

      set_vote_flag(null)
    }
  })

  const handle_edit_comment_submit_click = wtc(async () => {
    const text = comment_text_ref.current.textContent

    if (!text || text === `something...`)
    {
      comment_text_ref.current.textContent = `something...`
      comment_text_ref.current.focus()
    }

    if (text === comment_data.text)
    {
      return set_edit_comment_clicked(false)
    }

    const res = await axios.put(`${backend_url}/question_comments/${comment_data.comment_id}`, {
      text: text
    })

    if (res.status === 200)
    {
      comment_data.text = text
    }

    comment_text_ref.current.blur()
    set_edit_comment_clicked(false)
  })


  function handle_edit_comment_click()
  {
    set_edit_comment_clicked(true)
    comment_text_ref.current.focus()
  }






  if (random_error)
  {
    return `something went wrong, please refresh the page`
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
