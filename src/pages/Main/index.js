import React, { Suspense, useEffect } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import routes from '../routes'
import { useDispatch } from 'react-redux';
import { setAuthUser, setToken } from '../../redux/actions/authActions';


const Main = () => {

    const dispatch = useDispatch();

    useEffect(() => {
        setRedux()
    }, [])

    const setRedux = async () => {
        // const token = JSON.parse(sessionStorage.getItem("token"));
        // const user = JSON.parse(sessionStorage.getItem("user"));
        // if (sessionStorage.getItem("token")) await dispatch(setToken(token))
        // if (sessionStorage.getItem("user")) await dispatch(setAuthUser(user))
    }

    return (
        <Suspense>
            <Switch>
                {routes.map((route, idx) => {
                    return route.component && (
                        <Route
                            key={idx}
                            path={route.path}
                            exact={route.exact}
                            name={route.name}
                            render={props => (
                                <div className="container-fluid">
                                    <route.component {...props} />
                                </div>

                            )} />
                    )
                })}
                <Redirect from="/" to="/" />
            </Switch>
        </Suspense>
    )
}

export default Main
