import axios from 'axios';

export const axiosClient = axios.create({
    baseURL: 'http://localhost:3333/',
    headers: {
        Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInVzZXJuYW1lIjoidGVzdGFhIiwiaWF0IjoxNzM5ODk3NjU5LCJleHAiOjE3Mzk5MDEyNTl9.ljHDJoikDHt76IcHZSdTX3w68motw6cxSa-Vj3AjJo4',
    },
});
