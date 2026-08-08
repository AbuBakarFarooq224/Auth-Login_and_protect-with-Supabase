import { NextResponse } from "next/server";
import supabase from "@/api/client";

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data: data?.user ?? null }, { status: 201 });
    } catch (err) {
        return NextResponse.json(
            { error: err?.message ?? String(err), stack: err?.stack ?? null },
            { status: 500 }
        );
    }
}