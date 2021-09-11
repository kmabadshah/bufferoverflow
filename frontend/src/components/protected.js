import React from 'react'
import {useHistory} from 'react-router-dom'
import {extras_actions, users_actions} from '../index.js'
import {get_user_info_async, backend_url, new_user_obj, wtc} from './utilities';
import {useSelector, useDispatch} from 'react-redux'
import axios from 'axios';

/*
 *
 * performs some basic checks
 *
*/
export default function Protected({children}) {
  const history = useHistory()
  const github_api_token = localStorage.getItem('github_api_token')
  const {extras: {random_error}, users: {current_user}} = useSelector(store => store)
  const [loading, set_loading] = React.useState(true)
  const dispatch = useDispatch()

  React.useLayoutEffect(() => {
    wtc(async() => {
      if (!current_user)
      {
        if (github_api_token)
        {
          const user_data = await get_user_info_async(github_api_token)
          const {data} = await axios.post(`${backend_url}/users`, user_data)

          dispatch(users_actions.set_current_user(new_user_obj(data)))
          history.push(`/`)
        }
        else
        {
          history.push(`/enter`)
        }
      }

      set_loading(false)

    })(() => dispatch(extras_actions.random_error_on()))
  }, [])

  if (random_error)
  {
    return `something went wrong, please try refreshing the page`
  }
  else if (loading)
  {
    return `loading...`
  }
  else
  {
    return children
  }

}
