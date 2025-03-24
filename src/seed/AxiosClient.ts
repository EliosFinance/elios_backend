import axios from 'axios';

export const axiosClient = axios.create({
    baseURL: 'http://localhost:3333/',
    headers: {
        Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQsInVzZXJuYW1lIjoic2FtaSIsImlhdCI6MTc0MjgyNTIzNywiZXhwIjoxNzQyODI4ODM3fQ.zkbtT4pLSrP5mLAr6BpwTFivL_fRyBQTO6YWRS3WZ-c',
    },
});
