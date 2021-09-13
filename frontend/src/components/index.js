import React from 'react'

export default function Index() {
    const history = useHistory()
    const pathname = window.location.pathname
    const github_api_token = localStorage.getItem('github_api_token')
    const {extras: {loading, random_error}, users: {current_user}} = useSelector(store => store)
    const dispatch = useDispatch()

    /* fetch the user,
     * store the user,
     * update the `authenticating` variable */
    React.useLayoutEffect(() => {
        wtc(async() => {
            if (loading) {
                /* do not fetch user on the /oauth_consent
                 * that page is only for storing the github code and github token
                 * */
                if (pathname !== "/oauth_consent" && !current_user && github_api_token) {
                    const user_data = await get_user_info_async(github_api_token)
                    const {data} = await axios.post(`${backend_url}/users`, user_data)

                    dispatch(users_actions.set_current_user(new_user_obj(data)))
                }

                dispatch(extras_actions.loading_off())
            }
        })(() => dispatch(extras_actions.random_error_on()))
    }, [])



    if (pathname === '/oauth_consent') {
        const string_before_api_token = window.location.href
        localStorage.setItem('string_before_api_token', string_before_api_token)

        window.close()
        return <NotFound/>
    }

    if (random_error) {
        return <h1>Something went wrong, please try refreshing the page</h1>
    }

    if (loading) {
        return <h1>Loading...</h1>
    }

    if (!github_api_token) {
        window.history.replaceState(null, "", "/enter")
        return <Enter />
    }

    if (pathname === "/enter") {
        window.history.replaceState(null, "", "/")
    }
}
