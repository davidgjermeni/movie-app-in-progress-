import 'dotenv/config';
import prisma from './lib/prisma.js';
import bcrypt from 'bcryptjs';


async function main(){
    const hashedPassword = await bcrypt.hash("12345", 10);
    const user = await prisma.user.create({
        data:{
            email: "test@gmail.com",
            password: hashedPassword,
            role: "USER",

    }});
    console.log(user);
}
main();