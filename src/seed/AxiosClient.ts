import axios from 'axios';

export const axiosClient = axios.create({
    baseURL: 'http://localhost:3333/',
    headers: {
        Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQsInVzZXJuYW1lIjoic2FtaSIsImlhdCI6MTc0MjgzNjEzMywiZXhwIjoxNzQyODM5NzMzfQ.T3vWLZzMvG80T9sXe2lgrQ3uIcv0j4p1Fb9aAxG1pxI',
    },
});
