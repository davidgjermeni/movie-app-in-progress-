import { render } from "@react-email/render";
import { NextRequest, NextResponse } from "next/server"; // reads and sents something from/to the user
import { EmailTemplate } from "@/components/email-template";
import redis from "@/lib/redis";
import { Resend } from "resend";
import { PrismaClient } from "@prisma/client"; //adding our translator

const prisma = new PrismaClient(); // enabling the translator ( passing it to a variable so we can use it )
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest){ 
    const {email, verifCode} = await req.json(); // destructing the data from the request to variables
    const allowedDomains = ["gmail.com","outlook.com","hotmail.com"];
    const emailDomain = email.split("@")[1];
    
    if(!allowedDomains.includes(emailDomain)){
        return NextResponse.json(
            {error: "Only Gmail, Outlook and Hotmail are allowed."},
            {status: 400}
        );
    }

    ////2: RATE LIMIT PER EMAIL ( 1 request per min ) ////
    const normalisedEmail = email.toLowerCase().trim();
    try{
        const lastSent = await redis.set(
            `last-sent:${normalisedEmail}`,
            "true",
            {ex: 60, nx: true},
        ); // check if the user has requested a code in the last 1 minute
        if (lastSent === null){
            return NextResponse.json({error: "Please wait before requesting another code."}, {status: 429});
        }
    }catch (error){
         console.error("Rate limit failed:", error);
    }
        
    //prisma searches and finds if the email already exists. Result ( boolean ) added to a variable
    const existing = await prisma.user.findUnique({where: {email}});

    if (existing){
        // 409 = Conflict
        return NextResponse.json({error: "Email already exists."},{status: 409})
    }
        
    //3: Generate verification code and hash the password
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    try{
        // Save verification code to redis with an expiry of 5 minutes.
        await redis.set(`verify:${normalisedEmail}`,
        JSON.stringify({email: email , code: verificationCode}),
        {ex: 60}
        );
        console.log("Success!");
    }catch(error){
        console.error("error: Redis save failed",error);
        return NextResponse.json({error: "Could not proccess redis save"}, {status: 500});
    }

    try{
    //4: Send email
    const emailTemplate = await render(EmailTemplate({ email, verificationCode }));

    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Your verification code",
        html: emailTemplate,
    });
    console.log("Resend response:",JSON.stringify(emailTemplate));
    }
    catch(error){
        console.error("error: Resend has failed to sent email",error);
        return NextResponse.json({error: "Could not proccess emails"}, {status: 500});
    }
    //5: Success!
    return NextResponse.json({ message: "Check your email for the verification code." }, { status: 200 });
}