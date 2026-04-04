// Getting our tools from the toolbox.
import { NextRequest, NextResponse } from "next/server"; // reads and sents something from/to the user
import bcrypt from "bcryptjs"; // adding our encryptor
import { PrismaClient } from "@prisma/client"; //adding our translator
import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";

const prisma = new PrismaClient(); // enabling the translator ( passing it to a variable so we can use it )
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest){ // getting the request from Next.js
    const {email, password} = await req.json(); // destructing the data from the request to variables
    const allowedDomains = ["gmail.com","outlook.com","hotmail.com"]
    const emailDomain = email.split("@")[1];
    const verificationCode = Math.floor(100000 * Math.random() * 900000).toString();
    const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000);

    if (!email || !password){
        // if fields are missing, sent a error response back ( 400 = bad request )
        return NextResponse.json({error: "All fields required"}, {status: 400});
    }

    if(!allowedDomains.includes(emailDomain)){
        return NextResponse.json(
            {error: "Only Gmail, Outlook and Hotmail are allowed."},
            {status: 400}
            
        );
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
        data: {
            email, 
            password: hashed,
            verificationCode,
            verificationExpiry,
            isVerified: false,
        },
    });

    //201 = created!
    return NextResponse.json({message:"Success!"},{status: 201});
}
//receive data → validate → check duplicate → hash password → save → respond
