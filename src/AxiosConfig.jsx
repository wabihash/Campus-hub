import axios from'axios';
const axiosBase = axios.create({
    // deployed on render
    baseURL:'https://campus-api-deploy.onrender.com'
    // local development
    // baseURL:'http://localhost:5400'
})
export default axiosBase;