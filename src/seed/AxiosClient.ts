import axios from 'axios';

export const axiosClient = axios.create({
    baseURL: 'http://localhost:3333/',
    headers: {
        Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiZmxvcmlhbi5wbHZkIiwiaWF0IjoxNzQzOTcxMjU3LCJleHAiOjE3NDM5NzQ4NTd9.w7pEFyOtQMUXtEJ7Q7uXESgzPi4OPBaKEG9ID7yqHYw',
    },
});
