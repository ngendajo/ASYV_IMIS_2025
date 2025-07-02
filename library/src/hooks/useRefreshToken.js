import axios from "../api/axios";
import useAuth from "./useAuth";

const useRefreshToken = () => {
    const { setAuth } = useAuth();
    const { auth } = useAuth();

    const refresh =  async () => {
        const response = await axios.post('/token/refresh/',
        JSON.stringify({
            'refresh':auth?.refresh
        }),
        {
            headers: { 'Content-Type': 'application/json' },
            withCredentials:true
        });
        setAuth(prev =>{
            return { ...prev, accessToken: response.data.access,refresh:response.data.refresh}
        });
        return response.data.access;
    }
  return refresh;
}

export default useRefreshToken