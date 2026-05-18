export async function verifyCaptcha(token: string): Promise<boolean>{
    if (!token){
        return false;
    }
    const cloudflare = "ttps://challenges.cloudflare.com/turnstile/v0/siteverify"
    const askCloud = await fetch(
        cloudflare,{
            method: "POST",
            headers:{"Content-Type": "application/json"},
            body: JSON.stringify({
                secret: process.env.TURNSTILE_SECRET_KEY, //my .env turnstile private key
                response: token, //the token the user sent
            }),
        }
    );

    const data = await askCloud.json();

     // Cloudflare responds with { success: true } or { success: false }
    return data.success;
}