import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import PrivateRoute from './privateRoute'
import Login from '../pages/Login'
import Axios from 'axios';
import Swal from 'sweetalert2'
import GoogleMap from '../pages/GoogleMap.js'
class RouteRoot extends Component {
  constructor(props) {
    super(props);
    this.events = [
      "load",
      "mousemove",
      "mousedown",
      "click",
      "scroll",
      "keypress"
    ];

    this.warn = this.warn.bind(this);
    this.resetTimeout = this.resetTimeout.bind(this);

    for (var i in this.events) {/*ตรวจจับทุกอีเวน์ในการเคลื่อนไหว*/
      window.addEventListener(this.events[i], this.resetTimeout);
    }

  }
  clearTimeout() { /*เคลียไทม์เอา*/
    if (this.warnTimeout) clearTimeout(this.warnTimeout);

    if (this.logoutTimeout) clearTimeout(this.logoutTimeout);
  }

  setTimeout() { /*นับเวลาตรวจจับการเคลื่อนไหวกรณีไม่มีการเคลื่อนไหวในระบบ*/
    this.warnTimeout = setTimeout(this.warn, 1800000); //30 min

    this.logoutTimeout = setTimeout(this.handleLogout, 2100000); //35 min
  }

  resetTimeout() {/*รีเซ็ทกรณีมีการเคลื่อนไหวแล้ว*/
    this.clearTimeout();
    this.setTimeout();

  }

  warn() {/*แจ้งเตื่อนกรณีนับเวลาถึง 25นาทีแล้ว*/
    // alert("You will be logged out automatically in 1 minute.");

    Swal.fire({
      position: 'top',
      allowOutsideClick: false, icon: 'info',
      title: 'คุณไม่ได้ทำรายการใดๆ เป็นเวลา 30 นาที',
      text: 'หากไม่ทำรายการใดๆต่อ \n จะออกจากระบบอัตโนมัติภายใน 5 นาที',
      showConfirmButton: true,
    }).then((result) => {

    })
  }

  destroy() {/*เคลีย*/
    this.clearTimeout();

    for (var i in this.events) {
      window.removeEventListener(this.events[i], this.resetTimeout);
    }
  }

  handleLogout() {/*ทำการออกจากระบบ*/
    try {
      // this.setState({ logginStatus: false });
      this.destroy();
      Axios({
        method: 'post',
        url: process.env.REACT_APP_API_URL + "/masters/manageCommunicationStation",
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
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path={`/login`} component={Login} />
          <Route exact path={`/googlemap`} component={GoogleMap} />
        </Switch>
      </Router>
    )
  }
}

export default RouteRoot
