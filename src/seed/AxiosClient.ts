import axios from 'axios';

export const axiosClient = axios.create({
    baseURL: 'http://localhost:3333/',
    headers: {
        Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInVzZXJuYW1lIjoiZmxvIiwiaWF0IjoxNzM2NTAxNjA4LCJleHAiOjE3MzY1MDUyMDh9.5PNl9Up1wqjFT5mNKBh0ly70YgTM_pZw0kKI7tRQOII',
    },
});
