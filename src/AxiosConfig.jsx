import axios from'axios';
const axiosBase = axios.create({
    // deployed on render
    baseURL:'https://campus-forum.onrender.com'
})
export default axiosBase;