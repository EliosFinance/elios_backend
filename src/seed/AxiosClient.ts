import axios from 'axios';

export const axiosClient = axios.create({
    baseURL: 'http://localhost:3333/',
    headers: {
        Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiZmxvcmlhbi5wbHZkIiwiaWF0IjoxNzQ0MTQzNzgyLCJleHAiOjE3NDQxNDczODJ9.DoKG2Fhh8Mh9QNSn-Xcjn3pauntivh9hCGotq-Dv6_s',
    },
});
