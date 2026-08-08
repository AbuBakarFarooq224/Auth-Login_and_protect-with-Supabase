import { NextResponse } from "next/server";
import supabase from "@/api/client";

export async function middleware(request) {
    const authHeader = request.headers.get("authorization");

    // No Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
            { error: "Access token required" },
            { status: 401 }
        );
    }

    // Extract the JWT
    const token = authHeader.replace("Bearer ", "");

    // Use the shared Supabase client to verify the bearer token

    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    // Invalid/expired token
    if (error || !data.user) {
        return NextResponse.json(
            { error: "Invalid token" },
            { status: 401 }
        );
    }

    // Token is valid → allow request to continue
    return NextResponse.next();
}

export const config = {
    matcher: ["/protected/:path*", "/auth/logout"]

};