/* eslint-disable */

import React from 'react'
import axios from 'axios'
import {backend_url, Br} from './utilities'
import {useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

export default function Answer({answer_obj, set_page_dont_exist}) {
  const
  [answer_vote_flag, set_answer_vote_flag] = React.useState(false),
  [answer_data, set_answer_data] = React.useState(answer_obj),
  [answer_user_data, set_answer_user_data] = React.useState(),
  [loading, set_loading] = React.useState(true),
  [answer_editable, set_answer_editable] = React.useState(false),
  current_user = useSelector(store => store.users.current_user),
  history = useHistory(),
  answer_text_ref = React.useRef()

  React.useEffect(() => {
    (async () => {
      try {
        let res = await axios.get(`
                ${backend_url}/already_voted_answers/${answer_data.answer_id}/${current_user.user_id}
              `, {validateStatus: (status) => status < 500})

        if (res.status === 200) {
          set_answer_vote_flag(res.data.vote_flag)
        }

        const answer_user_id = res.data.user_id
        res = await axios.post(`${backend_url}/users`, {
          user_id: answer_data.user_id
        })

        set_answer_user_data(res.data)
      }
      catch(e)
      {
        console.dir(e)
        set_page_dont_exist(true)
      }

      set_loading(false)
    })()
  }, [])

  if (loading)
  {
    return <p>loading...</p>
  }


  return (
    <>
      <div className={`flex mt-40`}>
        <div className={`flex flex-col align-center border h-[max-content] border-red-900`}>
          {/* vote_up_icon */}
          <button onClick={handle_answer_vote_up_click}>vote_up {answer_vote_flag === `upvoted` && `^`}</button>

          {/* vote_count */}
          <p className={`text-center`}>{answer_data.vote_count}</p>

          {/* vote down icon */}
          <button onClick={handle_answer_vote_down_click}>vote_down {answer_vote_flag === `downvoted` && `v`}</button>
        </div>

        {/* answer text */}
        <div className={`ml-20 overflow-x-auto h-80 flex-grow`} ref={answer_text_ref} suppressContentEditableWarning={true}  contentEditable={answer_editable} >{answer_data.text}</div>
      </div>

      <div className={`boder border-red-900 flex flex-wrap justify-end mt-20`}>
        <button className={`ml-40 w-16 mt-2 h-12`} onClick={answer_editable ? handle_edit_answer_submit_click : handle_edit_answer_click}>{answer_editable ? `submit` : `edit`}</button>

        <div className={`h-16 w-16 mr-5 flex ml-auto items-center border border-red-900`}>
          <p className={`text-center`}>usrimg</p>
        </div>
        <button className={`my-auto`} onClick={handle_username_click}>{answer_user_data.username}</button>
        <Br />
        <p className={`mt-5`}>{answer_data.timestamp}</p>
      </div>
    </>
  )

  function handle_username_click() {
    history.push(`/users/${answer_user_data.user_id}`)
  }

  function handle_edit_answer_click() {
    // editable=on
    set_answer_editable(true)
    answer_text_ref.current.classList.add(`border`)
    answer_text_ref.current.classList.add(`border-red-900`)

    answer_text_ref.current.focus()
  }

  async function handle_edit_answer_submit_click() {
    try {
      if (answer_text_ref.current.textContent && answer_text_ref.current.textContent !== answer_data.text)
      {
        const res = await axios.put(`${backend_url}/answers/${answer_data.answer_id}`, {text: answer_text_ref.current.textContent})

        if (res.status === 200)
        {
          answer_data.text = answer_text_ref.current.textContent
        }
      }

      set_answer_editable(false)
      answer_text_ref.current.blur()

      answer_text_ref.current.classList.remove(`border`)
      answer_text_ref.current.classList.remove(`border-red-900`)
    }
    catch(e)
    {
      console.dir(e)
    }
  }


  /*
   *
   * if not voted, increment and lock
   * if downvoted already, double increment and lock
   * if upvoted already, decrement and unlock
   *
   */
  async function handle_answer_vote_up_click() {
    try {
      const vote_flag = `upvoted`

      if (answer_vote_flag === `upvoted`)
      {
        // decrement
        let res = await axios.get(`${backend_url}/decrement_vote/answers/${answer_data.answer_id}`)
        if (res.status !== 204)
        {
          throw new Error(res)
        }
        set_answer_data({...answer_data, vote_count: answer_data.vote_count-1})

        // unlock
        res = await axios.get(`${backend_url}/already_voted_answers/${answer_data.answer_id}/${current_user.user_id}/${vote_flag}`)
        if (res.status !== 204)
        {
          throw new Error(res)
        }
        set_answer_vote_flag(null)
      }

      else if (!answer_vote_flag || answer_vote_flag === `downvoted`)
      {
        let current_vote_count = answer_data.vote_count

        // increment
        let res = await axios.get(`${backend_url}/increment_vote/answers/${answer_data.answer_id}`)
        if (res.status !== 204)
        {
          throw new Error(res)
        }
        current_vote_count++;

        // lock
        res = await axios.get(`${backend_url}/already_voted_answers/${answer_data.answer_id}/${current_user.user_id}/${vote_flag}`)
        if (res.status !== 204)
        {
          throw new Error(res)
        }
        set_answer_vote_flag(vote_flag)

        if (answer_vote_flag === `downvoted`)
        {
          // increment again
          res = await axios.get(`${backend_url}/increment_vote/answers/${answer_data.answer_id}`)
          if (res.status !== 204)
          {
            throw new Error(res)
          }
          current_vote_count++;
        }

        set_answer_data({...answer_data, vote_count: current_vote_count})
      }
    }
    catch(e)
    {
      console.dir(e)
    }
  }


  /*
   *
   * if not voted, decrement and lock
   * if upvoted already, double decrement and lock
   * if downvoted already, increment and unlock
   *
   */
  async function handle_answer_vote_down_click() {
    try {
      const vote_flag = `downvoted`

      if (answer_vote_flag === `downvoted`)
      {
        // increment
        let res = await axios.get(`${backend_url}/increment_vote/answers/${answer_data.answer_id}`)
        if (res.status !== 204)
        {
          throw new Error(res)
        }
        set_answer_data({...answer_data, vote_count: answer_data.vote_count+1})

        // unlock
        res = await axios.get(`${backend_url}/already_voted_answers/${answer_data.answer_id}/${current_user.user_id}/${vote_flag}`)
        if (res.status !== 204)
        {
          throw new Error(res)
        }
        set_answer_vote_flag(null)
      }

      else if (!answer_vote_flag || answer_vote_flag === `upvoted`)
      {
        let current_vote_count = answer_data.vote_count

        // decrement
        let res = await axios.get(`${backend_url}/decrement_vote/answers/${answer_data.answer_id}`)
        if (res.status !== 204)
        {
          throw new Error(res)
        }
        current_vote_count--;

        // lock
        res = await axios.get(`${backend_url}/already_voted_answers/${answer_data.answer_id}/${current_user.user_id}/${vote_flag}`)
        if (res.status !== 204)
        {
          throw new Error(res)
        }
        set_answer_vote_flag(vote_flag)

        if (answer_vote_flag === `upvoted`)
        {
          // decrement again
          res = await axios.get(`${backend_url}/decrement_vote/answers/${answer_data.answer_id}`)
          if (res.status !== 204)
          {
            throw new Error(res)
          }
          current_vote_count--;
        }

        set_answer_data({...answer_data, vote_count: current_vote_count})
      }
    }
    catch(e)
    {
      console.dir(e)
    }
  }
}






