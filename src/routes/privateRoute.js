/* eslint-disable react/prop-types */
import React, { useEffect } from 'react'
import { Route, Redirect } from 'react-router-dom'
import { Cookies } from 'react-cookie'

const PrivateRoute = ({ component: Component, ...rest }) => {
    const cookies = new Cookies();
    
    return (<Route {...rest} render={props => {

        return (
            cookies.get('token') ? (
                <Component {...props} />
            ) : (<Redirect to={{
                pathname: '/login'
            }} />
            )
        )
    }} />)

}

export default PrivateRoute
