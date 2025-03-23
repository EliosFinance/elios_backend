import axios from 'axios';

export const axiosClient = axios.create({
    baseURL: 'http://localhost:3333/',
    headers: {
        Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiZmxvcmlhbi5wbHZkIiwiaWF0IjoxNzQyNzU3OTI5LCJleHAiOjE3NDI3NjE1Mjl9.5wDGCWkz8x1ld71fM-BYrae04NLu8yu-7ZTqBy-uybI',
    },
});
