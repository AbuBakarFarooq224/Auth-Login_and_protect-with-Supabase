import { NextResponse } from "next/server";

export async function GET(request) {
    return NextResponse.json(
        {
            message: "This is the protected profile"
        },
        { status: 200 }
    );
}