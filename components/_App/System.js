import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Layout from './Layout'

const System = ({ children }) => {

    const { user } = useSelector(({ user }) => user);
    const route = useRouter()

    useEffect(() => {
        if (user.roles_id !== "8a97ac7b-01dc-4e06-81c2-8422dffa0ca2") {
            route.push("/")
        }
    }, [user])

    return (
        <Layout>
            {children}
        </Layout>
    )
}

export default System
