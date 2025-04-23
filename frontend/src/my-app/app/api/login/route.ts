// Proxy route to wrap Flask login route. Needed to set the domain of access token to frontend

import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { username, password } = await request.json();
    const backendUrl = process.env.BACKEND_DEPLOYMENT;

    try {
        const flaskResponse = await fetch(`${backendUrl}/api/login`, {
            "method": "POST",
            "body": JSON.stringify({
                username: username,
                password: password
            }),
            "headers": {
                "Content-Type": "application/json"
            },
            "credentials": "include"
        });

        if (!flaskResponse.ok) {
            const errorData = await flaskResponse.json();
            return NextResponse.json(errorData, { status: flaskResponse.status });
        }

        const data = await flaskResponse.json();
        const setCookie = flaskResponse.headers.get('set-cookie');

        const response = NextResponse.json(data, { status: flaskResponse.status });

        if (setCookie) {
            response.headers.set('Set-Cookie', setCookie);
            response.headers.append(
                "Set-Cookie",
                `address=${data.address}; Path=/; Secure; SameSite=None`
            );
        }

        return response;
    }
    catch (err) {
        console.error(`Proxy login error: ${err}`);
        return NextResponse.json({ "error": err }, { status: 500 });
    }
}