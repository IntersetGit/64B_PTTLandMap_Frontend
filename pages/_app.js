import { wrapper } from '../redux/store'
import { useDispatch } from 'react-redux';
import { setToken } from '../redux/actions/userActions'

import { useEffect, useRef } from 'react';
import { Cookies } from 'react-cookie';
import API from '../util/Api';

import 'antd/dist/antd.css';
import '../public/assets/css/style.css';
import '../public/assets/scss/main.scss'


function MyApp({ Component, pageProps }) {
  const dispatch = useDispatch();
  const isComponentMounted = useRef(true)


  useEffect(() => {
    if (isComponentMounted.current) {
      (() => {
        const cookies = new Cookies();
        const token = cookies.get('token');
        if (token) dispatch(setToken(token))

      })();
    }

    return () => {
      isComponentMounted.current = false
    }
  }, [])

  return <Component {...pageProps} />
}

export default wrapper.withRedux(MyApp)
