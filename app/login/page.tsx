"use client"; //this tells Next.js that this page will run on the browser and not server
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(e: React.FormEvent){ //when login button clicked, execute function
        e.preventDefault(); //Don't refresh ( Default behaviour: browser refreshes when forms are submitted )

        //Send the data to NextAuth & control redirect
        const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        });

        if (result?.error){
            alert("Invalid email or password.")
        }else{
            alert("Login successful!")
        }
    }

    return ( 
        <div>
            <h1>Login Page</h1>

            <form onSubmit = {handleSubmit}>
                <input
                    type = "email"
                    placeholder = "Email"
                    onChange = {(e) => setEmail(e.target.value)} 
                />

                <input
                    type = "password"
                    placeholder = "Password"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type = "submit">Login</button>
            </form>
        </div>
    );
}