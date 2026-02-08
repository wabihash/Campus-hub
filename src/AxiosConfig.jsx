import axios from'axios';
const axiosBase = axios.create({
    baseURL:'http://localhost:5400/api'
})
export default axiosBase;