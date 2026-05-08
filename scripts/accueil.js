import { client, setup } from "../modules/server.js";
setup();
//Stock
const { count: stock, error } = await client
    .from("cartes")
    .select(`
        id,
        tickets_vente!inner (
            statut
        )
    `, { count: "exact", head: true })
    .eq("tickets_vente.statut", "Validé")
    .is("id_ticket_vente", null);
document.getElementById("cartes-stock").querySelector("h2").textContent = stock;
//Ventes
const { count: ventes } = await client
    .from("cartes")
    .select("*", { count: "exact", head: true })
    .not("id_ticket_vente", "is", null);
document.getElementById("cartes-vendues").querySelector("h2").textContent = ventes;
//Reprises
const { count: reprises } = await client
    .from("cartes")
    .select(`
        id,
        tickets_vente!inner (
            statut
        )
    `, { count: "exact", head: true })
    .eq("tickets_vente.statut", "Validé");
document.getElementById("cartes-reprises").querySelector("h2").textContent = reprises;