# H2C_4x4 – AgriVision (Monorepo)

Full‑stack project that helps farmers with crop disease detection, crop recommendation, GIS‑assisted weather intelligence, and market price insights.

This repository contains a React (Vite) frontend and multiple Python microservices for different AI features:

- Frontend (React + Vite) in `src/`
- Crop Disease detection (YOLOv8) in `Crop_Disease/`
- Crop Recommendation (Random Forest + Gradient Boosting) in `Crop_Recommendation/`
- GIS weather analytics and forecasting (PyTorch LSTM + Open‑Meteo) in `GIS/`
- Market analysis and forecast (SARIMAX) in `market/`


## Repository structure

- `src/` – React app (Vite). UI and calls to backend services.
- `Crop_Disease/` – Flask server using Ultralytics YOLOv8 to detect crop diseases from images.
- `Crop_Recommendation/` – Flask server that recommends crops based on soil report and seasonal forecast.
- `GIS/` – Flask server that fetches historical weather, forecasts with LSTM, and exports a graph.
- `market/` – Flask server that analyzes nearby market prices and forecasts trends.
- `public/`, `index.html`, `vite.config.js` – Frontend scaffolding.


## Prerequisites

- Node.js 18+ and npm
- Python 3.10–3.12 (the existing virtualenvs use 3.12)
- Git

Optional but recommended:

- Create a dedicated virtual environment per Python service
- For YOLOv8 and PyTorch, install CPU or CUDA builds per your machine from pytorch.org


## Quick start (local development)

You’ll typically run 5 processes: the React app plus 4 Flask services. Open separate terminals for each.

### 1) Frontend (React + Vite)

Location: `./src`

1. Install dependencies
	 - Windows PowerShell
     
		 npm install
   
2. Configure Firebase (optional, if you use auth/db features)
	 - Create a `.env.local` (or `.env`) file at the repo root with:
     
		 VITE_FIREBASE_API_KEY=your_key
		 VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
		 VITE_FIREBASE_PROJECT_ID=your_project_id
		 VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
		 VITE_FIREBASE_MESSAGING_SENDER_ID=...
		 VITE_FIREBASE_APP_ID=...
   
