import { client, setup, getUser, connected } from "../modules/server.js";
import { ticket_UX } from "../modules/ticket.js"
await setup();
if (connected) {
    const { id, confiance } = await getUser();
    const { data } = await client
        .from("tickets_vente")
        .select("*")
        .eq("id_vendeur", id)
        .eq("statut", "Ouvert");
    const ticket = data[0];
    document.title += ticket.id_ticket;
    ticket_UX(ticket,document.getElementById('ticket'),false,true);
}