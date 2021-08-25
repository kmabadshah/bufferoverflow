import React from 'react';
import {fetch_and_store_token, get_user_info} from './utilities'
import {Link, useHistory} from 'react-router-dom'

/*
 * home page will have a navbar, left side logo, right side notification and profile icon.
 * home page will have a 'ask question' button
 * home page with all questions list
 * */

export default function Home() {
    const pathname = window.location.pathname
    const [notification_icon_clicked, set_notification_icon_clicked] = React.useState(false)
    const history = useHistory()

    return (
        <div className={`flex flex-col h-screen container mx-auto`}>
            <div id='navbar' className={`flex justify-between border border-red-900`}>
                <button id='logo' className={``} onClick={handle_logo_click}>bufferoverflow</button>

                <div className={`flex`}>
                    <div className={`relative border border-black`}>
                        <button id='notification_icon' className={`mr-2`} onClick={handle_notification_icon_click}>noticon</button>
                        {notification_icon_clicked && (
                            <div id='notification_dialog' tabIndex={-1} className={`flex flex-col w-80 cursor-none max-h-80 overflow-scroll absolute top-10 right-0 bg-white border border-black`}>
                                {/* many many <Notification /> here */}
                                {[...Array(10)].map((_, i) => <Notification key={i} />)}
                            </div>
                        )}
                    </div>

                    <button id='profile_icon' className={``} onClick={handle_profile_icon_click}>proficon</button>
                </div>
            </div>
        </div>
    );

    function Notification() {
        return (
            <button className={`notification_button`}>
                <h1 className={`notification_title`}>Hello World</h1>
            </button>
        )
    }

    function handle_logo_click() {
        if (pathname !== '/') {
            history.push(`/`)
        }
    }

    /* show a dialog containing all the notifications */
    function handle_notification_icon_click() {
        set_notification_icon_clicked(prev => !prev)
    }

    function handle_profile_icon_click() {
        console.log(``)
    }
}
