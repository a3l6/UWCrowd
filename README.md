# UWCrowd

**Live Bluetooth crowd-density tracking and AI recommendations for campus life.**

---

## Table of contents

* [Overview](#overview)
* [Inspiration](#inspiration)
* [Features](#features)
* [Architecture & components](#architecture--components)
* [Tech stack](#tech-stack)
* [Getting started](#getting-started)

  * [Prerequisites](#prerequisites)
  * [Quick start (local / dev)](#quick-start-local--dev)
* [Configuration](#configuration)
* [Privacy & ethics](#privacy--ethics)
* [Calibration & accuracy](#calibration--accuracy)
* [Usage](#usage)
* [Development workflow](#development-workflow)
* [Troubleshooting](#troubleshooting)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License & contact](#license--contact)

---

## Overview

UWCrowd measures people-density across campus buildings using live Bluetooth signals and transforms that data into actionable, privacy-first recommendations. The system powers real-time maps, alerts, and short-term forecasts so students and staff can find quiet study spots, avoid queues, and help facilities manage demand.

## Inspiration

Students and staff often asked: “How busy is that place right now?” UWCrowd started from that question — a lightweight, campus-scale system that gives people the confidence to make better decisions about when and where to go.

## Features

* Live Bluetooth-based density estimates per building / zone.
* AI-powered recommendations: quiet study spots, best arrival windows, lower-congestion routes.
* Short-term forecasting (e.g. 15–60 minutes ahead).
* Mobile/web UI with map and building dashboards.
* Alerts and scheduled insights (optional).
* Privacy-first design: no persistent identity tracking, configurable retention.

## Architecture & components

1. **Edge Receivers (Bluetooth scanners)** — Small devices deployed in buildings that scan for anonymized BLE signals and emit short telemetry.
2. **Local Aggregation Nodes** — Optional on-site aggregators that smooth, filter, and batch telemetry before sending minimal data to the cloud.
3. **Cloud Backend** — Ingest API, processing pipeline, storage (time-series + relational), and model-serving endpoints.
4. **AI Recommender** — Models that convert density and temporal patterns into human-friendly recommendations and short-term forecasts.
5. **Frontend** — Web and mobile clients that display live maps, dashboards, and receive push notifications.
6. **Admin & Ops** — Dashboards for calibration, device health, and system metrics.

Diagram (high-level): `Edge Receivers -> Aggregators -> Cloud Ingest -> Processing & Models -> API -> Frontend`

## Tech stack (example)

* Edge: Raspberry Pi / Linux scanners, BlueZ, Python (bleak/pybluez)
* Messaging: MQTT / HTTPS for telemetry
* Backend: Node.js / Python (FastAPI) microservices
* Storage: PostgreSQL (metadata), TimescaleDB / InfluxDB (time-series), Redis (caching)
* ML: TensorFlow or PyTorch serving short-term predictors
* Frontend: React + React Native for mobile
* Deployment: Docker, Kubernetes (optional)

> These choices are examples — swap in technologies that match your infra and team skills.

## Getting started

### Prerequisites

* A machine for the backend (local dev or cloud).
* At least one Bluetooth scanning device (dev: laptop with BLE or Raspberry Pi).
* Docker and Docker Compose for local development.
* Node.js and/or Python (depending on services you plan to run locally).

### Quick start (local / dev)

1. Clone the repo:

```bash
git clone https://github.com/your-org/uwcrowd.git
cd uwcrowd
```

2. Copy example env files and update secrets:

```bash
cp .env.example .env
# edit .env to set DB, MQTT, and API keys
```

3. Start services with Docker Compose (development):

```bash
docker compose up --build
```

4. Start a dev edge scanner (example Python script) on a laptop or Pi to emit test telemetry. See `/edge/README.md` for scanner examples.
5. Open the frontend at `http://localhost:3000` (or the URL printed by the compose logs).

## Configuration

Key options you’ll tune:

* **scan\_interval** — how often BLE scans run on the edge device (e.g. 5–30s).
* **aggregation\_window** — how telemetry is bucketed before upload (e.g. 30s, 1min).
* **privacy\_retention\_days** — how long raw telemetry is kept.
* **anonymization** — salt/pepper settings if using ephemeral hashing on edge.

These live in `.env` and in the edge device config files.

## Privacy & ethics

* **No persistent IDs**: we never store or expose device identifiers that can be linked to individuals.
* **Ephemeral hashing & salts**: identifiers are hashed with rotating salts at the edge.
* **Minimal retention**: raw telemetry is kept only as long as necessary for smoothing and model training.
* **Transparency**: provide campus opt-out information and public documentation about what we collect.

If you plan to deploy on a campus network, consult legal/facilities/ethics teams and follow local policies.

## Calibration & accuracy

Bluetooth signals vary by phone model, pocketing, and environment. Tips:

* Run manual spot-checks (head counts) to create calibration factors per building.
* Use smoothing windows and outlier filters at aggregation.
* Tune models with labeled days (exam days vs. regular days) to learn patterns.

## Usage

* **Students**: open the app to see which buildings are quiet now; get suggested study rooms.
* **Staff**: dashboards for building load and alerts.
* **Facilities**: use forecasts for staffing and opening extra study spaces.

## Development workflow

* Branch from `main` for features.
* Run linters and unit tests before pushing.
* Use `docker compose` for local integration tests.

Helpful commands (examples):

```bash
# build backend service
docker compose build backend
# run tests
docker compose run backend pytest
```

## Troubleshooting

* **Edge device not sending telemetry**: check Bluetooth adapter status, service logs, and network connectivity.
* **Counts seem too low/high**: verify scan intervals and check for duplicate receivers in the same zone.
* **Frontend shows stale data**: confirm backend ingest and websocket/push connections are healthy.

## Roadmap (what's next)

* Expand coverage to more buildings and transport hubs.
* Improve forecasting horizon (15–60 minutes).
* Add personalization (study preferences) while preserving anonymity.
* Integrate with campus timetables and apps.
* Partner with facilities for dynamic resource allocation.

## Contributing

We welcome contributions. Please:

1. Open an issue to discuss larger changes.
2. Submit small, focused PRs with tests where applicable.
3. Follow the code of conduct in `CODE_OF_CONDUCT.md`.

## License & contact

UWCrowd is released under the MIT License.
For questions, contact the team lead: `team@uwcrowd.example` or open an issue in this repository.

---

Thanks for checking out UWCrowd — if you want a short README for GitHub, a feature-focused one-pager for campus leadership, or a privacy-first FAQ to publish, tell me which and I’ll create it.
