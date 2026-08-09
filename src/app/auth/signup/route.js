import { NextResponse } from "next/server";
import supabase from "@/api/client";

export async function POST(request) {
    const { email, password } = await request.json();

    if (!email || !password) {
        return NextResponse.json(
            { error: "Email and password are required" },
            { status: 400 }
        );
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
    if (data) {
    return NextResponse.json(
        { message: "User created successfully" },
        { status: 201 }
    );
 
}}