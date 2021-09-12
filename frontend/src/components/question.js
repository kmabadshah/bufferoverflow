import React from 'react'
import {useParams} from 'react-router-dom'
import axios from 'axios'
import {backend_url, Navbar, new_answer_obj, new_user_obj, get_user_info_async, Br, wtc} from './utilities'
import Answer from './answer'
import {extras_actions, users_actions} from '../index.js'
import QuestionComment from './question_comment'
import {useSelector, useDispatch} from 'react-redux'

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

let prev_user_data = null
export default function Question() {
  const
  [loading, set_loading] = React.useState(true),
  [question_data, set_question_data] = React.useState(),
  [question_vote_flag, set_question_vote_flag] = React.useState(null),
  [show_answer_dialog, set_show_answer_dialog] = React.useState(false),
  [answers, set_answers] = React.useState([]),
  [question_editable, set_question_editable] = React.useState(false),
  [comments, set_comments] = React.useState([]),
  [show_comment_dialog, set_show_comment_dialog] = React.useState(false),
  {extras: {random_error}, users: {current_user}} = useSelector(store => store),
  {question_id} = useParams(),
  dispatch = useDispatch(),
  ref = React.useRef()



  React.useEffect(() => {
    wtc(async () => {
      // fetch questions
      const qres = await axios.get(`${backend_url}/questions/${question_id}`)
      set_question_data(qres.data)

      // get the question_comments
      // GET /question_comments/{question_id}
      const cres = await axios.get(`${backend_url}/question_comments/${qres.data.question_id}`)
      set_comments(cres.data)

      // get the answers
      // GET /answers/{question_id}
      const ares = await axios.get(`${backend_url}/answers/${qres.data.question_id}`)
      ares.data.sort(sort_by_vote_count_and_timestamp)
      set_answers(ares.data)

      let user_data;
      if (!current_user && localStorage.getItem('github_api_token'))
      {
        let user_data = await get_user_info_async(localStorage.getItem('github_api_token'))
        const {data} = await axios.post(`${backend_url}/users`, user_data)
        user_data = new_user_obj(data)
        dispatch(users_actions.set_current_user(user_data))
      }

      set_loading(false)
    })(() => dispatch(extras_actions.random_error_on()))

  }, [])

  // check everytime the user logs in if the question_data is available
  // if not, fetch question_data and vote_flag, otherwise only fetch vote_flag
  React.useEffect(() => {
    wtc(async() => {
      setTimeout(() => prev_user_data = current_user, 0)

      // just logged out
      if (!current_user && prev_user_data)
        set_question_vote_flag(null)

      // just logged in
      else if (!prev_user_data && current_user)
      {
        // thanks to root useEffect(), question_data is available,
        // just fetch the equestion flag
        let res = await axios.get(
          `${backend_url}/already_voted_questions/${question_data.question_id}/${current_user.user_id}`,
          {validateStatus: (status) => status < 500}
        )
        if (res.status === 200)
          set_question_vote_flag(res.data.vote_flag)
      }

    })(() => dispatch(extras_actions.random_error_on()))

  }, [current_user])



  const handle_question_vote_up_click = wtc(async  () => {
    if (!current_user)
    {
      return
    }

    const vote_flag = `upvoted`
    let current_vote_count = question_data.vote_count

    // if not voted
    if (!question_vote_flag || question_vote_flag === `downvoted`)
    {

      // set vote flag -> GET /already_voted_questions/{question_id}/{user_id}/{vote_flag}
      let res = await axios.get(
        backend_url
        +`/already_voted_questions/`
        +question_data.question_id+`/`
        +current_user.user_id+`/`
        +vote_flag
      )
      if (res.status !== 204)
      {
        throw new Error(res)
      }
      set_question_vote_flag(vote_flag)

      // increment counter
      res = await axios.get(`${backend_url}/increment_vote/questions/${question_data.question_id}`)
      if (res.status !== 204)
      {
        throw new Error(res)
      }

      current_vote_count++;

      // increment again if already downvoted
      if (question_vote_flag === `downvoted`)
      {
        res = await axios.get(`${backend_url}/increment_vote/questions/${question_data.question_id}`)
        if (res.status !== 204)
        {
          throw new Error(res)
        }

        current_vote_count++;
      }

      set_question_data({...question_data, vote_count: current_vote_count})
    }

    // when already upvoted
    else if (question_vote_flag === `upvoted`)
    {
      // increment the counter
      let res = await axios.get(`${backend_url}/decrement_vote/questions/${question_data.question_id}`)
      if (res.status !== 204)
      {
        throw new Error(res)
      }
      set_question_data({...question_data, vote_count: question_data.vote_count-1})

      // remove vote flag
      res = await axios.delete(
        `${backend_url}/already_voted_questions/${question_data.question_id}/${current_user.user_id}`
      )
      if (res.status !== 204)
      {
        throw new Error(res)
      }

      set_question_vote_flag(null)
    }
  })

  const handle_question_vote_down_click = wtc(async () => {
    if (!current_user)
    {
      return
    }

    const vote_flag = `downvoted`
    let current_vote_count = question_data.vote_count

    // not voted or already upvoted
    if (!question_vote_flag || question_vote_flag === `upvoted`)
    {

      // set vote flag -> GET /already_voted_questions/{question_id}/{user_id}/{vote_flag}
      let res = await axios.get(
        backend_url
        +`/already_voted_questions/`
        +question_data.question_id+`/`
        +current_user.user_id+`/`
        +vote_flag
      )
      if (res.status !== 204)
      {
        throw new Error(res)
      }
      set_question_vote_flag(vote_flag)

      // decrement counter
      res = await axios.get(`${backend_url}/decrement_vote/questions/${question_data.question_id}`)
      if (res.status !== 204)
      {
        throw new Error(res)
      }

      current_vote_count--;

      // decrement again
      if (question_vote_flag === `upvoted`)
      {
        res = await axios.get(`${backend_url}/decrement_vote/questions/${question_data.question_id}`)
        if (res.status !== 204)
        {
          throw new Error(res)
        }

        current_vote_count--;
      }

      set_question_data({...question_data, vote_count: current_vote_count})
    }

    // when already downvoted
    else if (question_vote_flag === `downvoted`)
    {
      // increment the counter
      let res = await axios.get(`${backend_url}/increment_vote/questions/${question_data.question_id}`)
      if (res.status !== 204)
      {
        throw new Error(res)
      }
      set_question_data({...question_data, vote_count: question_data.vote_count + 1})

      // remove vote flag
      res = await axios.delete(
        `${backend_url}/already_voted_questions/${question_data.question_id}/${current_user.user_id}`
      )
      if (res.status !== 204)
      {
        throw new Error(res)
      }

      set_question_vote_flag(null)
    }

  })


  function handle_edit_question_click() {
    // make the description editable
    set_question_editable(true)
    ref.current.focus()
    ref.current.classList.add(`border`)
    ref.current.classList.add(`border-red-900`)
  }

  const handle_edit_question_submit_click = wtc(async() => {
    if (ref.current.textContent && ref.current.textContent !== question_data.description)
    {
      const res = await axios.put(`${backend_url}/questions/${question_id}`, {description: ref.current.textContent})
      if (res.status === 200)
      {
        set_question_data(prev => { return {...prev, description: ref.current.textContent} })
      }
      else
      {
        console.dir(res)
      }
    }

    set_question_editable(false)
    ref.current.blur()
    ref.current.classList.remove(`border`)
    ref.current.classList.remove(`border-red-900`)
  })


  const sort_by_vote_count_and_timestamp = wtc((a, b) => {
    // sort by vote count, highest first
    if (a.vote_count < b.vote_count)
    {
      return 1
    }

    else if (a.vote_count === b.vote_count)
    {
      // sort by timestamp, highest(newest) first
      const ta = new Date(a.timestamp)
      const tb = new Date(b.timestamp)

      if (ta > tb)
      {
        return 1
      }

      return 0
    }

    return 0

  })

  async function handle_username_click(user_id) {
    // history.push() to /users/{username.user_id}
  }

  function handle_answer_click() {
    // show the answer dialog if closed
    // hide the answer dialog if open
    set_show_answer_dialog(prev => !prev)
    set_show_comment_dialog(false)
  }

  function handle_comment_click() {
    // show the answer dialog if closed
    // hide the answer dialog if open
    set_show_comment_dialog(prev => !prev)
    set_show_answer_dialog(false)
  }

  const handle_comment_submit_click = wtc(async(e) => {
    e.preventDefault()

    if (!e.target[0].value)
    {
      return
    }

    // POST /question_comments/{question_id}
    const res = await axios.post(`${backend_url}/question_comments/${question_data.question_id}`, {
      text: e.target[0].value,
      user_id: current_user.user_id
    })

    set_comments(prev => [...prev, res.data])
    handle_comment_click()
  })

  const handle_answer_submit_click = wtc(async(e) => {
    e.preventDefault()
    if (!e.target[0].value)
    {
      return
    }

    // [*] build the answer object
    // [*] send the answer into datbase
    // [*] POST /answers/{user_id}
    // [*] save the result in state

    let answer_obj = {
      text: e.target[0].value,
      user_id: current_user.user_id,
      question_id: question_data.question_id
    }

    const res = await axios.post(`${backend_url}/answers`, answer_obj)

    set_answers(prev => [...prev, new_answer_obj(res.data)])
    set_show_answer_dialog(false)
  })






















  if (random_error) {
    return `something went wrong, please try refreshing the page`
  }

  if (loading) {
    return `loading...`
  }




  return (
    <div className={`flex flex-col container mx-auto`}>
      <Navbar />
      <h1 className={`text-5xl mt-10`}>{question_data.title}</h1>

      <div className={`flex mt-5`}>
        <p className={`mr-5`}>by: anonymous</p>
        <p>at: {question_data.timestamp}</p>
      </div>

      {/* vote counter and description */}
      <div className={`flex mt-20 boder border-red-900`}>
        <div className={`flex flex-col align-center border border-red-900 h-[max-content]`}>
          {/* vote_up_icon */}
          <button onClick={handle_question_vote_up_click}>vote_up {question_vote_flag === `upvoted` && `^`}</button>

          {/* vote_count */}
          <p className={`text-center`}>{question_data.vote_count}</p>

          {/* vote down icon */}
          <button onClick={handle_question_vote_down_click}>vote_down {question_vote_flag === `downvoted` && `v`}</button>
        </div>

        {/* question_description */}
        <div
          className={`ml-20 overflow-x-auto h-80 flex-grow`}
          ref={ref}
          contentEditable={question_editable}
          suppressContentEditableWarning={true}
        >
          {question_data.description}
        </div>
      </div>

      <div className={`flex mt-40 ml-40`}>
        {current_user && <button onClick={handle_answer_click}>answer_button</button>}
        {current_user &&
          <button
            className={`ml-[20px]`}
            onClick={question_editable ? handle_edit_question_submit_click : handle_edit_question_click }
          >
            {question_editable ? `submit_button` : `edit_button`}
          </button>
        }
        {current_user &&
          <button className={`ml-5`} onClick={handle_comment_click}>comment_button</button>
        }
        <div className={`h-16 w-16 ml-auto flex items-center border border-red-900`}>
          <p className={`text-center`}>usrimg</p>
        </div>
        <button className={`ml-5`} onClick={() => handle_username_click(current_user.user_id)}>anonymous</button>
      </div>

      {/*
                answer dialog
                has the following sections
                textarea for inputting text
                submit button
                cancel button
                */}
      {(show_answer_dialog || show_comment_dialog) && (
        <form onSubmit={show_answer_dialog ? handle_answer_submit_click : handle_comment_submit_click} className={`ml-40 mt-10 flex flex-col`}>
          <textarea className={` border border-red-900  w-full`} rows={8}></textarea>

          <div className={`flex mt-3`}>
            <button className={`border ml-auto border-red-900  `} onClick={show_answer_dialog ? handle_answer_click : handle_comment_click}>Cancel</button>
            <button className={`border border-red-900  ml-5`}>Submit</button>
          </div>
        </form>
      )}

      {/*
                comment has the following sections
                an contentEditable div for typing
                left side, vote_count and upvote
                right side, username, timestamp
                */}
      {comments.map(c => (
        <QuestionComment comment_obj={c} key={c.comment_id} />
      ))}

      {/*
        * one answer has the following sections
        * row-1: vote_counter on the left, description on the right
        * row-2(far-right): user_image, username
        */}

      {answers.map(answer => (
        <Answer answer_obj={answer} key={answer.answer_id} />
      ))}
    </div>
  )


}




