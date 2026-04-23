const client = supabase.createClient(
    "https://ytepoythtrlssufpqnac.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0ZXBveXRodHJsc3N1ZnBxbmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NzE3MTgsImV4cCI6MjA5MjQ0NzcxOH0.-9iwxSnvCdq0cNnfJ4sHkQX8lCcAulzO2zDzRG8oue4"
)

var user = null;

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
    user = null;
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

window.onload = async () => {
    user = await getUser();
    console.log(user);
    //user = {id: 'fd0deae4-e85d-49f6-9982-f5375ff6ed0b', username: 'zouylstiti', avatar: 'images/Logo.png'};
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
    }
};