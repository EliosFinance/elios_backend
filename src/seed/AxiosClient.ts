import axios from 'axios';

export const axiosClient = axios.create({
    baseURL: 'http://localhost:3333/',
    headers: {
        Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiZmxvcmlhbi5wbHZkIiwiaWF0IjoxNzQzMDIzNDExLCJleHAiOjE3NDMwMjcwMTF9.8IEfUw9a3U896N9SbO9E-a70sHgU-3SG_vH6mKxJyAw',
    },
});
