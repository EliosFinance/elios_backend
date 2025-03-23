import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
/**
 * Extracts and verifies JWT from the Authorization header.
 * @param authorization Authorization header value.
 * @param secret Secret key used for token verification.
 * @returns Decoded JWT payload.
 */
export const extractJwt = (authorization: string, secret: string): jwt.JwtPayload => {
    if (!authorization || !authorization.startsWith('Bearer ')) {
        throw new UnauthorizedException('Invalid or missing authorization token');
    }

    const token = authorization.split(' ')[1];

    try {
        return jwt.verify(token, secret) as jwt.JwtPayload;
    } catch (error) {
        throw new UnauthorizedException('Invalid token');
    }
};

/**
 * Retrieves the user ID from the JWT token.
 * @param authorization Authorization header.
 * @param secret Secret key for verification.
 * @returns User ID.
 */
export const getUserIdFromToken = (authorization: string): number => {
    if (!SECRET) {
        throw new UnauthorizedException('Secret key not found');
    }
    const decodedToken = extractJwt(authorization, SECRET);

    if (!decodedToken?.sub) {
        throw new UnauthorizedException('User ID not found in token');
    }

    const userId = Number(decodedToken.sub);

    if (isNaN(userId)) {
        throw new UnauthorizedException('Invalid user ID in token');
    }

    return userId;
};
