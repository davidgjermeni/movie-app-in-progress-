// Getting our tools from the toolbox.
export const runtime = "nodejs"; //Run with Node.js not Edge runtime
import { NextRequest, NextResponse } from "next/server"; // reads and sents something from/to the user
import { PrismaClient } from "@prisma/client"; //adding our translator
import bcrypt from "bcryptjs"; // adding our encryptor

const prisma = new PrismaClient(); // enabling the translator ( passing it to a variable so we can use it )

export async function POST(req: NextRequest){ // getting the request from Next.js
    
    const {email, password} = await req.json(); // destructing the data from the request to variables
    const allowedDomains = ["gmail.com","outlook.com","hotmail.com"];

    //1: BASIC VALIDATION (doesnt touch the db)
    if (!email || !password){
        // if fields are missing, sent a error response back ( 400 = bad request )
        return NextResponse.json({error: "All fields required"}, {status: 400});
    }
    
        //hashing the password that the user gave with 10 salt rounds.
        //10 salt rounds = how many times the password gets scrambled
        //10 -> balanced ( sweet spot )
        const hashed = await bcrypt.hash(password, 10);
   
    
}

// 1. Basic validation    ← no DB, no Redis
// 2. Domain check        ← no DB, no Redis  
// 3. Rate limit          ← Redis only, blocks spammers
// 4. Duplicate check     ← DB, but spammers already blocked by step 3
// 5. Hash password       ← no DB, no Redis
// 6. Generate code       ← no DB, no Redis
// 7. Save to Redis       ← Redis only
// 8. Send email          ← only reaches here if all above passed

    


    // await prisma.user.create({
    //     data: {
    //         email, 
    //         password: hashed,
    //     },
    // });

    // //201 = created!
    // return NextResponse.json({message:"Success!"},{status: 201});

