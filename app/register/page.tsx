"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // to check if anyone is logged in

export default  function RegisterPage(){
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verifCode, setverifCode] = useState("");
    const allowedDomains = ["gmail.com","outlook.com","hotmail.com"]
    const emailDomain = email.split("@")[1];
    //useSession has data: user info and status.
    //destructing and renaming the "data" to "session"
    //for readability
    const {data: session, status} = useSession();

    if(status === "loading"){
        return null;
    }
    if (status === "authenticated"){
            router.push("/homepage");
            return null;
    }


    async function handleSubmit(e: React.FormEvent){
        e.preventDefault(); //no refresh
        if (!email || !password){
            alert("Please fill in all fields.")
            return;
        }

        if (!allowedDomains.includes(emailDomain)){
            alert("Only Gmail, Outlook and Hotmail are allowed.")
            return;
        }

        if (password.length < 8){
            alert("Password needs to be at least 8 characters.")
            return;
        }

        //form is talking to sendCode api
        const sendCode = await fetch("/api/register",{
            method: "POST", //sending data
            headers: {"Content-Type": "application/json"}, //hey, its written in JSON format
            body: JSON.stringify({email, verifCode}), //The content.
        });

        //form is talking to verifyRegister api
        const verifyRegister = await fetch("/api/register",{
            method: "POST", //sending data
            headers: {"Content-Type": "application/json"}, //hey, its written in JSON format
            body: JSON.stringify({email, password}), //The content.
        });

        const data = await verifyRegister.json();

        // did something go wrong?
        // If status was 200-299(success -> true)
        //If status was anything else like 400 or 409 (errors -> false)
        if (!verifyRegister.ok){
            alert(data.error)// display the error message
            return;
        }
        // router.push("/login"); // redirect to login
    }

    return(
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type = "email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    type = "value"
                    placeholder = "Verification Code"
                    value={verifCode}
                    onChange = {e => setverifCode(e.target.value)}
                />
                <button type="button">Send Code</button>
                <input
                    type = "password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button type="submit">Submit</button>
            </form>
        </div>
    )
//user types → boxes fill up → user hits submit → 
//validate → send to backend → show success or error
}