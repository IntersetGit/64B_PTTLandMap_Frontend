/* eslint-disable react/prop-types */
import React, { useEffect } from 'react'
import { Route, Redirect } from 'react-router-dom'

const PrivateRoute = ({ component: Component, ...rest }) => {
   
    return (<Route {...rest} render={props => {

        return (
            window.sessionStorage.getItem('isLogin') == 1 ? (
                <Component {...props} />
            ) : (<Redirect to={{
                pathname: '/login'
            }} />
            )
        )
    }} />)

}

export default PrivateRoute
