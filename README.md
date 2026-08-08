# Async Race 🏎️

**Score: 400 / 400 pts** — self-checked with the checklist below. The Overall Code Quality section (100 points) is left for the reviewer to assess, as the task asks.

**Deployed app: https://levani-async-race.netlify.app**

This is a single page application for managing a collection of cars, starting their engines and racing them against each other.

I built it with Angular 21 and TypeScript in strict mode. All requests to the server use `fetch` and promises.

---

## How to run it

The app is deployed at the link above, but it needs the mock server running on your machine:

```bash
git clone https://github.com/mikhama/async-race-api.git
cd async-race-api
npm install
npm start
```

The server runs on `http://127.0.0.1:3000`. After it starts, open the deployed link.

**Please use Chrome.** The deployed site uses HTTPS and calls `http://127.0.0.1:3000`. Chrome allows this because it trusts `127.0.0.1`, but some other browsers block it.

If you want to run the UI locally instead:

```bash
npm install
npm start
```

Then open `http://localhost:4200`.

## Scripts

| Script              | What it does                             |
| ------------------- | ---------------------------------------- |
| `npm start`         | Starts the dev server                    |
| `npm run build`     | Builds for production                    |
| `npm run lint`      | Runs ESLint with the Airbnb rules        |
| `npm run format`    | Formats the code with Prettier           |
| `npm run ci:format` | Checks formatting without changing files |

## Project structure

```
src/app/
├── core/
│   ├── constants/
│   │   └── api.constants.ts        all shared values, so there are no magic numbers
│   ├── models/
│   │   ├── car.model.ts            Car, NewCar
│   │   ├── engine.model.ts         EngineStatus, DriveResult
│   │   ├── paginated.model.ts      Paginated<T>
│   │   ├── race.model.ts           CarRaceStatus, CarRaceState, RaceWinner
│   │   └── winner.model.ts         Winner, WinnerView, sort types
│   └── services/
│       ├── api.service.ts          talks to the server
│       ├── garage-state.service.ts garage state
│       ├── race-state.service.ts   race state and animation
│       └── winners-state.service.ts winners state
└── features/
    ├── garage/                     garage view
    └── winners/                    winners view
```

I split the app into three layers:

**API layer.** `api.service.ts` is the only file that uses `fetch`. It builds the URLs, adds the headers, checks the response status and returns typed data.

**State layer.** Three services, all provided in root. Because of this the state stays alive when you switch between views. Every signal is private, and the public version is read-only, so only the service itself can change its own state.

**UI layer.** The components read from the state services and call their methods. They never call the API directly.

## How some parts work

**Finding the winner.** `Promise.any` gives me the first car that actually finishes. If a car's engine breaks, that attempt throws, so a broken car can never win the race. After that `Promise.allSettled` waits for the rest of the cars, so the race stays "active" until every car has stopped.

**Animation.** I use `requestAnimationFrame` to move the cars. The duration comes from the engine response: `distance / velocity`. Every run gets a number, and if an old request comes back after the car was stopped or restarted, I ignore it. Without this, a stopped car could suddenly jump to the finish line.

**Sorting.** The winners are sorted by the server using `_sort` and `_order`, so the sorting works on all winners and not only on the 10 rows shown on the page.

**Total count.** The number of cars and winners comes from the `X-Total-Count` header, not from the length of the array.

---

# Checklist 400 / 400 pts

## 🚀 UI Deployment

- [x] **Deployment Platform:** deployed on Netlify — https://levani-async-race.netlify.app

## ✅ Requirements to Commits and Repository

- [x] **Commit guidelines compliance** — all commits use Conventional Commits (`init`, `feat`, `fix`, `chore`, `docs`) in present tense
- [x] **Checklist included in README.md**
- [x] **Score calculation** — 400 / 400, written at the top
- [x] **UI Deployment link in README.md** — at the top, next to the score

## Basic Structure (80 points)

- [x] **Two Views (10 points)** — "Garage" and "Winners"
- [x] **Garage View Content (30 points)**
  - [x] Name of view
  - [x] Car creation and editing panel
  - [x] Race control panel
  - [x] Garage section
- [x] **Winners View Content (10 points)**
  - [x] Name of view
  - [x] Winners table
  - [x] Pagination
- [x] **Persistent State (30 points)** — the page number, the sort field and order, the selected car and both input fields are kept in root services, so they stay the same when you switch views

## Garage View (90 points)

- [x] **Car Creation And Editing Panel. CRUD Operations (20 points)** — empty names and names that are too long are not accepted. When a car is deleted, it is also deleted from the winners table
- [x] **Color Selection (10 points)** — a colour picker, and the chosen colour is shown on the car image next to its name
- [x] **Random Car Creation (20 points)** — 100 cars per click, names made from 10 brands and 10 models, random colours
- [x] **Car Management Buttons (10 points)** — Select and Remove next to every car
- [x] **Pagination (10 points)** — 7 cars per page
- [x] **EXTRA POINTS (20 points)**
  - [x] **Empty Garage** — shows "No cars in the garage"
  - [x] **Empty Garage Page** — if you remove the last car on a page, you go back to the previous page

## 🏆 Winners View (50 points)

- [x] **Display Winners (15 points)** — after a car wins it appears in the winners table
- [x] **Pagination for Winners (10 points)** — 10 winners per page, and the numbers continue on the next page
- [x] **Winners Table (15 points)** — №, car image in its colour, name, wins and best time. If a car wins again, the wins go up and the time is saved only if it is faster
- [x] **Sorting Functionality (10 points)** — sorting by wins and by best time, ascending and descending, done by the server on all winners

## 🚗 Race (170 points)

- [x] **Start Engine Animation (20 points)** — the UI waits for the velocity, animates the car and then sends the drive request. If the server answers with 500, the animation stops where the car is
- [x] **Stop Engine Animation (20 points)** — the UI waits for the answer and the car goes back to its start position
- [x] **Responsive Animation (30 points)** — the track uses percentages, and I tested it at 500px
- [x] **Start Race Button (10 points)** — starts all cars on the current page at the same time
- [x] **Reset Race Button (15 points)** — puts all cars back to their start positions
- [x] **Winner Announcement (5 points)** — a banner shows the name of the car that won and its time
- [x] **Button States (20 points)** — the start button is disabled while the car is driving, and the stop button is disabled while the car is at its start position
- [x] **Actions during the race (50 points)** — while a race is running, creating, editing, selecting, removing, generating cars, changing the page and the single engine buttons are all disabled. They become active again only after every car has stopped

## 🎨 Prettier and ESLint Configuration (10 points)

- [x] **Prettier Setup (5 points)** — `format` and `ci:format` scripts in `package.json`
- [x] **ESLint Configuration (5 points)** — Airbnb style guide, a `lint` script, `strict` and `noImplicitAny` turned on in `tsconfig.json`, a 40 line limit for functions and no magic numbers

## 🌟 Overall Code Quality (100 points)

Left for the reviewer to assess. The task says to skip this section during self-check.
