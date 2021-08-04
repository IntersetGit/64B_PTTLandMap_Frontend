/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react'
import { Route, Redirect } from 'react-router-dom'
import Axios from 'axios';
import Config from '../config';
import Swal from 'sweetalert2'

const PrivateRoute = ({ component: Component, ...rest }) => {

  useEffect(() => { /*นับเวลาการล็อกอินเข้าสู่ระบบจนกว่าจะหมดเวลาของToken*/
    if (window.sessionStorage.getItem('isLogin') == 1) {
      if (JSON.parse(window.sessionStorage.getItem('token')).expires_in < Date.now() / 1000) {
        console.log("หมดเวลาtoken")
        Swal.fire({
          position: 'top',
          allowOutsideClick: false, icon: 'info',
          title: 'Token หมดอายุกรุณาเข้าสู่ระบบใหม่อีกครั้ง',
          text: 'หมดเวลาการเข้าสู่ระบบกรุณาทำการเข้าสู่ระบบใหม่อีกครั้ง!',
          showConfirmButton: true,
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        })
        handleLogout();
      }
    }
  })
  const handleLogout = () => { /*ตัดการเชื่อมต่อระบบหรือล็อกเอาออกจากระบบ*/
    try {

      this.destroy();
      Axios({
        method: 'post',
        url: process.env.REACT_APP_API_URL + "/logout",
        headers: { Authorization: "Bearer " + JSON.parse(sessionStorage.getItem("token")).access_token },
      })
        .then((res) => {
          if (res.status === 200) {
            window.sessionStorage.clear();
            window.location.reload();
          } else {
            window.sessionStorage.clear();
            window.location.reload();
          }
        })
        .catch((err) => {
          window.sessionStorage.clear();
          window.location.reload();
        });
    } catch (err) {
      window.sessionStorage.clear();
      window.location.reload();
    }
  }
  return (<Route {...rest} render={props => {

    return (
      window.sessionStorage.getItem('isLogin') == 1 ? (
        <Component {...props} />
      ) : (<Redirect to={{
        pathname: process.env.PUBLIC_URL + '/login'
      }} />
        )
    )
  }} />
  )
}

export default PrivateRoute
