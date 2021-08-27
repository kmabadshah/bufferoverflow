import React from 'react';
import {fetch_and_store_token, get_user_info, new_notification_obj} from './utilities'
import {Link, useHistory} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import {extras_actions, users_actions} from '../index.js'

/*
 *
 * a component for the home page
 * url: /
 * has the following sections
 * row-1: navbar(left: logo, right: notification and profile icon)
 * row-2: ask question button at far right
 * row-3: column with all questions
 *
 * */

export default function Home() {
    const pathname = window.location.pathname
    const dispatch = useDispatch()
    const [notification_icon_clicked, set_notification_icon_clicked] = React.useState(false)
    const current_user = useSelector(store => store.users.current_user)
    const [profile_icon_clicked, set_profile_icon_clicked] = React.useState(true)
    const history = useHistory()

    return (
        <div className={`flex flex-col h-screen container mx-auto`}>
            <div id='navbar' className={`flex justify-between border border-red-900`}>
                <button id='logo' className={``} onClick={handle_logo_click}>bufferoverflow</button>

                <div className={`flex`}>
                    <div className={`relative`}>
                        <button id='notification_icon' className={`mr-2`} onClick={handle_notification_icon_click}>noticon</button>

                    {notification_icon_clicked && (
                        <div id='notification_dialog' tabIndex={-1} className={`flex flex-col w-80 cursor-none max-h-80 overflow-scroll absolute top-10 right-0 bg-white border border-black`}>
                            <Notifications />
                        </div>
                    )}
                    </div>

                    <div className={`relative`}>
                        <button id='profile_icon' className={`mr-2`} onClick={handle_profile_icon_click}>proficon</button>

                        {profile_icon_clicked && <Profile />}
                    </div>
                </div>
            </div>



            <div className={`flex justify-end boder border-red-900 mt-5`}>
                <button className={``} onClick={handle_ask_question_click}>Ask Question</button>
            </div>
        </div>
    );

    // the profile dialog has
    // user image
    // username
    // link to profile
    // logout option

    function Profile() {
        return (
            <div id='profile_dialog' tabIndex={-1} className={`flex p-3 flex-col w-80 cursor-none max-h-80 overflow-scroll absolute top-10 right-0 bg-white border border-black`}>
                <h1 id='profile_user_image' className={`text-center`}>user_image</h1>
                <h1 id='profile_user_name' className={`text-center`}>{current_user.username}</h1>
                <button id='profile_link' onClick={handle_go_to_profile_click}>go_to_profile</button>
                <button id='profile_logout_button' onClick={handle_logout_click}>logout</button>
            </div>
        )
    }


    function Notifications() {
        const notifications = [...Array(10)].map(() => new_notification_obj({
            notification_id: 10,
            notification_title: `Somebody replied to your post`,
            notification_link: `http://google.com`,
            timestamp: new Date(`2021-08-27T08:02:00.490Z`) / 1000,
            user_id: 12,
        }))

        return notifications.map(({notification_title, timestamp, notification_id, notification_link}, i) => (
            <button className={`notification_button flex justify-end`}
                onClick={() => handle_notification_click(notification_link)}
                key={i /*notification_id*/}
            >
                <h1 className={`notification_title`}>{notification_title}</h1>
                <p>{timestamp}</p>
            </button>
        ))
    }

    function handle_ask_question_click() {
        // loading=on
        // go to /ask_question page
        // loading=off

        dispatch(extras_actions.loading_on())
        history.push(`/ask_question`)
    }

    function handle_go_to_profile_click() {
        // turn state.loading = true
        // history.push() to /users/{id} page
        // turn state.loading = false

        dispatch(extras_actions.loading_on())
        history.push(`/users/${current_user.user_id}`)
    }

    function handle_notification_click() {
        // func_args(1): the notification object

        // notification can be something like
        // notification {
        //   notification_id: 10,
        //   notification_title: Somebody replied to your post,
        //   notification_link: 20,
        //   timestamp: 2021-08-27T08:02:00.490Z,
        //   user_id: 12,
        // }

        // turn state.loading = true
        // history.push() to notification.notification_link
        // turn state.loading = false

    }

    function handle_logout_click() {
        // turn state.loading = true
        // remove user from the redux store
        // delete all tokens from localStorage
        // turn state.loading = false

        dispatch(extras_actions.loading_on())
        dispatch(users_actions.unset_current_user())
        localStorage.clear()
    }

    function handle_logo_click() {
        if (pathname !== '/') {
            history.push(`/`)
        }
    }

    /* show a dialog containing all the notifications */
    function handle_notification_icon_click() {
        set_profile_icon_clicked(false)
        set_notification_icon_clicked(prev => !prev)
    }

    function handle_profile_icon_click() {
        set_notification_icon_clicked(false)
        set_profile_icon_clicked(prev => !prev)
    }
}
