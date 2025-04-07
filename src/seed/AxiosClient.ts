import axios from 'axios';

export const axiosClient = axios.create({
    baseURL: 'http://localhost:3333/',
    headers: {
        Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiZmxvcmlhbi5wbHZkIiwiaWF0IjoxNzQ0MDU5MDk2LCJleHAiOjE3NDQwNjI2OTZ9.e2Zz9LISwFpYGbQcntbMwo_m13LMZxbH5jfu2wlUPyo',
    },
});
