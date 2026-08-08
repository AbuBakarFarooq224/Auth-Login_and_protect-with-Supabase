import { NextResponse } from "next/server";
import supabase from "@/api/client";

export async function POST() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        return NextResponse.json(
            { error: "Logout failed" },
            { status: 500 }
        );
    }

    return new NextResponse(
        null, 
        { status: 204 }
    );
}