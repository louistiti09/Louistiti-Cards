import { client } from "./server.js";

async function card_imgs_loading(cartes) {
    var cache = JSON.parse(sessionStorage.getItem("card_ids") || "{}");
    var temp = [];
    for (const c of cartes) {
        let id = cache[c.nom];
        if (id in temp) continue;
        temp.push(id);
        if (!(c.nom in cache)) {
            const response = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(c.nom)}`);
            const json = await response.json();
            id = json.data[0]['id'];
            cache[c.nom] = id;
        }
        for (const c_img of document.getElementsByClassName(c.id+'i')) {
            c_img.setAttribute("height","100%");
            c_img.setAttribute("src",`https://images.ygoprodeck.com/images/cards/${id}.jpg`);
        }
    };
    sessionStorage.setItem("card_ids",JSON.stringify(cache));
}

function vider_cache() {
    sessionStorage.removeItem("card_ids");
    window.location.reload();
}

export async function ticket_UX(ticket, div, buttons=false, card_edit=false) {
    div.className = "ticket";
    const { data:cartes } = await client
        .from("cartes")
        .select("*")
        .eq("id_ticket_achat", ticket.id_ticket);
    let cardsHTML = '<ul>';
    cartes.forEach(c => {
        cardsHTML += `
            <li class="content">
                <img class="${c.id}i">
                <img class="flag" src="images/flags/${c.langue}.webp">
                <strong>${c.nom}</strong>
                <em>${[c.code, c.rarete, c.etat].join(' | ')}</em>
                ${c.prix != null ? `<span class="credits">${c.prix}cr</span>` : ''}
            </li>
        `;
    });
    if (ticket.toploaders > 0) {
        cardsHTML += `<br><li class="content"><strong>Top Loaders</strong><em>x${ticket.toploaders}</em><span class="credits">${ticket.toploaders*50}cr</span></li>`
    }
    cardsHTML += '</ul>';
    div.innerHTML = `
        <h2>Ticket n°${ticket.id_ticket}</h2>
        <p><strong>Statut :</strong> <span class="${ticket.statut.toLowerCase().replace(/ /g,"-")}">${ticket.statut.toUpperCase()}</span></p>
        <p><strong>Offre :</strong> ${ticket.statut == "Fermé" ? `<span class="credits">${ticket.valeur}cr</span>` : `???`}</p>
        <hr><p><strong>Contenu :</strong><br>${cardsHTML}</p>
        ${buttons ? `
            <div id="ticket_buttons">
                <button id='send' class="disabled">✔</button>
                <a ${ticket.statut == "Ouvert" ? 'href="ticket.html"' : ''}><button id='edit' class="disabled"}>✎</button></a>
                <button id='cancel' class="disabled">✘</button>
            </div>
        ` : ''}
        <small class="date">
            ${new Date(ticket.created_at).toLocaleString()}
             | <a href="#" id="vider_cache${ticket.ticket_id}" class="date">Vider le cache</a>
        </small>
    `;
    if (buttons) {
        const send = document.getElementById("send");
        const edit = document.getElementById("edit");
        const cancel = document.getElementById("cancel");
        if (ticket.statut == "Ouvert") {
            send.className = '';
            edit.className = '';
            cancel.className = '';
            send.addEventListener("click",() => {update_status(ticket.id_ticket,'En attente');});
            cancel.addEventListener("click",() => {update_status(ticket.id_ticket,'Annulé');});
        }
    }
    document.getElementById(`vider_cache${ticket.ticket_id}`).addEventListener("click",vider_cache);
    card_imgs_loading(cartes);
}

async function update_status(id,statut) {
    const {error} = await client.rpc('update_ticket_status', {
        ticket_id: id,
        new_status: statut
    });
    if (error) console.error(error);
    window.location.href = 'revente.html';
    window.location.reload();
}