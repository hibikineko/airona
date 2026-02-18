// CNY 2026 Magazine Content
export const cnyContent = {
  issue: "CNY 2026",
  title: "Airona Files",
  subtitle: "Year of the Horse Edition",
  coverImage: "/placeholder-cny-cover.jpg", // Placeholder
  
  pages: [
    {
      id: "cover",
      type: "cover",
      data: {
        title: "Airona Files",
        subtitle: "CNY 2026 Special",
        season: "Year of the Horse",
        image: "/placeholder-cover.jpg",
      }
    },
    {
      id: "outfit-1",
      type: "outfit-showcase",
      data: {
        title: "Lunar New Year Elegance",
        description: "Celebrating in style with festive red and gold",
        images: [
          "/placeholder-outfit-1.jpg",
          "/placeholder-outfit-2.jpg",
        ],
        outfitDetails: {
          theme: "Traditional CNY",
          colors: ["Red", "Gold", "White"],
        }
      }
    },
    {
      id: "community-1",
      type: "four-grid",
      data: {
        title: "Community Celebrations",
        images: [
          { url: "/placeholder-1.jpg", caption: "Festival Lights" },
          { url: "/placeholder-2.jpg", caption: "Dragon Dance" },
          { url: "/placeholder-3.jpg", caption: "Fireworks Night" },
          { url: "/placeholder-4.jpg", caption: "Family Gathering" },
        ]
      }
    },
    {
      id: "highlights-1",
      type: "asymmetric",
      data: {
        title: "Festive Moments",
        sections: [
          {
            type: "image-left",
            image: "/placeholder-5.jpg",
            text: "Capturing the magic of CNY celebrations in Regnus"
          },
          {
            type: "image-right",
            image: "/placeholder-6.jpg",
            text: "Traditional costumes meet modern adventures"
          }
        ]
      }
    },
    {
      id: "fun-1",
      type: "full-image",
      data: {
        image: "/placeholder-fun.jpg",
        caption: "Year of the Horse brings new adventures!",
      }
    },
    {
      id: "back-cover",
      type: "back-cover",
      data: {
        contributors: [
          "Photography: Community Members",
          "Design: Airona Cult Team",
          "Special Thanks: All BPSR Players"
        ],
        image: "/placeholder-back.jpg",
      }
    }
  ]
};

export default cnyContent;
