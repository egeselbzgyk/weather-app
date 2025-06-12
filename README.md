# Wetter-App - Cloud-Native Microservice

Eine cloud-native Microservice-Anwendung zur Erfassung und Anzeige aktueller Wetterdaten.

## Projektübersicht

Bevor mit der eigentlichen Entwicklung begonnen wird, wurden die folgenden Aspekte berücksichtigt:

### Komponenten-Interaktion und Kommunikation

Die Anwendung besteht aus mehreren Komponenten, die über definierte APIs miteinander kommunizieren:

#### Client-Service Kommunikation:

- **Frontend ↔ Backend**: HTTP/REST-API über Port 3001
- **Backend ↔ PocketBase**: HTTP-Datenbankzugriff über Port 8090
- **Backend ↔ Collector Service**: HTTP-API für Collector-Management über Port 3002
- **Collector Service ↔ OpenWeatherMap API**: Externe HTTP-API für Wetterdaten

#### Service-zu-Service Kommunikation:

- Alle Services kommunizieren über RESTful HTTP-APIs
- JSON als Datenformat für alle API-Aufrufe
- Event-basierte Architektur für Datensammlung
- Asynchrone Verarbeitung von Wetterdatenabfragen

### Architektur

#### Microservice-Architektur:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │────│   Backend   │────│ Collector   │
│  (Svelte)   │    │ (Express)   │    │  Service    │
└─────────────┘    └─────────────┘    └─────────────┘
                            │                   │
                    ┌─────────────┐    ┌─────────────┐
                    │ PocketBase  │    │OpenWeatherMap│
                    │ (Database)  │    │     API     │
                    └─────────────┘    └─────────────┘
```

#### Komponentenbeschreibung:

- **Frontend (Svelte)**: Benutzeroberfläche für Wetteranzeige
- **Backend (Express)**: Management-API für Collector-Services und Datenabfrage
- **Collector Service (Node.js)**: Microservice für Wetterdatenerfassung
- **PocketBase**: NoSQL-Datenbank für Datenspeicherung
- **OpenWeatherMap API**: Externe Datenquelle für Wetterdaten

### Schneller Produktionseinsatz

#### CI/CD Pipeline mit GitLab

Die Anwendung nutzt GitLab CI/CD (git.thm.de) für automatisierte Bereitstellung:

##### Pipeline-Stufen:

1. **Build**: Erstellen aller Service-Container
2. **Test**: Ausführung von Unit- und Integrationstests
3. **Security**: Sicherheitsscans mit SonarQube
4. **Deploy**: Automatische Bereitstellung in Produktion

##### Deployment-Strategien:

- **Docker-Container**: Alle Services sind containerisiert
- **Docker Compose**: Lokale Entwicklung und Testing
- **Kubernetes**: Produktionsbereitstellung (skalierbar)
- **Environment Variables**: Konfiguration über Umgebungsvariablen

## Installation und Entwicklung

### Voraussetzungen

- Node.js (v18+)
- OpenWeatherMap API-Schlüssel

### Lokale Entwicklungsumgebung

1. **Repository klonen:**

```bash
git clone [repository-url]
cd weather-app
```

2. **Abhängigkeiten installieren:**

```bash
cd frontend ; npm install
cd ../backend ; npm install
cd ../collector-service ; npm install
```

3. **Umgebung konfigurieren:**

```bash
cp .env-example .env
# OpenWeatherMap API-Schlüssel in .env hinzufügen
```

4. **Services starten:**

```bash
# Terminal 1: PocketBase-Datenbank
cd pocketbase ; ./pocketbase serve

# Terminal 2: Backend-Service
cd backend ; npm run dev

# Terminal 3: Collector-Service
cd collector-service ; npm run dev

# Terminal 4: Frontend
cd frontend ; npm run dev
```

### Docker-Setup für Produktion

```bash
cp .env-example .env
# API-Schlüssel konfigurieren
docker-compose up -d
```

## API-Spezifikation

### Backend-API (Port 3001)

- `GET /api/collectors` - Aktive Collectors auflisten
- `POST /api/collectors` - Neuen Collector starten
- `DELETE /api/collectors/:id` - Collector stoppen
- `GET /api/weather/:location` - Wetterdaten abrufen
- `GET /api/locations` - Alle Standorte abrufen

### Collector-Service-API (Port 3002)

- `POST /collect` - Datensammlung starten
- `DELETE /collect/:id` - Sammlung stoppen
- `GET /collectors` - Aktive Collectors auflisten

## Technologie-Stack

### Frontend

- **Framework**: Svelte/SvelteKit
- **Styling**: CSS3, responsive Design
- **State Management**: Svelte Stores

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **API**: RESTful Design

### Datenbank

- **System**: PocketBase (NoSQL)
- **Features**: Real-time Updates, Admin-Interface

### DevOps

- **CI/CD**: GitLab CI/CD Pipeline
- **Code-Qualität**: SonarQube Integration

### Skalierung

- Horizontale Skalierung über Kubernetes
- Load Balancing zwischen Service-Instanzen
- Database Connection Pooling
- Caching-Strategien für API-Aufrufe

## Dokumentation und Wartung

### Code-Dokumentation

- Inline-Kommentare für komplexe Logik
- API-Dokumentation mit OpenAPI/Swagger
- README-Dateien in jedem Service-Verzeichnis
- Architektur-Diagramme und Flowcharts

### Testing

- Unit Tests für alle Services
- Integration Tests für API-Endpunkte
- End-to-End Tests für kritische User Journeys
- Performance Tests für Lastanalyse

## GitLab CI/CD Integration

Die Anwendung nutzt GitLab (git.thm.de) für:

- Versionskontrolle und Code-Reviews
- Automatisierte Build- und Test-Pipelines
- Container Registry für Docker Images
- Deployment-Automatisierung
- Issue Tracking und Projektmanagement

### Pipeline-Konfiguration

Siehe `.gitlab-ci.yml` für detaillierte Pipeline-Konfiguration und Deployment-Strategien.
