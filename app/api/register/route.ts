// Getting our tools from the toolbox.
import { NextRequest, NextResponse } from "next/server"; // reads and sents something from/to the user
import bcrypt from "bcryptjs"; // adding our encryptor
import { PrismaClient } from "@prisma/client"; //adding our translator

const prisma = new PrismaClient(); // enabling the translator ( passing it to a variable so we can use it )

async function POST(req: NextRequest){ // getting the request from Next.js
    const {email, password} = await req.json(); // destructing the data from the request to variables

    if (!email || !password){
        // if fields are missing, sent a error response back ( 400 = bad request )
        return NextResponse.json({error: "All fields required"}, {status: 400});
    }

    //prisma searches and finds if the email already exists. Result ( boolean ) added to a variable
    const existing = await prisma.user.findUnique({where: {email}});

    if (existing){
        // 409 = Conflict
        return NextResponse.json({error: "Email already exists."},{status: 409})
    }

    //hashing the password that the user gave with 10 salt rounds.
    //10 salt rounds = how many times the password gets scrambled
    //10 -> balanced ( sweet spot )
    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {email, password: hashed},
    });

    //201 = created!
    return NextResponse.json({message:"Success!"},{status: 201});
}
//receive data → validate → check duplicate → hash password → save → respond
