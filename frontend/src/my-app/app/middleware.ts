import { NextRequest, NextResponse } from "next/server";
import { jwtDecrypt, jwtVerify } from 'jose';
import next from "next";

const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

export async function middleware(req:NextRequest) {
    const accessToken = req.cookies.get('access_token')?.value;

    if (!accessToken) { // If the request has no access token, the user must sign in to get one
        return NextResponse.redirect(new URL('/Sign_In', req.url));
    }

    try {
        const { payload } = await jwtVerify(accessToken, jwtSecret);

        const role = payload.role;
        const pathname = req.nextUrl.pathname;

        // Role based locking
        if (pathname.startsWith('/admin') && role != "admin") {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
        if (pathname.startsWith('/issuer') && (role != "issuer")) {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }

        return NextResponse.next();
    } catch (err) {
        console.error(`Middleware JWT verification failed: ${err}`); 
        return NextResponse.redirect(new URL('/Sign_In', req.url));
    }
}

export const config = {
    matcher: ['/admin', '/issuer'], // Restrict these pages
}