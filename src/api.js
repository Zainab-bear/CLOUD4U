import axios from 'axios'

const api = axios.create({
  baseURL: 'http://Group39-ALB-174747765.us-east-1.elb.amazonaws.com'
})

export default api
