import * as jwt from 'jsonwebtoken';

export const extractJwt = (authorization: string): jwt.JwtPayload => {
    const token = authorization.split(' ')[1];
    const payload = jwt.decode(token) as jwt.JwtPayload;

    if (!payload) {
        throw new Error('Payload not found: ' + jwt.decode(token));
    }

    return payload;
};

export const getUserIdFromToken = (authorization: string): number => {
    const decodedToken = extractJwt(authorization);
    const payload = decodedToken ? decodedToken.sub : null;

    if (!payload) {
        console.error(decodedToken);
        throw new Error('User not found');
    }
    return Number(payload);
};
