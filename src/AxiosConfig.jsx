import axios from'axios';
const axiosBase = axios.create({
    // deployed on render
    
    baseURL:'https://campus-api-deploy.onrender.com'
})
export default axiosBase;