3. Start the dev server (default http://localhost:5173)
   
		 npm run dev


### 2) Crop Disease service (YOLOv8)

Location: `./Crop_Disease`

- Installs: Flask, flask-cors, ultralytics, opencv-python, numpy, pillow, (PyTorch per ultralytics requirements)
- Default port: `5000`
- Endpoints:
	- `POST /getdiseases` – form-data field `image` (file). Returns JSON: `{ image_url, disease_name }`
	- `GET /result_image` – serves the last annotated image

Setup (PowerShell):

	python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install --upgrade pip
	pip install flask flask-cors ultralytics opencv-python pillow
	# Install PyTorch matching your system (CPU/CUDA) per https://pytorch.org/get-started/locally/
	python app.py

Important:

- Paths are now relative in `Crop_Disease/app.py`. Ensure `best.pt` is placed in `Crop_Disease/`. Uploaded images are saved under `Crop_Disease/uploads/`, and outputs are `Crop_Disease/result_image.jpg` and `Crop_Disease/result.txt`.
- CORS allows `http://localhost:5173` (Vite) and `https://ag-six.vercel.app/`.


### 3) Crop Recommendation service

Location: `./Crop_Recommendation`

- Installs: see `requirements.txt` (Flask, flask-cors, scikit-learn, pandas, numpy, matplotlib, requests, joblib, etc.)
- Default port: `8000`
- Data: `recommend_vision.csv` (required)
- Endpoints:
	- `GET /soil-data?nitrogen=...&phosphorus=...&potassium=...&magnesium=...&calcium=...&manganese=...&iron=...&copper=...&zinc=...&ph=...`
		- Returns a JSON object `{ status, recommendations }` where `recommendations` is a map of crop → "xx.xx%".
	- `POST /upload` – returns a generated PNG (utility/testing)

Setup (PowerShell):

	python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install --upgrade pip
	pip install -r requirements.txt
	python app.py

Notes:

- The service fetches seasonal data from Open‑Meteo, computes average temperature/humidity/rainfall, then scores crops using RandomForest + GradientBoosting affinity with min‑max scaling.


### 4) GIS weather service

Location: `./GIS`

- Installs: see `requirements.txt` (Flask, flask-cors, pandas, numpy, torch, rasterio, scikit‑learn, plotly, requests, etc.)
- Default port: `5500`
- Endpoint:
	- `GET /get_weather?lat=<float>&lon=<float>` → `{ avg_temperature, avg_humidity, avg_rainfall, weather_graph_path }`
	- Generates `output/weather.html` with interactive graphs

Setup (PowerShell):

	python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install --upgrade pip
	pip install -r requirements.txt
	# Install PyTorch matching your system per https://pytorch.org/get-started/locally/
	python main.py

Windows tip for rasterio/GDAL:

- If you encounter build errors, use prebuilt wheels (e.g., from Gohlke) or ensure GDAL is available. The provided `requirements.txt` should work on most setups, but binary deps can be finicky on Windows.


### 5) Market analysis service

Location: `./market`

- Installs: see `requirements.txt` (Flask, flask-cors, pandas, numpy, matplotlib, seaborn, statsmodels, etc.)
- Default port: `1111`
- Data:
	- CSVs under `market_data/` (per‑crop historical prices)
	- `market_lat_long.csv` (market coordinates)
- Endpoint:
	- `GET /get_market?lat=<float>&lon=<float>` → JSON with overall summary and `crop_summaries` array; also saves forecast plots to `output/` and a summary CSV.

Setup (PowerShell):

	python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install --upgrade pip
	pip install -r requirements.txt
	python market_flask.py


## Frontend ↔ Backend wiring (ports and files)

The UI calls specific localhost ports:

- Crop Recommendation: `http://localhost:8000/soil-data` (see `src/pages/Croppred.jsx` and `src/functions/aiconnect.js`)
- Crop Disease: `http://localhost:5000/getdiseases` (see `src/pages/Disease.jsx`)
- GIS: `src/functions/gis.js` points to `http://localhost:6000/get_data` (POST), but the Flask app exposes `GET /get_weather` on port `5500`.
	- Fix one of the following:
		1) Update `src/functions/gis.js` to call `http://localhost:5500/get_weather` with `GET` and `lat`, `lon` as query params; or
		2) Add a thin adapter service on port 6000 that forwards to the `GIS` service; or
		3) Change `GIS/main.py` to provide a compatible `POST /get_data` endpoint on 6000.
- Market: UI integration is not wired in the provided source, but the API runs at `http://localhost:1111/get_market` with `lat`, `lon`.

Cors origins are already allowed for `http://localhost:5173` and the deployed Vercel domain in the Flask apps that enforce CORS.


## Example requests

These examples assume the services are running locally on the default ports.

- Crop Disease (image upload)
	- POST form‑data field `image` to `http://localhost:5000/getdiseases`
- Crop Recommendation (soil report → crop scores)
	- GET `http://localhost:8000/soil-data?nitrogen=10&phosphorus=5&potassium=8&magnesium=3&calcium=7&manganese=2&iron=4&copper=1&zinc=1&ph=6.5`
- GIS weather stats
	- GET `http://localhost:5500/get_weather?lat=19.0760&lon=72.8777`
- Market analysis
	- GET `http://localhost:1111/get_market?lat=19.0760&lon=72.8777`


## Common issues and tips

- If `best.pt` is missing from `Crop_Disease/`, the disease service won’t start. Place the trained YOLOv8 weights there or update the `model_path` constant to a valid location.
- PyTorch installs vary by OS/GPU. Use the selector at pytorch.org for a compatible wheel (CPU builds work fine for these services).
- Rasterio/GDAL on Windows can require prebuilt binaries. If `pip install rasterio` fails, search for prebuilt wheels matching your Python version and platform.
- Endpoint mismatch for GIS: adjust `src/functions/gis.js` or `GIS/main.py` as noted above.
- If you change ports, also update allowed CORS origins in the Flask apps.


## Deployment notes

- Frontend can be built with `npm run build` and deployed as static assets (e.g., Vercel). Ensure all backend URLs are set to production.
- Each Python service can be deployed independently (Render, Railway, Fly.io, etc.). Expose HTTPS endpoints and update the frontend to use those URLs.
- Consider moving API base URLs to Vite env variables (e.g., `VITE_API_GIS_URL`) for easier environment switching.


## License

No license specified. If you plan to share or open‑source, add a LICENSE file.


