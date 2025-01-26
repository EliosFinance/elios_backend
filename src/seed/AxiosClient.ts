import axios from 'axios';

export const axiosClient = axios.create({
    baseURL: 'http://localhost:3333/',
    headers: {
        Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiRmxvcmlhbiIsImlhdCI6MTczNzkyMzQyNSwiZXhwIjoxNzM3OTI3MDI1fQ.XTCySwtZrtsaMQ12gwn3m7C6Xw9RqmOOHNL9ia-MSD0',
    },
});
