// backend/data.js
const apartments = [

    

    {
        id: 1,
        title: "Studio Moderne - Cité U",
        school: "Yaoundé 1",
        price: 45000,
        distance: "200m",
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 2,
        title: "Appartement 2 Pièces - Melen",
        school: "Polytechnique",
        price: 60000,
        distance: "500m",
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 3,
        title: "Chambre Étudiante - Molyko",
        school: "Buea",
        price: 35000,
        distance: "1km",
        image: "https://images.unsplash.com/photo-1555854743-e3c2f6a581ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 1,
        title: "Appartement moderne Buea",
        school: "Molyko, Buea",
        price: 55000,
        distance: "10 min",
        image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=500&q=60", // Style cuisine moderne (ta capture 2)
        description: "Superbe appartement 2 pièces de 40m². Cuisine équipée, proche de la route principale.",
        features: ["Wifi", "Eau courante", "Sécurisé"],
        rating: 4.7
    },
    {
        id: 2,
        title: "Colocation à Melen",
        school: "Polytechnique / CHU",
        price: 60000,
        distance: "500m",
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=60", // Style chambre simple
        description: "Je cherche un(e) colocataire pour partager un appartement 2 pièces à Melen.",
        features: ["Non-fumeur", "Meublé"],
        rating: 4.5
    },
    {
        id: 3,
        title: "Studio Haut Standing",
        school: "Yaoundé 1 - Ngoa",
        price: 45000,
        distance: "200m",
        image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=500&q=60",
        description: "Studio idéal pour étudiant, calme et propice aux études. Concierge 24/24.",
        features: ["Générateur", "Parking"],
        rating: 4.8
    }
];

module.exports = apartments;