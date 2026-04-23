const client = supabase.createClient(
    "https://ytepoythtrlssufpqnac.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0ZXBveXRodHJsc3N1ZnBxbmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NzE3MTgsImV4cCI6MjA5MjQ0NzcxOH0.-9iwxSnvCdq0cNnfJ4sHkQX8lCcAulzO2zDzRG8oue4"
)

async function login() {
    const { error } = await client.auth.signInWithOAuth({
        provider: "discord"
    });
    if (error) console.error("Login error:", error.message);
}

async function logout() {
    const { error } = await client.auth.signOut();
    if (error) {
        console.error("Logout error:", error.message);
        return;
    }
    window.location.reload();
}

async function getUser() {
    const { data } = await client.auth.getUser();
    if (!data.user) return null;
    const { data: profile, error } = await client
        .from("user_profiles")
        .select("credits")
        .eq("id", data.user.id)
        .single();
    if (error) {
        console.error(error);
        return null;
    }
    return {
        id: data.user.id,
        username: data.user.user_metadata.full_name,
        avatar: data.user.user_metadata.avatar_url,
        credits: profile?.credits ?? 0
    };
}

async function pay(amount) {
    const { error } = await client.rpc("spend_credits", {
        amount: amount
    });
    if (error) {
        console.error(error.message);
    }
}

window.onload = async () => {
    //Navbar Setup
    document.body.innerHTML += `
        <nav>
            <div id="site">
                <a href="index.html"><img src="images/LogoBW.png" height="70px"></a>
                <h2>Louistiti Cards</h2>
            </div>
            
            <div id="navbar"></div>

            <div id="account">
                <button onclick="login()">Login</button>
            </div>
        </nav>
        <footer>
            <a href="https://www.cardmarket.com/fr/YuGiOh/Users/LOUISTITI"><img src="images/Cardmarket.png" height="50px"></a>
            <a href="https://discord.gg/ct97JAZdRN"><img src="images/Discord.png" height="50px"></a>
        </footer>
    `;
    //User Setup
    const user = await getUser();
    //const user = {avatar: "https://cdn.discordapp.com/avatars/1018922052620660776/35adbfcef0b504815da738983959f0f5.png",credits: 0,id: "3a4efe60-2cf5-4ecf-b275-323d6fbc571b",username: "louistiti09"};
    if (user) {
        document.getElementById("account").innerHTML = `
            <div id="credits">
                <strong>${user.username}</strong>
                <br>${user.credits} Crédits
            </div>
            <div id='pfp' onclick="logout()">
                <img id='avatar' src='${user.avatar}'>
                <img id='logout' src='images/LogOut.png'>
            </div>
        `;
        document.getElementById("navbar").innerHTML = `
            <a href="revente.html"><button>Revendre</button></a>
            <a href="classeur.html"><button>Classeur</button></a>
            <a href="credits.html"><button>Credits</button></a>
        `;
    } else {
        document.getElementById("navbar").innerHTML = `
            <button class="disabled">Revendre</button>
            <a href="classeur.html"><button>Classeur</button></a>
            <button class="disabled">Credits</button>
            <div id="need-login">Veuillez vous connecter.</div>
        `;
    }
    $(".flipbook").turn();
};