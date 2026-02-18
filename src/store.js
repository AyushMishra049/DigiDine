// src/store.js
import { configureStore, createSlice } from "@reduxjs/toolkit";

// Initial restaurant list
const initialRestaurants = [
  {
    id: "R001",
    name: "Spice Villa",
    area: "Gomti Nagar",
    city: "Lucknow",
    cuisines: ["North Indian", "Chinese"],
  },
  {
    id: "R002",
    name: "Green Leaf Café",
    area: "Indira Nagar",
    city: "Lucknow",
    cuisines: ["Healthy", "Continental"],
  },
  {
    id: "R003",
    name: "Bombay Bites",
    area: "Andheri West",
    city: "Mumbai",
    cuisines: ["Street Food", "Maharashtrian"],
  },
  {
    id: "R004",
    name: "Royal Thali House",
    area: "SG Highway",
    city: "Ahmedabad",
    cuisines: ["Gujarati", "Rajasthani"],
  },
  {
    id: "R005",
    name: "Ocean Breeze Diner",
    area: "Marine Drive",
    city: "Mumbai",
    cuisines: ["Seafood", "Chinese"],
  },
  {
    id: "R006",
    name: "Urban Tadka",
    area: "Koramangala",
    city: "Bengaluru",
    cuisines: ["North Indian", "Mughlai"],
  },
];

const restaurantsSlice = createSlice({
  name: "restaurants",
  initialState: {
    list: initialRestaurants,
  },
  reducers: {
    addRestaurant(state, action) {
      // action.payload: { id, name, area, city, cuisines }
      state.list.push(action.payload);
    },
  },
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null, // { name, email, loggedInAt }
    restaurant: null, // { name, id, loggedInAt }
  },
  reducers: {
    setUserAuth(state, action) {
      state.user = action.payload;
    },
    setRestaurantAuth(state, action) {
      state.restaurant = action.payload;
    },
    logoutUser(state) {
      state.user = null;
    },
    logoutRestaurant(state) {
      state.restaurant = null;
    },
  },
});

export const { addRestaurant } = restaurantsSlice.actions;
export const {
  setUserAuth,
  setRestaurantAuth,
  logoutUser,
  logoutRestaurant,
} = authSlice.actions;

// ---- localStorage helpers ----
const loadState = () => {
  try {
    const serialized = localStorage.getItem("digiDineState");
    if (!serialized) return undefined;
    return JSON.parse(serialized);
  } catch (e) {
    return undefined;
  }
};

const saveState = (state) => {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem("digiDineState", serialized);
  } catch (e) {
    // ignore
  }
};

const preloadedState = loadState();

// ---- store ----
export const store = configureStore({
  reducer: {
    restaurants: restaurantsSlice.reducer,
    auth: authSlice.reducer,
  },
  preloadedState,
});

store.subscribe(() => {
  const state = store.getState();
  saveState({
    restaurants: state.restaurants,
    auth: state.auth,
  });
});
