// Flow: User → handler → provider → authorize → jwt → session → frontend

import NextAuth from "next-auth";
import  CredentialsProvider  from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";


const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    // Credentials
    CredentialsProvider({
        name: "Credentials",

        credentials: {
          email:  {
            label: "Email",
            type: "email",
            placeholder: "Your email..."
          },
          password: {
            label: "Password",
            type: "password"
          }


        },
        //LOGIN logic below
        async authorize(credentials){
          if (!credentials?.email || !credentials?.password){
            return null;
            // if the email/password doesnt exist or is false, return null.
          }

          try{
            const user = await prisma.user.findUnique({
              where: {
                email: credentials.email as string //LOGIN: find user in DB
              },
            });
            

            if(!user){
              return null;  //LOGIN: check if a user with this email exists
            }

            // Compare hashed passwords
            const isPasswordValid = await bcrypt.compare(
              credentials.password as string,
              user.password
            );


            //Wrong password?
            if (!isPasswordValid){
              return null;
            }

            //If passed the above checks, success! ( returns the user )

            return{
              id: user.id.toString(),
              email: user.email,
              role: user.role
            };
          }catch (error){ // if something goes wrong, show the error.
            console.error("Login error:", error);
            return null;
            }
          
          }
        }
  
  )
  ],

  callbacks: {
    // Thats like a ticket that along your user creds has also the role.
    async jwt({ token , user }: any){
      if (user){
        token.role = user.role;
      }
      return token;
    },

    async session({ session , token }: any){
      if (token){
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    }
  },

  pages: {
    signIn: "/login",        // I will create this page later
  },

  secret: process.env.NEXTAUTH_SECRET,   // Exists in .env
};

// Handler is the "guy" that responds to the requests. ( like a waiter in a restaurant )
// Giving him permission to GET or POST. ( when opening login page or when submiting )
const handler = NextAuth(authOptions); // Create the brain
export {handler as GET, handler as POST}; // Let NextAuth use that brain