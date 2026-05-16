// Getting our tools from the toolbox.
export const runtime = "nodejs"; //Run with Node.js not Edge runtime
import { NextRequest, NextResponse } from "next/server"; // reads and sents something from/to the user
import { PrismaClient } from "@prisma/client"; //adding our translator
import bcrypt from "bcryptjs"; // adding our encryptor
import redis from "@/lib/redis";

const prisma = new PrismaClient(); // enabling the translator ( passing it to a variable so we can use it )

export async function POST(req: NextRequest){ // getting the request from Next.js
    
    const {email, password, verifCode } = await req.json(); // destructing the data from the request to variables
    const normalisedEmail = email.toLowerCase().trim();

    
    //1: BASIC VALIDATION (doesnt touch the db)
    if (!email || !password || !verifCode){
        // if fields are missing, sent a error response back ( 400 = bad request )
        return NextResponse.json({error: "All fields required"}, {status: 400});
    }
    const codeCheck = await redis.get(`verify:${normalisedEmail}`);
    //check if the code is expired
    if (!codeCheck){
        return NextResponse.json({error: "Code expired or not found. Please request a new one."},{status:400});
    }

    //basically here we check if the data is string then convert it
    //to a object so we can use it. If not the leave it as it is. ( avoiding any possible bugs )
    //this happens because of Redis client / environment might return it as a string
    const parsedData = typeof codeCheck === "string"
                        ? JSON.parse(codeCheck)
                        : codeCheck;

    //check if code is valid
    if (parsedData.code !== verifCode){
        return NextResponse.json({error:"The code is invalid."},{status: 400});
    }
    
        //hashing the password that the user gave with 10 salt rounds.
        //10 salt rounds = how many times the password gets scrambled
        //10 -> balanced ( sweet spot )
        const hashed = await bcrypt.hash(password, 10);

        await prisma.user.create({
        data: {
            email: normalisedEmail, 
            password: hashed,
        },
    });

    //201 = created!
    return NextResponse.json({message:"Account created!"},{status: 201});
    
}

// 1. Basic validation    ← no DB, no Redis
// 2. Domain check        ← no DB, no Redis  
// 3. Rate limit          ← Redis only, blocks spammers
// 4. Duplicate check     ← DB, but spammers already blocked by step 3
// 5. Hash password       ← no DB, no Redis
// 6. Generate code       ← no DB, no Redis
// 7. Save to Redis       ← Redis only
// 8. Send email          ← only reaches here if all above passed

    


    

