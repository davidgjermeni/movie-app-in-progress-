"use client"
import { signOut, useSession } from "next-auth/react";

export default function Homepage(){
const {data: session, status} = useSession();

return(
    <div>
        <h1>Welcome {session?.user?.email}</h1>
        <p>You are logged in as: {session?.user?.role}</p>
        <button onClick={() => signOut({callbackUrl:"/login"})}>Sign out</button>
    </div>
);
}