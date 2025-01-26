import axios from 'axios';

export const axiosClient = axios.create({
    baseURL: 'http://localhost:3333/',
    headers: {
        Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjI0LCJ1c2VybmFtZSI6IlN1bXBsZTY2NjYiLCJpYXQiOjE3Mzc5MDk3MzEsImV4cCI6MTczNzkxMzMzMX0.1SXuGC1B_QuElGwcOy0OHzk1_yMw5ussnZhia40I7T0',
    },
});
