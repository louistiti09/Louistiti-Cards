export const client = supabase.createClient(
    "https://ytepoythtrlssufpqnac.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0ZXBveXRodHJsc3N1ZnBxbmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NzE3MTgsImV4cCI6MjA5MjQ0NzcxOH0.-9iwxSnvCdq0cNnfJ4sHkQX8lCcAulzO2zDzRG8oue4"
);

export let connected = false;

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
    window.location.href = "index.html"; // Redirige vers la page d'accueil après la déconnexion
    window.location.reload();
}

export async function getUser() {
    connected = false;
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError || !sessionData.session?.user) return null;
    const user = sessionData.session.user;
    const { data: profile, error } = await client
        .from("user_profiles")
        .select("credits, confiance")
        .eq("id", user.id)
        .single();
    if (error) {
        console.error(error);
        return null;
    }
    connected = true;
    return {
        id: user.id,
        username: user.user_metadata.full_name,
        avatar: user.user_metadata.avatar_url,
        credits: profile?.credits ?? 0,
        confiance: profile?.confiance ?? 0
    };
}

export async function pay(amount) {
    const { error } = await client.rpc("spend_credits", {
        amount: amount
    });
    if (error) {
        console.error(error.message);
    }
}

export async function setup() {
    //User Setup
    var ButtonsHTML = "";
    var AccountHTML = "";
    const user = await getUser();
    if (user) {
        ButtonsHTML = `
            <a href="revente.html"><button>Revendre</button></a>
            <a href="classeur.html"><button>Classeur</button></a>
            <a href="credits.html"><button>Credits</button></a>
        `;
        AccountHTML = `
            <div id="credits">
                <strong>${user.username}</strong>
                <br>${user.credits} Crédits
            </div>
            <div id='pfp'>
                <img id='avatar' src='${user.avatar}'>
                <img id='logout' src='images/LogOut.png'>
            </div>
        `;
    } else {
        ButtonsHTML = `
            <button class="disabled">Revendre</button>
            <a href="classeur.html"><button>Classeur</button></a>
            <button class="disabled">Credits</button>
            <div id="need-login">Veuillez vous connecter.</div>
        `;
        AccountHTML = `
            <button id="login">Login</button>
        `;
    }
    //Navbar Setup
    document.body.innerHTML += `
        <nav>
            <div id="site">
                <a href="index.html"><img src="images/LogoBW.png" height="70px"></a>
                <h2>Louistiti Cards</h2>
            </div>
            
            <div id="navbar">${ButtonsHTML}</div>

            <div id="account">${AccountHTML}</div>
        </nav>
        <footer>
            <a href="https://www.cardmarket.com/fr/YuGiOh/Users/LOUISTITI"><img src="images/Cardmarket.png" height="50px"></a>
            <a href="https://discord.gg/ct97JAZdRN"><img src="images/Discord.png" height="50px"></a>
        </footer>
    `;
    //Connect buttons
    if (user) {
        document.getElementById("pfp").addEventListener("click", logout);
    } else {
        document.getElementById("login").addEventListener("click", login);
    }
};