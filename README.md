Aciculate
=========

What even is this?
------------------

TL;DR It's a calendar app.

Yeah, but why?
--------------

Years ago I designed an algorithm to tile appointments on a calendar in an aesthetic way, well I'm implementing it in Rust now and compiling to WASM. Figured I'd make a nice monorepo for everything, and build out some other nicities I've always wanted to implement myself in TypeScript. May also implement the solution in Go and AssemnlyScript just as a fun exercise to compare WASM execution times cause why not?

So what all's in here then?
---------------------------

A lot. Most things are built from scratch, just for fun / challenge.

1. General Purpose + AOP
    1. Dependency Injection Framework
        - Using decorators + reflect-metadata to mark dependencies with Symbol tokens
        - Build a Directed Acyclic Graph based on the dependency chain and topologically sort it
        - Construct the depdency chain from the bottom up
    2. Backend HTTP Controller Framework
        - Using decorators + reflect-metadata + Depdendency Injection Framework
        - Consumes an HTTP Context
            - HTTP Request object
            - A method for creating an HTTP Response
    3. Backend Logging
    4. Frontend Logging
    5. Database ORM
    6. Frontend Router
    7. Frontend Framework
        - Built on top of Native Web Components
    8. UI Component Library
        - Themeable using CSS variables + public API
    9. Custom JSON Serialize / Deserialize methods (AJSON)
        - Supports Dates more elegantly
        - Supports circular references
        - Supports BigInt
        - Supports NaN
        - Supports Infinity
        - Supports undefined
    10. Generic JavaScript Utilities
        - Deep Copy
        - Deep Equals
        - Directed Acyclic Graph
        - etc
2. Authentication API
    - Signs JWTs with a secret per user
    - Tokens can be revoked at the followings levels
      - Application Level (e.g. All Users)
      - Organization Level (e.g. All Users within an Organization)
      - User Level (e.g. A single User)
    - Token lifetime configurable through Enviornment Variable `ACICULATE_API_TOKEN_LIFESPAN_MINUTES`
    - Create / Manage Users
    - Create / Manage Organizations
    - Manage Users and their Role within an Organization
3. Logging API
4. Calendar API
    - Create Calendars within an Organization / or independently of one
    - Create Calendar Events for a given Galendar
    - View Calendars + Calendar Events
5. Calendar Tiling Algorithm (Consumable as a Library) implemented in
    - TypeScript 
    - AssemblyScript -> WASM
    - Rust -> WASM
    - Go -> WASM
    - Possibly others in the future
6. Calendar UI Component Library
    - Consumes the various outputs of the Calendar Tiling Algorithm allowing runtime comparison
    - Uses Frontend Framework to create intricate Calendar Components
      - Single User view
      - Multi-user week view (three-day, full week, work week)
      - Month View
      - Year View
    - Themeable using CSS variables + public API
7. Calendar App
    - Uses the Calendar UI Component Library
    - Uses Frontend Framework
    - Interacts with Authentication API, Calendar API and Logging API

Though there are a few things I opted to leave well enough alone on, those include,

1. Cryptographic stuff
    - Never a good idea
2. Database
    - PostgreSQL is a perfect angel, even if it's a little big for this task
    - Some other time I might make my own document style DB or something
3. Databse Connections
    - node-postrges is good enough for me
4. File reading
    - Node utils are good enogh for me
5. HTTP(S) Server
    - Node + Express are good enough for me
6. Front End Bundling
    - I like Webpack
7. Testing
    - I'm happy with Mocha

Things I would have used if I was just trying to build this as quickly as possible,

1. Invervsify (Dependency Injection)
2. Vue 3, Angular, React, Svelte (Frontend Framework + Frontend Router)
3. RxJS
4. TypeORM
5. lodash 

Perfect Angel Shoutouts
-----------------------

1. TypeScript
2. Rust
3. Go
4. AssemblyScript
5. Git
6. Docker
7. Node / NPM
8. VS Code
9. PostgreSQL
10. RxJS
