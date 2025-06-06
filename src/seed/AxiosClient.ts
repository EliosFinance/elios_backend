import axios from 'axios';

export const axiosClient = axios.create({
    baseURL: 'http://localhost:3333/',
    headers: {
        Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQsInVzZXJuYW1lIjoic2FtaSIsImlhdCI6MTc0Mzg1MDAwMCwiZXhwIjoxNzQzODM5NzMzfQ.NRL7ZtZbZHgSne2spyC2miiAF4gE7PLQ9j5KUX2sDws',
    },
});
