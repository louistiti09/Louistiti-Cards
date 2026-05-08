import { client, setup, getUser, connected } from "../modules/server.js";
import { ticket_UX } from "../modules/ticket.js"
await setup();
if (connected) {
    const { id, confiance } = await getUser();
    const { data } = await client
        .from("tickets_vente")
        .select("*")
        .eq("id_vendeur", id);
    const div = document.getElementById('historique');
    for (const ticket of data) {
        div.innerHTML += `<div id="@${ticket.id_ticket}"></div>`;
        const tdiv = document.getElementById(`@${ticket.id_ticket}`);
        await ticket_UX(ticket,tdiv);
    };
}