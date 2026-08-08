import { NextResponse } from "next/server";
import supabase from "@/api/client";

export async function POST(request) {
    const { email, password }  = await request.json();

    if (!email || !password) {
        return NextResponse.json(
            { error: "Email and password are required" },
            { status: 400 }
        );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 401 }
        );
    }

    if (data) {
        return NextResponse.json(
            { access_token: data.session.access_token, refresh_token: data.session.refresh_token},
            { status: 200 }
        );
    }
}