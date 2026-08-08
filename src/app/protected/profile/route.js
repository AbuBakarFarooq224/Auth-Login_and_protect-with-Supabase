import { NextResponse } from "next/server";
import supabase from "@/api/client";

export async function GET(request) {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
        return NextResponse.json(
            { error: "Missing authorization header" },
            { status: 401 }
        );
    }

    const token = authHeader.replace("Bearer ", "");

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
        return NextResponse.json(
            { error: "Invalid token" },
            { status: 401 }
        );
    }

    return NextResponse.json(
        { user: data.user },
        { status: 200 }
    );
}