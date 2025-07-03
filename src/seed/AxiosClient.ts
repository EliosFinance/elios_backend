import axios from 'axios';

export const axiosClient = axios.create({
    baseURL: 'http://localhost:3333/',
    headers: {
        Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiZmxvcmlhbi5wbHZkIiwiaWF0IjoxNzQ5MjE2MzQ3LCJleHAiOjE3NDkyMTk5NDd9.FSjOeR6_jT3lMe4T923bmGGhyZJYJVTA8nNPLOnyY9Q',
    },
});
