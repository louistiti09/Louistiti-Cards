import { client, setup, getUser, connected } from "../modules/server.js";
import { ticket_UX } from "../modules/ticket.js"
await setup();
if (connected) {
    const { id, confiance } = await getUser();
    //Ticket
    const { data } = await client
        .from("tickets_vente")
        .select("*")
        .eq("id_vendeur", id)
        .in("statut", ["Ouvert", "En attente"]);
    const div = document.getElementById("jsticket");
    if (data.length > 0) {//Fetch du ticket
        ticket_UX(data[0], div, true);
    } else {
        div.innerHTML = `
            <h2>Vous n'avez pas encore de ticket ouvert !</h2>
            <button id="open_ticket">Ouvrir un ticket</button>
        `;
        document.getElementById("open_ticket").addEventListener("click",ouvrir_ticket);
    }

    //Confiance
    const progress = document.querySelector("progress");
    progress.value = confiance;
    document.getElementById("confiance-value").textContent = confiance;
    if (confiance < 0) {
        document.getElementById("confiance-bonus").innerHTML = "❌ Interdit de vente !";
    } else {
        document.getElementById("confiance-bonus").innerHTML = `
            <ul>
                <li>✅ Système classique.</li>
                <li>${confiance >= 5 ? '✅' : '❌'} 2 Tickets par semaine. <small>(5pts)</small></li>
                <li>${confiance >= 10 ? '✅' : '❌'} Vente validée sans vérification en présentiel.  <small>(10pts)</small></li>
                <li>${confiance == 20 ? '✅' : '❌'} Les frais de vente au delà 5000 crédits restent à 10%.  <small>(20pts)</small></li>
            </ul>
        `;
    }
} else {
    window.location.href = "index.html";// Redirige vers l'accueil si non connecté
}

async function ouvrir_ticket() {
    if (connected) {
        const { id } = await getUser();
        await client
            .from("tickets_vente")
            .insert({"id_vendeur":id});
    }
    window.location.href = "ticket.html";
}