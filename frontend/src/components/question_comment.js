import React from 'react'
import axios from 'axios'
import {backend_url, Navbar, new_answer_obj, Br} from './utilities'

export default function QuestionComment({comment_obj}) {
  const [comment_data, set_comment_data] = React.useState(comment_obj)
  const [edit_comment_clicked, set_edit_comment_clicked] = React.useState(false)
  const comment_text_ref = React.useRef()

  return (
    <div className={`ml-80 mt-10 flex`}>
      <div className={`flex flex-col`}>
        <p>up</p>
        <p>{comment_data.vote_count}</p>
        <p>down</p>
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

  async function handle_edit_comment_click() {
    set_edit_comment_clicked(true)
    comment_text_ref.current.focus()
  }

  async function handle_edit_comment_submit_click() {
    try {
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

      const res = await axios.put(`${backend_url}/comments/${comment_data.comment_id}`, {
        text: text
      })

      if (res.status === 200)
      {
        comment_data.text = text
      }

      comment_text_ref.current.blur()
      set_edit_comment_clicked(false)
    }
    catch(e)
    {
      console.dir(e)
    }
  }
}
