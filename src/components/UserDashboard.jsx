import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUserAuth } from "../store";
import HungryVideo from "../assets/v1.mp4"; // 👈 your video file
import { addRestaurant } from "../store";
import { API_BASE_URL } from "../config";



const UserDashboard = ({
  onBack,
  onOpenBooking,
  history,
  setHistory,
  favorites,
  setFavorites,
}) => {
  const auth = useSelector((state) => state.auth);
  const restaurants = useSelector((state) => state.restaurants.list);
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [currentQuote, setCurrentQuote] = useState("");
  const [currentDishIndex, setCurrentDishIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showFavouritesPanel, setShowFavouritesPanel] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [message, setMessage] = useState("");

  const funnyMessages = [
    "Restaurant aapka wait kar raha hai, book table now 🍽️",
    "Pet bhara ya sirf aankhon ka khana? Table book karo 😄",
    "Chef aapko yaad kar raha hai 👨‍🍳",
    "Video dekh li, ab table bhi book kar lo 😉",
    "Screen pe nahi, plate mein khana better lagta hai 😋",
    "Video khatam, bhookh shuru 😜",
    "Table khali hai, bas aapka intezaar hai 🪑",
    "Chef ready hai, aap kab aa rahe ho? 👨‍🍳",
  ];

  const closeVideo = () => {
    setActiveVideo(null);
    const random =
      funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
    setMessage(random);
    setTimeout(() => setMessage(""), 4000);
  };


  // Chef apply modal + form
  const [showChefApplyPanel, setShowChefApplyPanel] = useState(false);
  const [selectedChefJob, setSelectedChefJob] = useState(null);
  const [chefApplicationForm, setChefApplicationForm] = useState({
    fullName: "",
    phone: "",
    experience: "",
    speciality: "",
    expectedSalary: "",
    notes: "",
  });

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // ⭐ NEW: restaurant ratings loaded from localStorage (BookingPage me save hue)
  const [restaurantRatings, setRestaurantRatings] = useState({});

  const funLines = [
    "🍛 Khana khaya kya?",
    "😋 Yummy vibes only!",
    "🔥 Aaj toh pet bhar ke khana hai!",
    "🍽️ Order karo, tension mat lo!",
    "🤤 Swad ka overload incoming!",
  ];

  const dishImages = [
    "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg",
    "https://images.pexels.com/photos/1117862/pexels-photo-1117862.jpeg",
    "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg",
    "https://www.tastingtable.com/img/gallery/20-delicious-indian-dishes-you-have-to-try-at-least-once/chana-masala-1733153567.jpg",
    "https://www.vikhrolicucina.com/uploads/content/jalebi.jpg",];

  const dishCards = [
    {
      name: "Paneer Butter Masala",
      image:
        "https://media.istockphoto.com/id/1353844525/photo/curd-paneer-masala.jpg?s=2048x2048&w=is&k=20&c=kBwOp15XmpHIu3IdRJi4wCkVedVxYso6NxEkSz1NAW4=",
      video: "https://www.youtube.com/embed/U1LVDFwi8qI",
    },
    {
      name: "Masala Dosa",
      image:
        "https://images.pexels.com/photos/12392915/pexels-photo-12392915.jpeg",
      video: "https://www.youtube.com/embed/0ITcCYudhrY",
    },
    {
      name: "Chole Bhature",
      image:
        "https://media.istockphoto.com/id/1292633282/photo/chole-bhature-spicy-chick-peas-curry-also-known-as-chole-or-channa-masala-is-traditional.jpg?b=1&s=612x612&w=0&k=20&c=sHeK8mSOACWMHGdJqIzuwJxsBrnl0awF0g3Becib4t8=",
      video: "https://www.youtube.com/embed/EOZ49NpcnJo",
    },
    {
      name: "Biryani",
      image:
        "https://media.istockphoto.com/id/2212836819/photo/indian-veg-biryani-veg-pulav-indian-vegetable-pulav-biriyani-vegetable-biriyani-served-in-a.jpg?s=2048x2048&w=is&k=20&c=dmW6JtlJIXt1671D2KiQh3kO4VcjJpyOnqKjHZ9PXRg=",
      video: "https://www.youtube.com/embed/-eopm4xaNIw",
    },
    {
      name: "Pav Bhaji",
      image:
        "https://media.istockphoto.com/id/1438867572/photo/pav-bhaji-is-a-fast-food-dish-from-india-consisting-of-a-thick-vegetable-curry-served-with.jpg?s=612x612&w=0&k=20&c=vMD1YWTq7tf5iGtUAa4IqsfGY-QjDLW3ii0OdiZWHuc=",
      video: "https://www.youtube.com/embed/ZtuuIcybzt4",
    },
    {
      name: "Rajma Chawal",
      image:
        "https://www.spiceupthecurry.com/wp-content/uploads/2021/03/rajma-chawal-1-500x500.jpg",
      video: "https://www.youtube.com/embed/87stp3_232U",
    },
  ];


  // Sample chef openings (dummy data)
  const chefJobs = [
    {
      id: 1,
      restaurantName: "Spice Villa",
      position: "Head Chef - North Indian",
      location: "Lucknow",
      experience: "3+ years",
      salaryRange: "₹35,000 - ₹45,000",
      shift: "Full-time · Evening shift",
      requirements: [
        "Strong command over North Indian curries & tandoor",
        "Team handling experience",
        "Menu planning & costing knowledge",
      ],
    },
    {
      id: 2,
      restaurantName: "Urban Bites Cafe",
      position: "Sous Chef - Continental",
      location: "Bengaluru",
      experience: "2+ years",
      salaryRange: "₹28,000 - ₹38,000",
      shift: "Full-time · Rotational",
      requirements: [
        "Experience with pasta, pizza & grills",
        "Good plating & presentation skills",
        "Basic inventory management",
      ],
    },
    {
      id: 3,
      restaurantName: "Royal Thali House",
      position: "Commis Chef - Multi-cuisine",
      location: "Mumbai",
      experience: "1+ year",
      salaryRange: "₹18,000 - ₹25,000",
      shift: "Full-time · Morning & Evening",
      requirements: [
        "Assist senior chefs in prep & cooking",
        "Basic knowledge of Indian gravies",
        "Willingness to learn & grow",
      ],
    },
  ];
  

  // ⭐ helper: open google maps link in new tab
  const openInMaps = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ⭐ NEW: load restaurant ratings from localStorage (set by BookingPage)
  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("restaurantRatings") || "{}"
      );
      setRestaurantRatings(stored || {});
    } catch (e) {
      console.error("Failed to load restaurantRatings", e);
      setRestaurantRatings({});
    }
  }, []);

  // quote rotation
  useEffect(() => {
    setCurrentQuote(funLines[0]);
    setCurrentDishIndex(0);
    const id = setInterval(() => {
      const randomQuote =
        funLines[Math.floor(Math.random() * funLines.length)];
      setCurrentQuote(randomQuote);
      setCurrentDishIndex((prev) => (prev + 1) % dishImages.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (restaurants.length > 0) return;
    const fetchRestaurants = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/restaurants`);
        if (!res.ok) {
          console.error("Failed to fetch restaurants");
          return;
        }
        const data = await res.json();

        // Clear old restaurants before adding DB ones
        // dispatch(clearRestaurants());  // only if needed later

        data.forEach((r) => {
          dispatch(
            addRestaurant({
              id: r.id,
              name: r.name,
              area: r.area,
              city: r.city,
              state: r.state,
              cuisines: ["From DB"],
            })
          );
        });
      } catch (error) {
        console.error("Error fetching:", error);
      }
    };

    fetchRestaurants();
  }, []);


  // fill profile form when opened
  useEffect(() => {
    if (!showProfilePanel || !auth.user) return;
    setProfileForm({
      firstName: auth.user.firstName || auth.user.name || "",
      lastName: auth.user.lastName || "",
      email: auth.user.email || "",
      phone: auth.user.phone || "",
    });
  }, [showProfilePanel, auth.user]);

  const filteredRestaurants = restaurants.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q) ||
      (r.area && r.area.toLowerCase().includes(q)) ||
      (r.state && r.state.toLowerCase().includes(q))
    );
  });
    // ⭐ same restaurant (name+city) ka duplicate card mat dikhana
  const uniqueRestaurants = filteredRestaurants.filter((r, index, arr) => {
    return (
      index ===
      arr.findIndex(
        (other) =>
          other.name.toLowerCase() === r.name.toLowerCase() &&
          (other.city || "").toLowerCase() === (r.city || "").toLowerCase()
      )
    );
  });


  const handleLogout = () => {
    dispatch(setUserAuth(null));
    onBack();
  };

  const handleProfileInputChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    if (!auth.user) return;

    const userAccounts = JSON.parse(
      localStorage.getItem("userAccounts") || "[]"
    );
    const index = userAccounts.findIndex(
      (u) =>
        u.email === auth.user.email ||
        u.username === auth.user.name ||
        u.username === auth.user.username
    );

    if (index !== -1) {
      userAccounts[index] = {
        ...userAccounts[index],
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        email: profileForm.email,
        phone: profileForm.phone,
      };
      localStorage.setItem("userAccounts", JSON.stringify(userAccounts));
    }

    dispatch(
      setUserAuth({
        ...auth.user,
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        email: profileForm.email,
        phone: profileForm.phone,
        name: profileForm.firstName || auth.user.name,
        username: profileForm.firstName || auth.user.username,
      })
    );

    alert("Profile updated successfully.");
    setShowProfilePanel(false);
  };

  // Chef application handlers
  const openChefApply = (job) => {
    setSelectedChefJob(job);
    setChefApplicationForm((prev) => ({
      ...prev,
      fullName:
        profileForm.firstName || auth.user?.name || auth.user?.username || "",
      phone: profileForm.phone || auth.user?.phone || "",
    }));
    setShowChefApplyPanel(true);
  };

  const handleChefFormChange = (field, value) => {
    setChefApplicationForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitChefApplication = () => {
    if (!selectedChefJob) return;

    if (!chefApplicationForm.fullName || !chefApplicationForm.phone) {
      alert("Please enter your name and phone number.");
      return;
    }

    const existing =
      JSON.parse(localStorage.getItem("chefApplications") || "[]") || [];

    const newApplication = {
      id: Date.now(),
      jobId: selectedChefJob.id,
      jobTitle: selectedChefJob.position,
      restaurantName: selectedChefJob.restaurantName,
      userEmail: auth.user?.email || "",
      ...chefApplicationForm,
      date: new Date().toLocaleString(),
    };

    existing.push(newApplication);
    localStorage.setItem("chefApplications", JSON.stringify(existing));

    alert(
      "Application submitted! The restaurant will contact you if you are shortlisted."
    );
    setShowChefApplyPanel(false);
    setSelectedChefJob(null);
  };

  // Back arrow to Login page
  const BackArrow = () => (
    <button
      onClick={onBack}
      style={{
        position: "absolute",
        left: "2.2%",
        top: "10%",
        borderRadius: "999px",
        border: "none",
        padding: "4px 10px",
        backgroundColor: "rgba(0,0,0,0.6)",
        color: "#fff",
        fontSize: 12,
        cursor: "pointer",
        zIndex: 5,
      }}
    >
      ← Back
    </button>
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <BackArrow />

      {/* overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
        }}
      />

      {/* fun popup quote */}
      {currentQuote && (
        <div
          style={{
            position: "absolute",
            right: "1%",
            top: "4%",
            backgroundColor: "rgba(255,255,255,0.95)",
            padding: "8px 9px",
            borderRadius: 16,
            fontSize: 13,
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            maxWidth: 280,
            zIndex: 4,
          }}
        >
          <div style={{ flex: 1 }}>{currentQuote}</div>
          {dishImages[currentDishIndex] && (
            <img
              src={dishImages[currentDishIndex]}
              alt="Delicious Indian Dish"
              style={{
                width: 70,
                height: 50,
                borderRadius: 10,
                objectFit: "cover",
              }}
            />
          )}
        </div>
      )}

      {/* top bar with logo & menu */}
      <div
        style={{
          position: "absolute",
          left: "3%",
          top: "3%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "#fff",
          zIndex: 6,
        }}
      >
        <img
          src="/src/assets/eat.png"
          alt="eat"
          style={{ width: 40, height: 40, cursor: "pointer" }}
          onClick={() => setShowMenu((prev) => !prev)}
        />
        <div
          style={{ cursor: "pointer" }}
          onClick={() => setShowMenu((prev) => !prev)}
        >
          <div style={{ fontWeight: "bold", fontSize: 18 }}>DiGiDine</div>
          <div style={{ fontSize: 11, color: "#FFECB3" }}>
            Hi {auth.user?.name || "Foodie"}! Ready to eat? 😋
          </div>
        </div>
      </div>

      {/* logo dropdown menu */}
      {showMenu && (
        <div
          style={{
            position: "absolute",
            left: "3%",
            top: "9%",
            backgroundColor: "rgba(255,255,255,0.97)",
            borderRadius: 12,
            padding: "6px 12px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.45)",
            fontSize: 13,
            minWidth: 160,
            zIndex: 9999,
          }}
        >
          <button
            style={{
              width: "100%",
              textAlign: "left",
              border: "none",
              background: "transparent",
              padding: "4px 2px",
              cursor: "pointer",
            }}
            onClick={() => setShowMenu(false)}
          >
            🏠 Home
          </button>
          <button
            style={{
              width: "100%",
              textAlign: "left",
              border: "none",
              background: "transparent",
              padding: "4px 2px",
              cursor: "pointer",
            }}
            onClick={() => {
              setShowMenu(false);
              setShowProfilePanel(true);
            }}
          >
            👤 Profile
          </button>
          <button
            style={{
              width: "100%",
              textAlign: "left",
              border: "none",
              background: "transparent",
              padding: "4px 2px",
              cursor: "pointer",
            }}
            onClick={() => {
              setShowMenu(false);
              setShowHistoryPanel(true);
            }}
          >
            📜 Order History
          </button>
          <button
            style={{
              width: "100%",
              textAlign: "left",
              border: "none",
              background: "transparent",
              padding: "4px 2px",
              cursor: "pointer",
            }}
            onClick={() => {
              setShowMenu(false);
              setShowFavouritesPanel(true);
            }}
          >
            ⭐ Favourites
          </button>
          <button
            style={{
              width: "100%",
              textAlign: "left",
              border: "none",
              background: "transparent",
              padding: "4px 2px",
              color: "#d32f2f",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      )}

      {/* main card */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "55%",
          transform: "translate(-50%, -50%)",
          width: "92%",
          maxWidth: 900,
          maxHeight: "80vh",
          backgroundColor: "rgba(255,255,255,0.97)",
          borderRadius: 22,
          padding: "16px 20px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          overflowY: "auto",
          zIndex: 4,
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: "bold" }}>
              Your Food Dashboard
            </div>
            <div style={{ fontSize: 12, color: "#555" }}>
              Choose a restaurant and start your booking.
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#777" }}>
            Logged in as:{" "}
            <strong>{auth.user?.email || auth.user?.name || "Guest"}</strong>
          </div>
        </div>

        {/* 1️⃣ restaurant chooser */}
        <div
          style={{
            borderRadius: 16,
            border: "1px solid #eee",
            padding: "10px 12px",
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 6 }}>
            1️⃣ Choose your restaurant
          </div>
          <div style={{ fontSize: 11, color: "#777", marginBottom: 6 }}>
            Pick a restaurant to book a table and order.
          </div>

          <input
            type="text"
            placeholder="Search by name, area, city, state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "6px 8px",
              fontSize: 12,
              marginBottom: 8,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            {uniqueRestaurants.map((r) => {
              // ⭐ user rating from localStorage, agar hai to woh dikhayenge
              const userRatingObj = restaurantRatings[r.id];
              const userRating = userRatingObj?.rating
                ? Number(userRatingObj.rating)
                : null;

              // ⭐ display rating: userRating > restaurant default > fallback 4.2
              const displayRating = userRating
                ? userRating
                : r.rating
                ? Number(r.rating)
                : 4.2;

              const displayRatingCount = r.ratingCount || (userRating ? 1 : 10);

              // Google Maps link: agar restaurant ne khud diya hai (locationUrl),
              // to woh use hoga, warna name+area+city se search hoga
              const mapUrl =
                r.locationUrl ||
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${r.name} ${r.area || ""} ${r.city || ""}`.trim()
                )}`;

              return (
                <div
                  key={r.id}
                  style={{
                    flex: "0 0 220px",
                    borderRadius: 12,
                    border: "1px solid #ddd",
                    padding: "8px 10px",
                    backgroundColor: "rgba(250,250,250,0.95)",
                    fontSize: 12,
                  }}
                >
                  {/* top row: name + location icon */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 6,
                      marginBottom: 2,
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>{r.name}</div>

                    {/* 📍 Location icon – hamesha visible */}
                    <button
                      onClick={() => openInMaps(mapUrl)}
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: 16,
                        lineHeight: 1,
                      }}
                      title="Open in Google Maps"
                    >
                      📍
                    </button>
                  </div>

                  {/* ⭐ Rating row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      marginBottom: 2,
                    }}
                  >
                    <span>⭐</span>
                    <span>{displayRating.toFixed(1)}/5</span>
                    <span style={{ color: "#777" }}>
                      ({displayRatingCount} ratings
                      {userRating ? ", incl. yours" : ""})
                    </span>
                  </div>

                  {/* address */}
                  <div style={{ fontSize: 11, color: "#555" }}>
                    {r.area ? `${r.area}, ` : ""}
                    {r.city}
                    {r.state ? `, ${r.state}` : ""}
                  </div>

                  {/* cuisines */}
                  {r.cuisines && (
                    <div
                      style={{ fontSize: 11, color: "#777", marginTop: 2 }}
                    >
                      {r.cuisines.join(" · ")}
                    </div>
                  )}

                  <button
                    style={{
                      marginTop: 6,
                      padding: "4px 10px",
                      borderRadius: 999,
                      border: "none",
                      backgroundColor: "#2196f3",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: 11,
                    }}
                    onClick={() => onOpenBooking(r.id)}
                  >
                    Open Booking &amp; Menu
                  </button>
                </div>
              );
            })}
            {filteredRestaurants.length === 0 && (
              <div style={{ fontSize: 12, color: "#777" }}>
                No restaurants match your search.
              </div>
            )}
          </div>
        </div>

        {/* 2️⃣ Indian dishes images/cards */}
        <div
          style={{
            borderRadius: 16,
            border: "1px solid #eee",
            padding: "10px 12px",
          }}
        >
          {/* Hover CSS */}
          <style>{`
            .dish-card {
              flex: 0 0 160px;
              height: 110px;
              border-radius: 12px;
              position: relative;
              overflow: hidden;
              cursor: pointer;
              transition: all 0.35s ease;
              box-shadow: 0 4px 10px rgba(0,0,0,0.25);
            }

            .dish-card img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              transition: transform 0.45s ease;
            }

            .dish-card:hover {
              transform: scale(1.1) translateY(-8px);
              box-shadow: 0 14px 28px rgba(0,0,0,0.5);
              z-index: 10;
            }

            .dish-card:hover img {
              transform: scale(1.18);
            }
          `}</style>

          <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 6 }}>
            2️⃣ Explore Indian Dishes
          </div>
          <div style={{ fontSize: 11, color: "#777", marginBottom: 8 }}>
            Some popular Indian dishes to tempt your taste buds 😍
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            {dishCards.map((dish) => (
              <div
                key={dish.name}
                className="dish-card"
                onClick={() => setActiveVideo(dish.video)}
              >
                <img src={dish.image} alt={dish.name} />

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.1))",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    bottom: 6,
                    left: 8,
                    right: 8,
                    fontSize: 12,
                    fontWeight: "bold",
                    color: "#fff",
                    textShadow: "0 1px 3px rgba(0,0,0,0.7)",
                    textAlign: "center",
                  }}
                >
                  {dish.name}
                </div>
              </div>
            ))}
          </div>

          {/* Video Modal */}
          {activeVideo && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  width: "80%",
                  maxWidth: 700,
                  background: "#000",
                  borderRadius: 12,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <button
                  onClick={closeVideo}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 10,
                    background: "red",
                    color: "#fff",
                    border: "none",
                    padding: "4px 8px",
                    cursor: "pointer",
                    borderRadius: 6,
                    zIndex: 10,
                  }}
                >
                  ✕
                </button>

                <iframe
                  width="100%"
                  height="400"
                  src={activeVideo}
                  title="Dish Video"
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Funny message popup */}
          {message && (
            <div
              style={{
                position: "fixed",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#222",
                color: "#fff",
                padding: "10px 18px",
                borderRadius: 30,
                fontSize: 14,
                boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                zIndex: 2000,
              }}
            >
              {message}
            </div>
          )}
        </div>

        {/* 3️⃣ GET HIRED AS CHEF – visible for all users */}
        <div
          style={{
            borderRadius: 16,
            border: "1px solid #eee",
            padding: "10px 12px",
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 6 }}>
            3️⃣ Get Hired
          </div>
          <div style={{ fontSize: 11, color: "#777", marginBottom: 8 }}>
            Connecting right chef with right restaurant. Browse open chef jobs
            and apply directly from DiGiDine. 🍳👨‍🍳
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              maxHeight: 220,
              overflowY: "auto",
            }}
          >
            {chefJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  flex: "0 0 260px",
                  borderRadius: 12,
                  border: "1px solid #ddd",
                  padding: "8px 10px",
                  backgroundColor: "rgba(250,250,250,0.95)",
                  fontSize: 12,
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    marginBottom: 2,
                  }}
                >
                  {job.position}
                </div>
                <div style={{ fontSize: 11, color: "#555" }}>
                  {job.restaurantName} · {job.location}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#777",
                    marginTop: 4,
                  }}
                >
                  Experience: <strong>{job.experience}</strong>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#777",
                  }}
                >
                  Salary: <strong>{job.salaryRange}</strong>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#777",
                    marginBottom: 4,
                  }}
                >
                  Shift: {job.shift}
                </div>
                <ul
                  style={{
                    fontSize: 10,
                    color: "#666",
                    marginLeft: 16,
                    marginBottom: 6,
                  }}
                >
                  {job.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
                <button
                  style={{
                    marginTop: 2,
                    padding: "4px 10px",
                    borderRadius: 999,
                    border: "none",
                    backgroundColor: "#43a047",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: "bold",
                  }}
                  onClick={() => openChefApply(job)}
                >
                  ✅ Apply Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4️⃣ GUIDELINES / HOW TO USE DIGIDINE */}
        <div
          style={{
            borderRadius: 16,
            border: "1px solid #eee",
            padding: "10px 12px",
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 6 }}>
            4️⃣ How to use DiGiDine (Guidelines)
          </div>
          <div style={{ fontSize: 11, color: "#777", marginBottom: 8 }}>
            A quick guide to make the most out of DiGiDine – from table booking
            to live menu, offers and chef jobs. 🚀
          </div>

          <ul
            style={{
              fontSize: 11,
              color: "#555",
              marginLeft: 16,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <li>
              <strong>1. Create / Login to your account</strong> – Sign up or
              login so DiGiDine can save your profile, favourites and order
              history.
            </li>
            <li>
              <strong>2. Browse restaurants</strong> – Use{" "}
              <em>“Choose your restaurant”</em> section to search by name, area,
              city or state and discover nearby places.
            </li>
            <li>
              <strong>3. See live restaurant menu</strong> – Click{" "}
              <em>“Open Booking &amp; Menu”</em> to view the restaurant’s live
              menu with dishes, prices and special items.
            </li>
            <li>
              <strong>4. Smart table booking</strong> – Select your preferred
              restaurant, choose date, time, number of guests and confirm your
              table – no need to call the restaurant. 🍽️
            </li>
            <li>
              <strong>5. Pre-order food (coming soon)</strong> – From the live
              menu you can select dishes in advance so your food starts getting
              prepared before you even reach.
            </li>
            <li>
              <strong>6. live food preparation timer</strong> – Track
              preparation time with real timer so you’re never confused about
              where your order is. ⏱️
            </li>
            <li>
              <strong>7. Best table offers & discounts</strong> – While booking
              you can see table-based offers, combo deals and other discounts
              highlighted by DiGiDine for extra savings. 💸
            </li>
            <li>
              <strong>8. Manage favourites</strong> – Mark dishes as favourite
              from the booking/order screen and then view them anytime in the{" "}
              <em>“⭐ Favourites”</em> section with your ratings.
            </li>
            <li>
              <strong>9. Track complete order history</strong> – Go to{" "}
              <em>“📜 Order History”</em> to see all past transactions, food
              ordered, total bill and table details – perfect for quick re-
              order.
            </li>
            <li>
              <strong>10. Update your profile</strong> – Keep your name, email
              and phone updated from the <em>“👤 Profile”</em> section so
              restaurants can contact you easily for confirmations.
            </li>
            <li>
              <strong>11. Apply for chef jobs</strong> – If you are a chef,
              scroll to <em>“3️⃣ Get Hired as a Chef”</em>, explore openings and
              submit your application directly to restaurants.
            </li>
            <li>
              <strong>12. Enjoy a connected experience</strong> – DiGiDine
              connects <em>right customer → right restaurant → right chef</em>{" "}
              using bookings, live menus, offers and hiring – all in one
              place.✨
            </li>
            <li>
              <strong>13. Enjoy Booking with the musical experience</strong> – Click on Play Music 🎶🎶🎶.
            </li>
           <li>
              <strong>13. HelpLine Number 10566</strong> – We are Here to solve Your Problems.
            </li>
          </ul>
        </div>
      </div>

      {/* BOTTOM LEFT VIDEO WITH COMMENT BUBBLE */}
      <div
        style={{
          position: "absolute",
          bottom: "2%",
          left: "2%",
          width: 260,
          height: 360,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
          zIndex: 7,
        }}
      >
        <video
          src={HungryVideo}
          autoPlay
          muted
          loop
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* COMMENT BUBBLE ON VIDEO */}
        <div
          style={{
            position: "absolute",
            bottom: "6%",
            left: "6%",
            backgroundColor: "rgba(255,255,255,0.95)",
            padding: "8px 12px",
            borderRadius: 16,
            fontSize: 12,
            fontWeight: "bold",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          <span>💬 Feeling hungry but no money?</span>
          <span>👉 Grab the best table offer now! 🔥</span>
        </div>
      </div>

      {/* PROFILE PANEL */}
      {showProfilePanel && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 30,
          }}
        >
          <div
            style={{
              width: 360,
              maxWidth: "90%",
              backgroundColor: "#ffffff",
              borderRadius: 18,
              padding: "16px 18px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                fontSize: 16,
                marginBottom: 8,
              }}
            >
              👤 My Profile
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#666",
                marginBottom: 10,
              }}
            >
              View and edit your DiGiDine account details.
            </div>

            <div style={{ fontSize: 12, marginBottom: 8 }}>
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 11, marginBottom: 2 }}>
                  First Name
                </div>
                <input
                  type="text"
                  value={profileForm.firstName}
                  onChange={(e) =>
                    handleProfileInputChange("firstName", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    fontSize: 12,
                  }}
                />
              </div>
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 11, marginBottom: 2 }}>Last Name</div>
                <input
                  type="text"
                  value={profileForm.lastName}
                  onChange={(e) =>
                    handleProfileInputChange("lastName", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    fontSize: 12,
                  }}
                />
              </div>
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 11, marginBottom: 2 }}>Email</div>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    handleProfileInputChange("email", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    fontSize: 12,
                  }}
                />
              </div>
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 11, marginBottom: 2 }}>
                  Phone Number
                </div>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) =>
                    handleProfileInputChange("phone", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    fontSize: 12,
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 8,
              }}
            >
              <button
                onClick={() => setShowProfilePanel(false)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: "1px solid #ccc",
                  backgroundColor: "#fafafa",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <button
                onClick={handleSaveProfile}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: "none",
                  backgroundColor: "#2196f3",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER HISTORY PANEL */}
      {showHistoryPanel && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 30,
          }}
        >
          <div
            style={{
              width: "90%",
              maxWidth: 700,
              maxHeight: "80vh",
              backgroundColor: "#ffffff",
              borderRadius: 18,
              padding: "16px 18px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
              overflowY: "auto",
              fontSize: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  📜 Order History
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#666",
                  }}
                >
                  All transactions done on DiGiDine.
                </div>
              </div>
              <button
                onClick={() => setShowHistoryPanel(false)}
                style={{
                  borderRadius: 999,
                  border: "none",
                  padding: "4px 10px",
                  backgroundColor: "#f44336",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                ✕ Close
              </button>
            </div>

            {history.length === 0 ? (
              <div style={{ fontSize: 12, color: "#777", marginTop: 6 }}>
                No orders yet. Place an order to see your history here.
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 11,
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th
                      style={{
                        border: "1px solid #ddd",
                        padding: "4px 6px",
                        textAlign: "left",
                      }}
                    >
                      Date
                    </th>
                    <th
                      style={{
                        border: "1px solid #ddd",
                        padding: "4px 6px",
                        textAlign: "left",
                      }}
                    >
                      Restaurant
                    </th>
                    <th
                      style={{
                        border: "1px solid #ddd",
                        padding: "4px 6px",
                        textAlign: "left",
                      }}
                    >
                      Food Ordered
                    </th>
                    <th
                      style={{
                        border: "1px solid #ddd",
                        padding: "4px 6px",
                        textAlign: "left",
                      }}
                    >
                      Total
                    </th>
                    <th
                      style={{
                        border: "1px solid #ddd",
                        padding: "4px 6px",
                        textAlign: "left",
                      }}
                    >
                      Table
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id}>
                      <td
                        style={{
                          border: "1px solid #eee",
                          padding: "4px 6px",
                        }}
                      >
                        {h.date}
                      </td>
                      <td
                        style={{
                          border: "1px solid #eee",
                          padding: "4px 6px",
                        }}
                      >
                        {h.restaurant}
                      </td>
                      <td
                        style={{
                          border: "1px solid #eee",
                          padding: "4px 6px",
                        }}
                      >
                        {h.food}
                      </td>
                      <td
                        style={{
                          border: "1px solid #eee",
                          padding: "4px 6px",
                        }}
                      >
                        {h.total}
                      </td>
                      <td
                        style={{
                          border: "1px solid #eee",
                          padding: "4px 6px",
                        }}
                      >
                        {h.table}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* FAVOURITES PANEL */}
      {showFavouritesPanel && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 30,
          }}
        >
          <div
            style={{
              width: "90%",
              maxWidth: 600,
              maxHeight: "80vh",
              backgroundColor: "#ffffff",
              borderRadius: 18,
              padding: "16px 18px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
              overflowY: "auto",
              fontSize: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  ⭐ Favourites
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#666",
                  }}
                >
                  All dishes you&apos;ve added as favourite with ratings.
                </div>
              </div>
              <button
                onClick={() => setShowFavouritesPanel(false)}
                style={{
                  borderRadius: 999,
                  border: "none",
                  padding: "4px 10px",
                  backgroundColor: "#f44336",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                ✕ Close
              </button>
            </div>

            {favorites.length === 0 ? (
              <div style={{ fontSize: 12, color: "#777", marginTop: 6 }}>
                No favourites yet. Mark dishes as favourite from the booking
                page.
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 11,
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th
                      style={{
                        border: "1px solid #ddd",
                        padding: "4px 6px",
                        textAlign: "left",
                      }}
                    >
                      Restaurant
                    </th>
                    <th
                      style={{
                        border: "1px solid #ddd",
                        padding: "4px 6px",
                        textAlign: "left",
                      }}
                    >
                      Dish
                    </th>
                    <th
                      style={{
                        border: "1px solid #ddd",
                        padding: "4px 6px",
                        textAlign: "left",
                      }}
                    >
                      Rating
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {favorites.map((f) => (
                    <tr key={f.id}>
                      <td
                        style={{
                          border: "1px solid #eee",
                          padding: "4px 6px",
                        }}
                      >
                        {f.restaurantName}
                      </td>
                      <td
                        style={{
                          border: "1px solid #eee",
                          padding: "4px 6px",
                        }}
                      >
                        {f.dishName}
                      </td>
                      <td
                        style={{
                          border: "1px solid #eee",
                          padding: "4px 6px",
                        }}
                      >
                        {f.rating}★
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* CHEF APPLY PANEL */}
      {showChefApplyPanel && selectedChefJob && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 35,
          }}
        >
          <div
            style={{
              width: 380,
              maxWidth: "90%",
              backgroundColor: "#ffffff",
              borderRadius: 18,
              padding: "16px 18px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
              fontSize: 12,
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                fontSize: 16,
                marginBottom: 4,
              }}
            >
              🧑‍🍳 Apply for {selectedChefJob.position}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#666",
                marginBottom: 8,
              }}
            >
              {selectedChefJob.restaurantName} · {selectedChefJob.location}
            </div>

            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 11, marginBottom: 2 }}>Full Name</div>
              <input
                type="text"
                value={chefApplicationForm.fullName}
                onChange={(e) =>
                  handleChefFormChange("fullName", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  fontSize: 12,
                }}
              />
            </div>

            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 11, marginBottom: 2 }}>Phone Number</div>
              <input
                type="tel"
                value={chefApplicationForm.phone}
                onChange={(e) =>
                  handleChefFormChange("phone", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  fontSize: 12,
                }}
              />
            </div>

            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 11, marginBottom: 2 }}>
                Years of Experience
              </div>
              <input
                type="text"
                placeholder="e.g. 3 years"
                value={chefApplicationForm.experience}
                onChange={(e) =>
                  handleChefFormChange("experience", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  fontSize: 12,
                }}
              />
            </div>

            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 11, marginBottom: 2 }}>
                Cuisine Speciality
              </div>
              <input
                type="text"
                placeholder="e.g. North Indian, Chinese, Bakery"
                value={chefApplicationForm.speciality}
                onChange={(e) =>
                  handleChefFormChange("speciality", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  fontSize: 12,
                }}
              />
            </div>

            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 11, marginBottom: 2 }}>
                Expected Salary (per month)
              </div>
              <input
                type="text"
                placeholder="e.g. ₹30,000"
                value={chefApplicationForm.expectedSalary}
                onChange={(e) =>
                  handleChefFormChange("expectedSalary", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  fontSize: 12,
                }}
              />
            </div>

            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 11, marginBottom: 2 }}>
                Short Note / Message
              </div>
              <textarea
                rows={3}
                placeholder="Tell the restaurant why you are a good fit..."
                value={chefApplicationForm.notes}
                onChange={(e) =>
                  handleChefFormChange("notes", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  fontSize: 12,
                  resize: "vertical",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 8,
              }}
            >
              <button
                onClick={() => {
                  setShowChefApplyPanel(false);
                  setSelectedChefJob(null);
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: "1px solid #ccc",
                  backgroundColor: "#fafafa",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitChefApplication}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: "none",
                  backgroundColor: "#43a047",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
