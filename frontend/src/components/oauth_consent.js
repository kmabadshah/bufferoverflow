import React from 'react'

export default function OauthConsent() {
    React.useLayoutEffect(() => {
        window.localStorage.setItem('oauth_url', window.location.href)
        window.close()
    }, [])

    return null;
}
