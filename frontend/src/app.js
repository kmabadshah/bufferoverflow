import React from 'react';
import Enter from './components/enter';
import Home from './components/home';
import OauthConsent from './components/oauth_consent';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import './tailwind.css';

export default function App() {
    return (
        <Router>
            <Switch>
                <Route path="/enter"> <Enter /> </Route>
                <Route path="/oauth_consent"> <OauthConsent /> </Route>
                <Route path="/"> <Home /> </Route>
            </Switch>
        </Router>
    );
}

