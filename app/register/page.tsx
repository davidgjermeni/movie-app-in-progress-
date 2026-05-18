"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // to check if anyone is logged in
import { Turnstile } from "@marsidev/react-turnstile";

export default  function RegisterPage(){
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verifCode, setVerifCode] = useState("");
    const [captchaToken, setCaptchaToken] = useState("");
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

// ==================== SEND CODE ====================
    async function handleSendCode(){   
        if (!email){
            alert("Please enter your email first.")
            return;
        }
        //form is talking to sendCode api
        const sendCode = await fetch("/api/sendCode",{
            method: "POST", //sending data
            headers: {"Content-Type": "application/json"}, //hey, its written in JSON format
            body: JSON.stringify({email, captchaToken}), //The content.
        });

        const data = await sendCode.json();

        if (!sendCode.ok){
            alert(data.error);
            return;
        }

        alert("Email containing the verification code sent!")

    }

// ==================== REGISTER ====================
    async function handleSubmit(e: React.FormEvent){
        e.preventDefault(); //no refresh
        if (!email || !password || !verifCode){
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

        if (!captchaToken) {
            alert("Please complete the captcha.");
            return;
        }

        try{
            //form is talking to verifyRegister api
            const verifyRegister = await fetch("/api/verifyRegister",{
                method: "POST", //sending data
                headers: {"Content-Type": "application/json"}, //hey, its written in JSON format
                body: JSON.stringify({email, password, verifCode, captchaToken}), //The content.
            });

            const data = await verifyRegister.json().catch(() => ({}));

            // did something go wrong?
            // If status was 200-299(success -> true)
            //If status was anything else like 400 or 409 (errors -> false)
            if (!verifyRegister.ok){
                alert(data.error)// display the error message
                return;
            }
            alert("Account created successfully!");
            router.push("/login"); // redirect to login
        }catch(error){
            console.error("Register error:", error);
            alert("Network error. Please check your connection and try again");
        }
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
                    type = "text"
                    placeholder = "Verification Code"
                    value={verifCode}
                    onChange = {e => setVerifCode(e.target.value)}
                />
                <button type="button" onClick={handleSendCode}>Send Code</button>
                <input
                    type = "password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                
                <button type="submit">Create Account</button>
            </form>
            <div>
                <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                    onSuccess={(token) => {
                        //console check if captcha works.
                        console.log("✅ Turnstile Success! Token received:", token);
                        setCaptchaToken(token);
                    }}
                    onError={(error) => console.log("❌ Turnstile Error:", error)}
                    onExpire={() => console.log("⚠️ Turnstile token expired")}
                    onBeforeInteractive={() => console.log("Turnstile is loading...")}
                />
            </div>
        </div>
    )
//user types → boxes fill up → user hits submit → 
//validate → send to backend → show success or error
}