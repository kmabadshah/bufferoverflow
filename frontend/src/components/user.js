import React from 'react'
import {useParams, Link} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import {error_log, get_user_info_async, backend_url, Navbar} from './utilities.js'
import {users_actions} from '../index.js'
import axios from 'axios'


/*
 *
 * a component for the user profile page
 * url: /users/{user_id}
 * it has the following sections
 *
 * row-1(left: user image, right: user description)
 * row-2(left: user questions, right: user answers)
 *
 * user profile page will have the image of the user, the username, the description,
 * all the questions asked by the user on the left column,
 * all the answers given by the user on the right column
 *
 *
 * */
export default function User() {
    const {user_id} = useParams(),
    dispatch = useDispatch(),
    [loading, set_loading] = React.useState(true),
    [questions, set_questions] = React.useState([]),
    user_data = useSelector(store => store.users.list.find(u => u.user_id == user_id)),
    current_user = useSelector(store => store.users.current_user);

    React.useEffect((() => async() => {try{
        let res;
        // get the current user
        if (!current_user) {
            if (localStorage.getItem('github_api_token')) {
                // fetch current user
                let user_data = await get_user_info_async(localStorage.getItem('github_api_token'))
                res = await axios.post(`${backend_url}/users`, user_data)
                if (res.status === 200) {
                    dispatch(users_actions.set_current_user(res.data))
                } else {
                    dispatch(users_actions.unset_current_user())
                    throw res
                }
            }
        }

        // get the user data, if not in store
        if (!user_data) {
            res = await axios.post(`${backend_url}/users`, {user_id})
            if (res.status !== 200) {
                throw res
            }
            dispatch(users_actions.update(res.data))
        }

        // get all questions this user has asked
        res = await axios.get(`${backend_url}/questions`)
        if (res.status !== 200) {
            throw res
        }
        set_questions(res.data.filter(q => q.user_id == user_id))
        set_loading(false)

    }catch(e){error_log(e,true)}})(), [])




    if (loading) return `loading...`
    else return (<div className={`flex flex-col h-screen container mx-auto`}>
        <Navbar />
        <div className={`flex justify-between mt-10`}>
            <img src={user_data.image_url} className={`h-60 w-60`} alt={`user_image`} />
            <p className={`ml-5`}>Sit asperiores excepturi nam obcaecati neque porro Qui ipsum voluptate vel officiis ullam dolore Sunt eos mollitia et fugiat deleniti! Atque dolorum ipsam dolor fuga tempore nam! Culpa perspiciatis facere quis nisi doloremque ipsum? Obcaecati asperiores velit sint placeat rerum! Vel necessitatibus repellendus dolor doloremque ad aperiam? Dolores saepe distinctio at possimus incidunt? Omnis dignissimos vitae minus dicta quam quae doloremque, rerum. Tenetur cum fuga assumenda tenetur quae Perferendis incidunt omnis repellat enim nobis eligendi. Ipsa doloribus eius quam inventore nisi? Ad aperiam nisi reiciendis voluptatibus temporibus? Facere saepe maiores eligendi veritatis facilis magni. Itaque natus maiores consequatur tempora provident</p>
        </div>

        <div className="flex mt-20 justify-between">
            <div className="flex-col w-full items-center">
                <h1 className={`text-center`}>QUESTIONS</h1>
                <p className={`text-center`}>==============</p>

                <div className={`mx-auto flex justify-center`}>
                    {questions.map(q => (
                        <Link key={q.question_id} to={`/questions/${q.question_id}`}>{q.title}</Link>
                    ))}
                </div>
            </div>
        </div>
    </div>)
}
