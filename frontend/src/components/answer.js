import React from 'react'
import axios from 'axios'
import {backend_url} from './utilities'
import {useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

export default function Answer({answer_obj, set_page_dont_exist}) {
  const
  [answer_vote_flag, set_answer_vote_flag] = React.useState(false),
  [answer_data, set_answer_data] = React.useState(answer_obj),
  [answer_user_data, set_answer_user_data] = React.useState(),
  [loading, set_loading] = React.useState(true),
  current_user = useSelector(store => store.users.current_user),
  history = useHistory()

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
        <div className={`flex flex-col align-center border border-red-900`}>
          {/* vote_up_icon */}
          <button onClick={handle_answer_vote_up_click}>vote_up {answer_vote_flag === `upvoted` && `^`}</button>

          {/* vote_count */}
          <p className={`text-center`}>{answer_data.vote_count}</p>

          {/* vote down icon */}
          <button onClick={handle_answer_vote_down_click}>vote_down {answer_vote_flag === `downvoted` && `v`}</button>
        </div>

        {/* answer text */}
        <div className={`ml-20`}>{answer_data.text}</div>

      </div>

      <div className={`boder border-red-900 flex flex-wrap justify-end`}>
        <div className={`h-16 w-16 mr-5 ml-auto flex items-center border border-red-900`}>
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

  function Br() {
    return (
      <div style={{flexBasis: `100%`, height: 0}}></div>
    )
  }


  async function handle_answer_vote_up_click() {
    try {
      // denied voting if already upvoted
      //
      // set the vote flag -> GET /already_voted_answers/{answer_id}/{user_id}/{vote_flag}
      // increment vote -> GET /increment_vote/answers/{answer_id}
      // update the local state

      if (answer_vote_flag === `upvoted`)
      {
        return
      }

      const vote_flag = `upvoted`
      let res = await axios.get(`${backend_url}/already_voted_answers/${answer_data.answer_id}/${current_user.user_id}/${vote_flag}`)
      set_answer_vote_flag(res.data.vote_flag)

      res = await axios.get(`${backend_url}/increment_vote/answers/${answer_data.answer_id}`)
      set_answer_data(res.data)
    }
    catch(e)
    {
      console.dir(e)
    }
  }

  async function handle_answer_vote_down_click() {
    try {
      // denied voting if already downvoted
      //
      // set the vote flag -> GET /already_voted_answers/{answer_id}/{user_id}/{vote_flag}
      // decrement vote -> GET /increment_vote/answers/{answer_id}
      // update the local state

      if (answer_vote_flag === `downvoted`)
      {
        return
      }


      const vote_flag = `downvoted`
      let res = await axios.get(`${backend_url}/already_voted_answers/${answer_data.answer_id}/${current_user.user_id}/${vote_flag}`)
      set_answer_vote_flag(res.data.vote_flag)

      res = await axios.get(`${backend_url}/decrement_vote/answers/${answer_data.answer_id}`)
      set_answer_data(res.data)
    }
    catch(e)
    {
      console.dir(e)
    }
  }
}






// TODO: implement edit option for questions and answers
